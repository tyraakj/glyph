import os
from dotenv import load_dotenv

# Load the parent directory's .env file
dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path=dotenv_path)

UPSTASH_REDIS_REST_URL = os.getenv("UPSTASH_REDIS_REST_URL", "")
UPSTASH_REDIS_REST_TOKEN = os.getenv("UPSTASH_REDIS_REST_TOKEN", "")
GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY", "")
LIVEBLOCKS_SECRET_KEY = os.getenv("LIVEBLOCKS_SECRET_KEY", "")
NEXT_PUBLIC_APP_URL = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")

# Validate required env vars
if not UPSTASH_REDIS_REST_URL or not UPSTASH_REDIS_REST_TOKEN:
    print("WARNING: Upstash Redis credentials not found in .env")

if not GOOGLE_AI_API_KEY:
    print("WARNING: GOOGLE_AI_API_KEY not found in .env")

if not LIVEBLOCKS_SECRET_KEY:
    print("WARNING: LIVEBLOCKS_SECRET_KEY not found in .env")
