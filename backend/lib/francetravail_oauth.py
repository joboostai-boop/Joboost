"""
France Travail OAuth2 Authentication
Handles token management for France Travail APIs (Pôle Emploi)
"""
import httpx
import os
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class FranceTravailAuth:
    """OAuth2 client credentials flow for France Travail APIs"""
    
    TOKEN_URL = "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire"
    SCOPES = "api_offresdemploiv2 api_labonneboitev1"
    
    def __init__(self):
        self.client_id = os.getenv('FRANCETRAVAIL_CLIENT_ID')
        self.client_secret = os.getenv('FRANCETRAVAIL_CLIENT_SECRET')
        self.token = None
        self.expiry = None
    
    async def get_token(self) -> str:
        """Get a valid access token, refreshing if necessary"""
        # Return cached token if still valid
        if self.token and self.expiry and datetime.now() < self.expiry:
            return self.token
        
        if not self.client_id or not self.client_secret:
            logger.warning("France Travail credentials not configured")
            raise ValueError("France Travail API credentials not configured")
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.TOKEN_URL,
                    data={
                        "grant_type": "client_credentials",
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                        "scope": self.SCOPES
                    },
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                
                if response.status_code != 200:
                    logger.error(f"France Travail OAuth error: {response.status_code} - {response.text}")
                    raise Exception(f"OAuth failed: {response.status_code}")
                
                data = response.json()
                self.token = data["access_token"]
                # Set expiry 60 seconds before actual expiry for safety margin
                expires_in = data.get("expires_in", 1500)
                self.expiry = datetime.now() + timedelta(seconds=expires_in - 60)
                
                logger.info("France Travail token refreshed successfully")
                return self.token
                
        except httpx.HTTPError as e:
            logger.error(f"HTTP error during France Travail auth: {e}")
            raise
        except Exception as e:
            logger.error(f"Error getting France Travail token: {e}")
            raise


# Singleton instance
auth = FranceTravailAuth()
