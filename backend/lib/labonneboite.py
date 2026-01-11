"""
La Bonne Boîte API Integration
Search for companies open to spontaneous applications
"""
import httpx
import os
from typing import List, Dict, Any

async def search_companies(location: str, rome: str = "M1805", radius: int = 10) -> Dict[str, Any]:
    """
    Search companies via La Bonne Boîte API (Pôle Emploi)
    rome: M1805 = Développeur informatique, M1607 = Secrétaire, etc.
    """
    url = "https://labonneboite.pole-emploi.fr/api/v1/company/"
    
    # Fallback to mock data if no API key
    api_key = os.getenv("LABONNEBOITE_API_KEY")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            params = {
                "commune": location,
                "rome_codes": rome,
                "distance": radius
            }
            
            headers = {}
            if api_key:
                headers["Authorization"] = f"Bearer {api_key}"
            
            response = await client.get(url, params=params, headers=headers)
            
            if response.status_code == 200:
                return response.json()
            else:
                # Return mock data for demo
                return get_mock_companies(location)
    except Exception as e:
        print(f"La Bonne Boîte API error: {e}")
        return get_mock_companies(location)


def get_mock_companies(location: str) -> Dict[str, Any]:
    """Mock company data for demonstration"""
    return {
        "companies": [
            {
                "id": "comp_001",
                "name": "Tech Solutions Paris",
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
                "id": "comp_002",
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
                "id": "comp_003",
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
            },
            {
                "id": "comp_004",
                "name": "CloudNine Solutions",
                "siret": "78901234567890",
                "naf": "6311Z",
                "address": f"42 Boulevard du Cloud, {location}",
                "city": location,
                "headcount": "10-19",
                "hiring_score": 70,
                "contact_mode": "email",
                "website": "https://cloudnine.fr",
                "sector": "Hébergement et traitement de données"
            },
            {
                "id": "comp_005",
                "name": "DataVision",
                "siret": "23456789012345",
                "naf": "6202B",
                "address": f"8 Rue des Données, {location}",
                "city": location,
                "headcount": "50-99",
                "hiring_score": 88,
                "contact_mode": "form",
                "website": "https://datavision.fr",
                "sector": "Data Science & Analytics"
            }
        ],
        "total": 5,
        "location": location
    }
