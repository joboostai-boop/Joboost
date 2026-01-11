"""
Jobs API Integration via France Travail
Fetch real job offers from France Travail (Pôle Emploi) API
"""
import httpx
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# France Travail Offers API
FRANCETRAVAIL_OFFERS_URL = "https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search"


async def fetch_francetravail(keywords: str, location: str, limit: int = 20) -> List[Dict[str, Any]]:
    """
    Fetch job offers from France Travail API
    
    Args:
        keywords: Search keywords (job title, skills)
        location: City name or postal code
        limit: Max number of results
    
    Returns:
        List of job offers
    """
    try:
        from .francetravail_oauth import auth
        
        token = await auth.get_token()
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                FRANCETRAVAIL_OFFERS_URL,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/json"
                },
                params={
                    "motsCles": keywords,
                    "commune": location,
                    "range": f"0-{limit-1}",
                    "sort": 1  # Sort by date
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                results = data.get("resultats", [])
                
                offers = []
                for job in results:
                    # Extract company info
                    entreprise = job.get("entreprise", {})
                    company_name = entreprise.get("nom", "Entreprise confidentielle")
                    
                    # Extract location info
                    lieu = job.get("lieuTravail", {})
                    job_location = lieu.get("libelle", location)
                    
                    # Extract salary info
                    salaire = job.get("salaire", {})
                    salary_text = ""
                    if salaire:
                        libelle = salaire.get("libelle", "")
                        if libelle:
                            salary_text = libelle
                    
                    # Extract contract type
                    type_contrat = job.get("typeContrat", "")
                    type_label = {
                        "CDI": "CDI",
                        "CDD": "CDD",
                        "MIS": "Intérim",
                        "SAI": "Saisonnier",
                        "LIB": "Libéral",
                        "REP": "Franchise",
                        "DIN": "CDI Intérimaire"
                    }.get(type_contrat, type_contrat)
                    
                    offers.append({
                        "title": job.get("intitule", ""),
                        "company": company_name,
                        "location": job_location,
                        "url": f"https://candidat.francetravail.fr/offres/recherche/detail/{job.get('id', '')}",
                        "source": "France Travail",
                        "description": job.get("description", "")[:500] if job.get("description") else "",
                        "salary": salary_text,
                        "type": type_label,
                        "experience": job.get("experienceLibelle", ""),
                        "published_at": job.get("dateCreation", ""),
                        "id": job.get("id", "")
                    })
                
                logger.info(f"Found {len(offers)} job offers from France Travail")
                return offers
            else:
                logger.warning(f"France Travail Offers API error: {response.status_code}")
                return get_mock_jobs(keywords, location)
                
    except Exception as e:
        logger.error(f"France Travail Offers API error: {e}")
        return get_mock_jobs(keywords, location)


async def fetch_jooble(keywords: str, location: str) -> List[Dict[str, Any]]:
    """Legacy function - now redirects to France Travail"""
    return await fetch_francetravail(keywords, location)


def match_score(skills: List[str], description: str) -> int:
    """
    Calculate match score between user skills and job description
    
    Args:
        skills: List of user skills
        description: Job description text
    
    Returns:
        Match score as percentage (0-100)
    """
    if not skills or not description:
        return 50
    
    description_lower = description.lower()
    matches = sum(1 for skill in skills if skill.lower() in description_lower)
    
    if len(skills) == 0:
        return 50
    
    score = int((matches / len(skills)) * 100)
    return min(max(score, 10), 100)  # Minimum 10%, max 100%


def get_mock_jobs(keywords: str, location: str) -> List[Dict[str, Any]]:
    """Fallback mock data when API is unavailable"""
    return [
        {
            "title": f"Développeur Full Stack",
            "company": "TechCorp France",
            "location": location,
            "url": "https://candidat.francetravail.fr/offres/recherche",
            "source": "Mock Data",
            "description": "Nous recherchons un développeur Full Stack expérimenté maîtrisant React, Node.js, Python.",
            "salary": "45 000 - 55 000 € / an",
            "type": "CDI",
            "experience": "2 ans minimum",
            "published_at": "2025-01-10"
        },
        {
            "title": f"Lead Developer Python",
            "company": "DataFlow Solutions",
            "location": location,
            "url": "https://candidat.francetravail.fr/offres/recherche",
            "source": "Mock Data",
            "description": "Poste de Lead Developer Python pour projet data. Python, FastAPI, Django, PostgreSQL.",
            "salary": "55 000 - 70 000 € / an",
            "type": "CDI",
            "experience": "5 ans minimum",
            "published_at": "2025-01-09"
        },
        {
            "title": f"Chef de Projet IT",
            "company": "Consulting Group",
            "location": location,
            "url": "https://candidat.francetravail.fr/offres/recherche",
            "source": "Mock Data",
            "description": "Chef de projet IT pour missions variées. Méthodologies Agile/Scrum, gestion budgétaire.",
            "salary": "50 000 - 65 000 € / an",
            "type": "CDI",
            "experience": "3 ans minimum",
            "published_at": "2025-01-08"
        }
    ]
