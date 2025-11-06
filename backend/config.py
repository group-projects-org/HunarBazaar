import os
import sys
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# -------------------------
# Root Path & Environment
# -------------------------
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
if root_path not in sys.path:
    sys.path.append(root_path)

# -------------------------
# Load .env from project root
# -------------------------
dotenv_path = os.path.join(root_path, ".env")
load_dotenv(dotenv_path)

# -------------------------
# Logger for Debugging in FastAPI
# -------------------------
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------------
# MongoDB Configuration
# -------------------------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB_NAME = "Secure-Delivery-Data"
mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client[MONGO_DB_NAME]

# -------------------------
# JWT Configuration
# -------------------------
SECRET_KEY = "khajan_bhatt"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# -------------------------
# Cloudinary Configuration
# -------------------------
import cloudinary
CLOUDINARY_CLOUD_NAME=os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY=os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET=os.getenv("CLOUDINARY_API_SECRET")
cloudinary.config(cloud_name=CLOUDINARY_CLOUD_NAME, api_key=CLOUDINARY_API_KEY, api_secret=CLOUDINARY_API_SECRET, secure=True)

# -------------------------
# File Upload Configuration
# -------------------------
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"]
ALLOWED_AUDIO_TYPES = ["audio/webm", "audio/mp3", "audio/wav"]