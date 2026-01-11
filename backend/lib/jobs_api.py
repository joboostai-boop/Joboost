"""
Jobs API Integration - Jooble, Adzuna aggregator
Fetch personalized job offers based on user profile
"""
import httpx
import os
from typing import List, Dict, Any

async def fetch_jooble(keywords: str, location: str) -> List[Dict[str, Any]]:
    """
    Fetch jobs from Jooble API
    """
    api_key = os.getenv("JOOBLE_API_KEY")
    
    if not api_key:
        return get_mock_jobs(keywords, location)
    
    url = f"https://jooble.org/api/{api_key}"
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json={
                "keywords": keywords,
                "location": location,
                "page": 1
            })
            
            if response.status_code == 200:
                data = response.json()
                return data.get("jobs", [])
            else:
                return get_mock_jobs(keywords, location)
    except Exception as e:
        print(f"Jooble API error: {e}")
        return get_mock_jobs(keywords, location)


async def fetch_adzuna(keywords: str, location: str, country: str = "fr") -> List[Dict[str, Any]]:
    """
    Fetch jobs from Adzuna API
    """
    app_id = os.getenv("ADZUNA_APP_ID")
    app_key = os.getenv("ADZUNA_APP_KEY")
    
    if not app_id or not app_key:
        return []
    
    url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            params = {
                "app_id": app_id,
                "app_key": app_key,
                "what": keywords,
                "where": location,
                "results_per_page": 10
            }
            response = await client.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                return data.get("results", [])
            return []
    except Exception as e:
        print(f"Adzuna API error: {e}")
        return []


def match_score(skills: List[str], description: str) -> int:
    """
    Calculate match score between user skills and job description
    Returns percentage 0-100
    """
    if not skills or not description:
        return 50
    
    description_lower = description.lower()
    matches = sum(1 for skill in skills if skill.lower() in description_lower)
    
    if len(skills) == 0:
        return 50
    
    score = int((matches / len(skills)) * 100)
    return min(score, 100)


def get_mock_jobs(keywords: str, location: str) -> List[Dict[str, Any]]:
    """Mock job data for demonstration when APIs are unavailable"""
    return [
        {
            "title": f"Développeur Full Stack Senior",
            "company": "TechCorp France",
            "location": location,
            "link": "https://example.com/job/1",
            "snippet": "Nous recherchons un développeur Full Stack expérimenté maîtrisant React, Node.js, Python, et les bases de données SQL/NoSQL. Environnement agile, télétravail partiel.",
            "salary": "50 000 - 65 000 €",
            "type": "CDI",
            "updated": "2025-01-10"
        },
        {
            "title": f"Lead Developer Python",
            "company": "DataFlow Solutions",
            "location": location,
            "link": "https://example.com/job/2",
            "snippet": "Poste de Lead Developer Python pour projet data. Compétences requises: Python, FastAPI, Django, PostgreSQL, Docker, Kubernetes. Management d'équipe de 3 devs.",
            "salary": "60 000 - 75 000 €",
            "type": "CDI",
            "updated": "2025-01-09"
        },
        {
            "title": f"Frontend Developer React",
            "company": "UX Digital Agency",
            "location": location,
            "link": "https://example.com/job/3",
            "snippet": "Développeur React.js passionné pour interfaces innovantes. Stack: React, TypeScript, Tailwind CSS, Next.js. Startup en croissance, équipe jeune et dynamique.",
            "salary": "42 000 - 55 000 €",
            "type": "CDI",
            "updated": "2025-01-11"
        },
        {
            "title": f"DevOps Engineer",
            "company": "CloudScale",
            "location": location,
            "link": "https://example.com/job/4",
            "snippet": "Ingénieur DevOps pour infrastructure cloud. AWS, Terraform, Docker, Kubernetes, CI/CD (GitLab). Monitoring avec Prometheus/Grafana.",
            "salary": "55 000 - 70 000 €",
            "type": "CDI",
            "updated": "2025-01-08"
        },
        {
            "title": f"Data Engineer",
            "company": "Analytics Pro",
            "location": location,
            "link": "https://example.com/job/5",
            "snippet": "Data Engineer pour plateforme big data. Python, Spark, Airflow, dbt, Snowflake. Construction de pipelines ETL robustes.",
            "salary": "48 000 - 62 000 €",
            "type": "CDI",
            "updated": "2025-01-10"
        },
        {
            "title": f"Chef de Projet IT",
            "company": "Consulting Group",
            "location": location,
            "link": "https://example.com/job/6",
            "snippet": "Chef de projet IT pour missions variées. Méthodologies Agile/Scrum, gestion budgétaire, relation client. Certifications PMP ou PRINCE2 appréciées.",
            "salary": "52 000 - 68 000 €",
            "type": "CDI",
            "updated": "2025-01-07"
        },
        {
            "title": f"Architecte Solutions Cloud",
            "company": "Enterprise Tech",
            "location": location,
            "link": "https://example.com/job/7",
            "snippet": "Architecte cloud pour transformation digitale grands comptes. Azure, AWS, architecture microservices, API management. 10+ ans d'expérience.",
            "salary": "75 000 - 95 000 €",
            "type": "CDI",
            "updated": "2025-01-06"
        },
        {
            "title": f"Product Manager",
            "company": "StartupVision",
            "location": location,
            "link": "https://example.com/job/8",
            "snippet": "Product Manager pour application SaaS B2B. Discovery produit, roadmap, analytics, coordination dev/design. Background tech apprécié.",
            "salary": "55 000 - 72 000 €",
            "type": "CDI",
            "updated": "2025-01-11"
        }
    ]
