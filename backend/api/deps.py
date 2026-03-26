from typing import Generator
from core.database import SessionLocal
from core.qdrant import get_qdrant_client

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_qdrant():
    return get_qdrant_client()
