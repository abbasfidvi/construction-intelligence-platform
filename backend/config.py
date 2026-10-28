import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend root or parent
env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings:
    PROJECT_NAME: str = "AI-Powered Multimodal Construction Intelligence Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "").strip(' "')
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Feature toggles & thresholds
    DEFAULT_CONFIDENCE_THRESHOLD: float = 0.70

settings = Settings()
