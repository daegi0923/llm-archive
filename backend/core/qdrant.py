from qdrant_client import AsyncQdrantClient
from core.config import settings

def get_qdrant_client():
    return AsyncQdrantClient(url=settings.QDRANT_URL)
