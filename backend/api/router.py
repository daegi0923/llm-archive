from fastapi import APIRouter
from api.routes import conversations, rag

api_router = APIRouter()
api_router.include_router(conversations.router, prefix="/conversations", tags=["conversations"])
api_router.include_router(rag.router, prefix="/rag", tags=["rag"])
