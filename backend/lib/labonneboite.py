"""
La Bonne Boîte API Integration via France Travail
Search for companies open to spontaneous applications
"""
import httpx
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# API Base URL
LABONNEBOITE_API_URL = "https://api.francetravail.io/partenaire/labonneboite/v1/company/"


async def search_companies(location: str, rome: str = "M1805", radius: int = 10) -> Dict[str, Any]:
    """
    Search companies via La Bonne Boîte API (France Travail)
    
    Args:
        location: City name or postal code
        rome: ROME code (e.g., M1805 = Développeur informatique)
        radius: Search radius in km
    
    Returns:
        Dict with companies list
    """
    try:
        from .francetravail_oauth import auth
        
        token = await auth.get_token()
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                LABONNEBOITE_API_URL,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/json"
                },
                params={
                    "commune": location,
                    "rome_codes": rome,
                    "distance": radius,
                    "sort": "score",
                    "count": 20
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                companies = data.get("companies", [])
                
                # Format companies for frontend
                formatted_companies = []
                for company in companies:
                    formatted_companies.append({
                        "id": company.get("siret", str(hash(company.get("name", "")))),
                        "name": company.get("name", "Entreprise"),
                        "siret": company.get("siret", ""),
                        "naf": company.get("naf", ""),
                        "address": company.get("address", ""),
                        "city": company.get("city", location),
                        "headcount": company.get("headcount_text", "Non communiqué"),
                        "hiring_score": int(company.get("stars", 3) * 20),  # Convert 0-5 stars to 0-100
                        "contact_mode": company.get("contact_mode", "email"),
                        "website": company.get("website", ""),
                        "sector": company.get("naf_text", ""),
                        "distance": company.get("distance", 0)
                    })
                
                logger.info(f"Found {len(formatted_companies)} companies via La Bonne Boîte")
                return {
                    "companies": formatted_companies,
                    "total": len(formatted_companies),
                    "location": location,
                    "source": "France Travail - La Bonne Boîte"
                }
            else:
                logger.warning(f"La Bonne Boîte API error: {response.status_code} - {response.text}")
                return get_mock_companies(location)
                
    except Exception as e:
        logger.error(f"La Bonne Boîte API error: {e}")
        return get_mock_companies(location)


def get_mock_companies(location: str) -> Dict[str, Any]:
    """Fallback mock data when API is unavailable"""
    return {
        "companies": [
            {
                "id": "mock_001",
                "name": "Tech Solutions France",
                "siret": "12345678901234",
                "naf": "6201Z",
                "address": f"15 Rue de l'Innovation, {location}",
                "city": location,
                "headcount": "50-99",
                "hiring_score": 85,
                "contact_mode": "email",
                "website": "https://techsolutions.fr",
                "sector": "Développement informatique"
            },
            {
                "id": "mock_002",
                "name": "Digital Factory",
                "siret": "98765432109876",
                "naf": "6201Z",
                "address": f"28 Avenue des Startups, {location}",
                "city": location,
                "headcount": "20-49",
                "hiring_score": 78,
                "contact_mode": "form",
                "website": "https://digitalfactory.io",
                "sector": "Conseil en systèmes informatiques"
            },
            {
                "id": "mock_003",
                "name": "InnovateTech",
                "siret": "45678901234567",
                "naf": "6202A",
                "address": f"5 Place de l'Innovation, {location}",
                "city": location,
                "headcount": "100-249",
                "hiring_score": 92,
                "contact_mode": "email",
                "website": "https://innovatetech.fr",
                "sector": "Conseil en informatique"
            }
        ],
        "total": 3,
        "location": location,
        "source": "Mock Data (API unavailable)"
    }
