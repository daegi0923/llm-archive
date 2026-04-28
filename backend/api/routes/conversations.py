from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from qdrant_client import AsyncQdrantClient
from schemas.conversation import ConversationCreate, Conversation
from crud.conversation import create_conversation, get_conversations
from services.vector_store import store_vectors, init_qdrant_collection
from core.qdrant import get_qdrant_client
from api.deps import get_db, get_qdrant

router = APIRouter()

@router.on_event("startup")
async def startup_event():
    client = get_qdrant_client()
    try:
        await init_qdrant_collection(client)
    except Exception as e:
        print(f"Failed to initialize Qdrant collection: {e}")

@router.post("/", response_model=Conversation)
async def save_conversation(
    conversation: ConversationCreate, 
    db: AsyncSession = Depends(get_db),
    qdrant: AsyncQdrantClient = Depends(get_qdrant)
):
    db_conv = await create_conversation(db, conversation)
    try:
        await store_vectors(qdrant, db_conv.conversation_id, db_conv.content)
    except Exception as e:
        print(f"Warning: Vector storage failed: {e}")
    return db_conv

@router.get("/", response_model=list[Conversation])
async def list_conversations(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await get_conversations(db, skip=skip, limit=limit)
