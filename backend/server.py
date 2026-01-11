from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret_key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7

security = HTTPBearer(auto_error=False)

app = FastAPI(title="Joboost API")
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    subscription_plan: str = "free"
    ai_credits: int = 1
    ai_cv_credits: int = 1
    ai_letter_credits: int = 1
    spontaneous_credits: int = 5
    created_at: Optional[str] = None

class SpontaneousSearchRequest(BaseModel):
    location: str
    rome: str = "M1805"
    radius: int = 10

class SpontaneousSendRequest(BaseModel):
    company_ids: List[str]

class ProfileExperience(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    company: str
    start_date: str
    end_date: Optional[str] = None
    current: bool = False
    description: str

class ProfileEducation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    degree: str
    institution: str
    start_date: str
    end_date: Optional[str] = None
    description: Optional[str] = None

class ProfileCreate(BaseModel):
    user_id: str
    title: Optional[str] = None
    summary: Optional[str] = None
    experiences: List[ProfileExperience] = []
    education: List[ProfileEducation] = []
    skills: List[str] = []
    languages: List[Dict[str, str]] = []
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None

class ApplicationCreate(BaseModel):
    company_name: str
    job_title: str
    job_url: Optional[str] = None
    job_description: Optional[str] = None
    status: str = "todo"
    notes: Optional[str] = None
    deadline: Optional[str] = None
    salary_range: Optional[str] = None
    location: Optional[str] = None

class ApplicationUpdate(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    job_url: Optional[str] = None
    job_description: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    deadline: Optional[str] = None
    salary_range: Optional[str] = None
    location: Optional[str] = None

class AIGenerateRequest(BaseModel):
    application_id: str
    generation_type: str  # "cover_letter" or "cv"

class CheckoutRequest(BaseModel):
    plan: str
    origin_url: str

# ============ AUTH HELPERS ============

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), request: Request = None):
    token = None
    
    # Try to get token from Authorization header
    if credentials:
        token = credentials.credentials
    
    # Fallback to cookie
    if not token and request:
        token = request.cookies.get("session_token")
    
    if not token:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token invalide")
        
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
        
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide ou expiré")

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=Dict[str, Any])
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pwd = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": hashed_pwd,
        "picture": None,
        "subscription_plan": "free",
        "ai_credits": 1,
        "ai_cv_credits": 1,
        "ai_letter_credits": 1,
        "spontaneous_credits": 5,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "onboarding_completed": False
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_access_token({"user_id": user_id, "email": user_data.email})
    
    return {
        "token": token,
        "user": {
            "user_id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "subscription_plan": "free",
            "ai_credits": 1,
            "ai_cv_credits": 1,
            "ai_letter_credits": 1,
            "spontaneous_credits": 5,
            "onboarding_completed": False
        }
    }

@api_router.post("/auth/login", response_model=Dict[str, Any])
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    if not verify_password(user_data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    token = create_access_token({"user_id": user["user_id"], "email": user["email"]})
    
    return {
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user.get("name", ""),
            "picture": user.get("picture"),
            "subscription_plan": user.get("subscription_plan", "free"),
            "ai_credits": user.get("ai_credits", 1),
            "ai_cv_credits": user.get("ai_cv_credits", 1),
            "ai_letter_credits": user.get("ai_letter_credits", 1),
            "spontaneous_credits": user.get("spontaneous_credits", 5),
            "onboarding_completed": user.get("onboarding_completed", False)
        }
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        user_id=current_user["user_id"],
        email=current_user["email"],
        name=current_user.get("name", ""),
        picture=current_user.get("picture"),
        subscription_plan=current_user.get("subscription_plan", "free"),
        ai_credits=current_user.get("ai_credits", 1),
        ai_cv_credits=current_user.get("ai_cv_credits", 1),
        ai_letter_credits=current_user.get("ai_letter_credits", 1),
        spontaneous_credits=current_user.get("spontaneous_credits", 5),
        created_at=current_user.get("created_at")
    )

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("session_token")
    return {"message": "Déconnexion réussie"}

# Emergent Google OAuth session endpoint
@api_router.get("/auth/session")
async def handle_session(request: Request, response: Response):
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID manquant")
    
    try:
        async with httpx.AsyncClient() as client_http:
            resp = await client_http.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Session invalide")
            
            session_data = resp.json()
            
            # Find or create user
            existing_user = await db.users.find_one({"email": session_data["email"]}, {"_id": 0})
            
            if existing_user:
                user_id = existing_user["user_id"]
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {
                        "name": session_data.get("name", existing_user.get("name")),
                        "picture": session_data.get("picture"),
                        "last_login": datetime.now(timezone.utc).isoformat()
                    }}
                )
            else:
                user_id = f"user_{uuid.uuid4().hex[:12]}"
                user_doc = {
                    "user_id": user_id,
                    "email": session_data["email"],
                    "name": session_data.get("name", ""),
                    "picture": session_data.get("picture"),
                    "subscription_plan": "free",
                    "ai_credits": 1,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "onboarding_completed": False
                }
                await db.users.insert_one(user_doc)
            
            # Create JWT token
            token = create_access_token({"user_id": user_id, "email": session_data["email"]})
            
            # Set cookie
            response.set_cookie(
                key="session_token",
                value=token,
                httponly=True,
                secure=True,
                samesite="none",
                max_age=JWT_EXPIRATION_HOURS * 3600,
                path="/"
            )
            
            user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
            
            return {
                "token": token,
                "user": {
                    "user_id": user_id,
                    "email": user["email"],
                    "name": user.get("name", ""),
                    "picture": user.get("picture"),
                    "subscription_plan": user.get("subscription_plan", "free"),
                    "ai_credits": user.get("ai_credits", 1),
                    "onboarding_completed": user.get("onboarding_completed", False)
                }
            }
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Erreur de session: {str(e)}")

# ============ PROFILE ROUTES ============

@api_router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    profile = await db.profiles.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    if not profile:
        return {"profile": None}
    return {"profile": profile}

@api_router.post("/profile")
async def create_or_update_profile(profile_data: ProfileCreate, current_user: dict = Depends(get_current_user)):
    profile_dict = profile_data.model_dump()
    profile_dict["user_id"] = current_user["user_id"]
    profile_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    existing = await db.profiles.find_one({"user_id": current_user["user_id"]})
    
    if existing:
        await db.profiles.update_one(
            {"user_id": current_user["user_id"]},
            {"$set": profile_dict}
        )
    else:
        profile_dict["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.profiles.insert_one(profile_dict)
    
    # Mark onboarding as complete
    await db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": {"onboarding_completed": True}}
    )
    
    profile = await db.profiles.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    return {"profile": profile, "message": "Profil enregistré avec succès"}

# ============ APPLICATIONS ROUTES ============

@api_router.get("/applications")
async def get_applications(current_user: dict = Depends(get_current_user)):
    applications = await db.applications.find(
        {"user_id": current_user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    return {"applications": applications}

@api_router.post("/applications")
async def create_application(app_data: ApplicationCreate, current_user: dict = Depends(get_current_user)):
    app_id = f"app_{uuid.uuid4().hex[:12]}"
    
    app_dict = app_data.model_dump()
    app_dict["application_id"] = app_id
    app_dict["user_id"] = current_user["user_id"]
    app_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    app_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    app_dict["generated_cover_letter"] = None
    app_dict["generated_cv"] = None
    
    await db.applications.insert_one(app_dict)
    
    application = await db.applications.find_one({"application_id": app_id}, {"_id": 0})
    return {"application": application, "message": "Candidature créée avec succès"}

@api_router.get("/applications/{application_id}")
async def get_application(application_id: str, current_user: dict = Depends(get_current_user)):
    application = await db.applications.find_one(
        {"application_id": application_id, "user_id": current_user["user_id"]},
        {"_id": 0}
    )
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    return {"application": application}

@api_router.put("/applications/{application_id}")
async def update_application(application_id: str, app_data: ApplicationUpdate, current_user: dict = Depends(get_current_user)):
    existing = await db.applications.find_one(
        {"application_id": application_id, "user_id": current_user["user_id"]}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    update_dict = {k: v for k, v in app_data.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.applications.update_one(
        {"application_id": application_id},
        {"$set": update_dict}
    )
    
    application = await db.applications.find_one({"application_id": application_id}, {"_id": 0})
    return {"application": application, "message": "Candidature mise à jour"}

@api_router.delete("/applications/{application_id}")
async def delete_application(application_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.applications.delete_one(
        {"application_id": application_id, "user_id": current_user["user_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    return {"message": "Candidature supprimée"}

@api_router.patch("/applications/{application_id}/status")
async def update_application_status(application_id: str, status: str, current_user: dict = Depends(get_current_user)):
    valid_statuses = ["todo", "applied", "interview", "offer", "rejected"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Statut invalide")
    
    result = await db.applications.update_one(
        {"application_id": application_id, "user_id": current_user["user_id"]},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    application = await db.applications.find_one({"application_id": application_id}, {"_id": 0})
    return {"application": application}

# ============ AI GENERATION ROUTES ============

@api_router.post("/ai/generate")
async def generate_ai_content(request: AIGenerateRequest, current_user: dict = Depends(get_current_user)):
    # Determine which credit to check
    credit_field = "ai_letter_credits" if request.generation_type == "cover_letter" else "ai_cv_credits"
    current_credits = current_user.get(credit_field, 0)
    
    # Check credits (ultra plan has 99999)
    if current_user.get("subscription_plan") not in ["pro", "ultra"] and current_credits <= 0:
        raise HTTPException(status_code=403, detail=f"Crédits {request.generation_type} épuisés. Passez au plan Pro pour plus de générations.")
    
    # Get application
    application = await db.applications.find_one(
        {"application_id": request.application_id, "user_id": current_user["user_id"]},
        {"_id": 0}
    )
    if not application:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    
    # Get user profile
    profile = await db.profiles.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=400, detail="Veuillez d'abord compléter votre profil maître")
    
    # Prepare prompt
    job_description = application.get("job_description", "Non spécifiée")
    company_name = application.get("company_name", "")
    job_title = application.get("job_title", "")
    
    # Format profile data
    experiences_text = ""
    for exp in profile.get("experiences", []):
        experiences_text += f"- {exp['title']} chez {exp['company']} ({exp['start_date']} - {exp.get('end_date', 'Présent')}): {exp['description']}\n"
    
    education_text = ""
    for edu in profile.get("education", []):
        education_text += f"- {edu['degree']} à {edu['institution']} ({edu['start_date']} - {edu.get('end_date', '')})\n"
    
    skills_text = ", ".join(profile.get("skills", []))
    
    if request.generation_type == "cover_letter":
        system_prompt = """Tu es un expert RH français spécialisé dans la rédaction de lettres de motivation professionnelles et convaincantes.
Tu dois rédiger une lettre de motivation en français, parfaitement structurée, qui:
- Fait le pont entre le parcours du candidat et le poste visé
- Met en avant les expériences et compétences les plus pertinentes
- Est professionnelle mais authentique
- Respecte le format standard français (objet, formules de politesse)
- Fait environ 300-400 mots"""

        user_prompt = f"""Rédige une lettre de motivation pour le poste suivant:

POSTE: {job_title}
ENTREPRISE: {company_name}
DESCRIPTION DU POSTE:
{job_description}

PROFIL DU CANDIDAT:
Nom: {current_user.get('name', 'Le candidat')}
Titre: {profile.get('title', '')}
Résumé: {profile.get('summary', '')}

EXPÉRIENCES PROFESSIONNELLES:
{experiences_text}

FORMATION:
{education_text}

COMPÉTENCES: {skills_text}

Rédige maintenant une lettre de motivation percutante et personnalisée."""

    else:  # CV
        system_prompt = """Tu es un expert RH français spécialisé dans l'optimisation de CV.
Tu dois créer un CV structuré en texte qui:
- Met en avant les éléments les plus pertinents pour le poste
- Est clair et bien organisé
- Utilise des verbes d'action
- Quantifie les réalisations quand possible"""

        user_prompt = f"""Crée un CV optimisé pour le poste suivant:

POSTE VISÉ: {job_title} chez {company_name}

INFORMATIONS DU CANDIDAT:
Nom: {current_user.get('name', '')}
Email: {current_user.get('email', '')}
Téléphone: {profile.get('phone', '')}
Localisation: {profile.get('location', '')}
LinkedIn: {profile.get('linkedin_url', '')}

Titre professionnel: {profile.get('title', '')}
Résumé: {profile.get('summary', '')}

EXPÉRIENCES:
{experiences_text}

FORMATION:
{education_text}

COMPÉTENCES: {skills_text}

Génère un CV structuré et optimisé pour cette candidature."""

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=f"joboost_{current_user['user_id']}_{request.application_id}",
            system_message=system_prompt
        )
        chat.with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=user_prompt)
        generated_content = await chat.send_message(user_message)
        
        # Save generated content
        field_name = "generated_cover_letter" if request.generation_type == "cover_letter" else "generated_cv"
        await db.applications.update_one(
            {"application_id": request.application_id},
            {"$set": {field_name: generated_content, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Deduct specific credit if not Ultra
        if current_user.get("subscription_plan") != "ultra":
            credit_field = "ai_letter_credits" if request.generation_type == "cover_letter" else "ai_cv_credits"
            await db.users.update_one(
                {"user_id": current_user["user_id"]},
                {"$inc": {credit_field: -1, "ai_credits": -1}}
            )
        
        return {
            "content": generated_content,
            "type": request.generation_type,
            "message": "Contenu généré avec succès"
        }
        
    except Exception as e:
        logging.error(f"AI Generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération: {str(e)}")

# ============ PAYMENT ROUTES ============

# 3 Plans with separate credits
PLANS = {
    "free": {
        "amount": 0,
        "name": "Gratuit",
        "ai_cv_credits": 1,
        "ai_letter_credits": 1,
        "spontaneous_credits": 5
    },
    "pro_monthly": {
        "amount": 9.99,
        "name": "Pro Mensuel",
        "ai_cv_credits": 100,
        "ai_letter_credits": 100,
        "spontaneous_credits": 500
    },
    "pro_yearly": {
        "amount": 99.99,
        "name": "Pro Annuel",
        "ai_cv_credits": 100,
        "ai_letter_credits": 100,
        "spontaneous_credits": 500
    },
    "ultra_monthly": {
        "amount": 14.99,
        "name": "Ultra Mensuel",
        "ai_cv_credits": 99999,
        "ai_letter_credits": 99999,
        "spontaneous_credits": 99999
    },
    "ultra_yearly": {
        "amount": 149.99,
        "name": "Ultra Annuel",
        "ai_cv_credits": 99999,
        "ai_letter_credits": 99999,
        "spontaneous_credits": 99999
    }
}

@api_router.post("/payments/checkout")
async def create_checkout(checkout_data: CheckoutRequest, request: Request, current_user: dict = Depends(get_current_user)):
    if checkout_data.plan not in PLANS:
        raise HTTPException(status_code=400, detail="Plan invalide")
    
    plan = PLANS[checkout_data.plan]
    
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
        
        api_key = os.environ.get('STRIPE_API_KEY')
        host_url = checkout_data.origin_url
        webhook_url = f"{str(request.base_url)}api/webhook/stripe"
        
        stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
        
        success_url = f"{host_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{host_url}/pricing"
        
        checkout_request = CheckoutSessionRequest(
            amount=plan["amount"],
            currency="eur",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": current_user["user_id"],
                "plan": checkout_data.plan,
                "source": "joboost"
            }
        )
        
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create payment transaction record
        transaction_id = f"tx_{uuid.uuid4().hex[:12]}"
        await db.payment_transactions.insert_one({
            "transaction_id": transaction_id,
            "user_id": current_user["user_id"],
            "session_id": session.session_id,
            "amount": plan["amount"],
            "currency": "eur",
            "plan": checkout_data.plan,
            "status": "pending",
            "payment_status": "initiated",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"url": session.url, "session_id": session.session_id}
        
    except Exception as e:
        logging.error(f"Checkout error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur de paiement: {str(e)}")

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, current_user: dict = Depends(get_current_user)):
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        
        api_key = os.environ.get('STRIPE_API_KEY')
        stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
        
        status = await stripe_checkout.get_checkout_status(session_id)
        
        # Update transaction
        if status.payment_status == "paid":
            transaction = await db.payment_transactions.find_one({"session_id": session_id})
            if transaction and transaction.get("payment_status") != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": {
                        "status": "completed",
                        "payment_status": "paid",
                        "completed_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                
                # Upgrade user to Pro/Ultra
                transaction = await db.payment_transactions.find_one({"session_id": session_id})
                plan_id = transaction.get("plan", "pro_monthly") if transaction else "pro_monthly"
                plan_credits = PLANS.get(plan_id, PLANS["pro_monthly"])
                
                await db.users.update_one(
                    {"user_id": current_user["user_id"]},
                    {"$set": {
                        "subscription_plan": "ultra" if "ultra" in plan_id else "pro",
                        "ai_credits": plan_credits.get("ai_cv_credits", 100),
                        "ai_cv_credits": plan_credits.get("ai_cv_credits", 100),
                        "ai_letter_credits": plan_credits.get("ai_letter_credits", 100),
                        "spontaneous_credits": plan_credits.get("spontaneous_credits", 500)
                    }}
                )
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency
        }
        
    except Exception as e:
        logging.error(f"Payment status error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        api_key = os.environ.get('STRIPE_API_KEY')
        stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
        
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            metadata = webhook_response.metadata
            user_id = metadata.get("user_id")
            plan_id = metadata.get("plan", "pro_monthly")
            
            if user_id:
                # Get plan credits
                plan_credits = PLANS.get(plan_id, PLANS["pro_monthly"])
                
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {
                        "subscription_plan": "ultra" if "ultra" in plan_id else "pro",
                        "ai_credits": plan_credits.get("ai_cv_credits", 100),
                        "ai_cv_credits": plan_credits.get("ai_cv_credits", 100),
                        "ai_letter_credits": plan_credits.get("ai_letter_credits", 100),
                        "spontaneous_credits": plan_credits.get("spontaneous_credits", 500)
                    }}
                )
                
                await db.payment_transactions.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": {
                        "status": "completed",
                        "payment_status": "paid",
                        "completed_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
        
        return {"status": "processed"}
        
    except Exception as e:
        logging.error(f"Webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}

# ============ STATS ROUTES ============

@api_router.get("/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    applications = await db.applications.find(
        {"user_id": current_user["user_id"]},
        {"_id": 0, "status": 1}
    ).to_list(1000)
    
    stats = {
        "total": len(applications),
        "todo": sum(1 for a in applications if a.get("status") == "todo"),
        "applied": sum(1 for a in applications if a.get("status") == "applied"),
        "interview": sum(1 for a in applications if a.get("status") == "interview"),
        "offer": sum(1 for a in applications if a.get("status") == "offer"),
        "rejected": sum(1 for a in applications if a.get("status") == "rejected")
    }
    
    return {"stats": stats}

@api_router.get("/stats/timeline")
async def get_timeline(current_user: dict = Depends(get_current_user)):
    """Get timeline data for progress chart"""
    from collections import defaultdict
    
    applications = await db.applications.find(
        {"user_id": current_user["user_id"]},
        {"_id": 0, "status": 1, "created_at": 1, "updated_at": 1}
    ).to_list(1000)
    
    weekly = defaultdict(lambda: {"applied": 0, "interview": 0, "offer": 0, "todo": 0, "rejected": 0})
    
    for app in applications:
        date_str = app.get("created_at", "")[:10]  # Get YYYY-MM-DD
        if date_str:
            status = app.get("status", "todo")
            weekly[date_str][status] += 1
    
    timeline = [{"date": k, **v} for k, v in sorted(weekly.items())]
    return {"timeline": timeline}

# ============ SPONTANEOUS APPLICATIONS ROUTES ============

@api_router.post("/spontaneous/search")
async def search_spontaneous_companies(request: SpontaneousSearchRequest, current_user: dict = Depends(get_current_user)):
    """Search companies for spontaneous applications"""
    from lib.labonneboite import search_companies
    
    result = await search_companies(request.location, request.rome, request.radius)
    return result

@api_router.post("/spontaneous/send")
async def send_spontaneous_applications(request: SpontaneousSendRequest, current_user: dict = Depends(get_current_user)):
    """Send spontaneous applications (deducts credits)"""
    credits_needed = len(request.company_ids)
    current_credits = current_user.get("spontaneous_credits", 0)
    
    if current_credits < credits_needed:
        raise HTTPException(status_code=403, detail=f"Crédits insuffisants. Vous avez {current_credits} crédits, il vous en faut {credits_needed}.")
    
    # Deduct credits
    await db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$inc": {"spontaneous_credits": -credits_needed}}
    )
    
    # Log the spontaneous applications
    for company_id in request.company_ids:
        await db.spontaneous_applications.insert_one({
            "user_id": current_user["user_id"],
            "company_id": company_id,
            "status": "sent",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    return {"message": f"{credits_needed} candidature(s) spontanée(s) envoyée(s) avec succès", "credits_remaining": current_credits - credits_needed}

# ============ JOB RECOMMENDATIONS ROUTES ============

@api_router.get("/recommendations")
async def get_job_recommendations(current_user: dict = Depends(get_current_user)):
    """Get personalized job recommendations based on user profile"""
    from lib.jobs_api import fetch_jooble, match_score
    
    profile = await db.profiles.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    
    if not profile:
        return {"offers": [], "message": "Complétez votre profil pour recevoir des recommandations personnalisées"}
    
    keywords = profile.get("title", "Développeur")
    location = profile.get("location", "Paris")
    skills = profile.get("skills", [])
    
    jobs = await fetch_jooble(keywords, location)
    
    offers = []
    for job in jobs:
        snippet = job.get("snippet", "") or job.get("description", "")
        score = match_score(skills, snippet)
        offers.append({
            "title": job.get("title", ""),
            "company": job.get("company", "Entreprise"),
            "location": job.get("location", location),
            "url": job.get("link", "#"),
            "source": "Jooble",
            "match_score": score,
            "salary": job.get("salary", ""),
            "type": job.get("type", "CDI")
        })
    
    # Sort by match score
    offers.sort(key=lambda x: x["match_score"], reverse=True)
    
    return {"offers": offers[:15]}

# ============ HEALTH CHECK ============

@api_router.get("/")
async def root():
    return {"message": "Joboost API v1.0", "status": "operational"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
