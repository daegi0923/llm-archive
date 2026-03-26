from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.conversation import ConversationCreate, Conversation
from crud.conversation import create_conversation, get_conversations
from services.vector_store import store_vectors, init_qdrant_collection
from core.qdrant import get_qdrant_client
from api.deps import get_db, get_qdrant

router = APIRouter()

@router.on_event("startup")
def startup_event():
    client = get_qdrant_client()
    try:
        init_qdrant_collection(client)
    except Exception as e:
        print(f"Failed to initialize Qdrant collection: {e}")

@router.post("/", response_model=Conversation)
def save_conversation(
    conversation: ConversationCreate, 
    db: Session = Depends(get_db),
    qdrant = Depends(get_qdrant)
):
    db_conv = create_conversation(db, conversation)
    try:
        store_vectors(qdrant, db_conv.conversation_id, db_conv.content)
    except Exception as e:
        print(f"Warning: Vector storage failed: {e}")
    return db_conv

@router.get("/", response_model=list[Conversation])
def list_conversations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_conversations(db, skip=skip, limit=limit)
