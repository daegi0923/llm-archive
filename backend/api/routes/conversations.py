from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models as rest_models
from schemas.conversation import ConversationCreate, Conversation, ConversationUpdate
from crud.conversation import create_conversation, get_conversations, get_conversation_by_id, update_conversation, delete_conversation
from services.vector_store import store_vectors, init_qdrant_collection, delete_vectors
from services.llm import summarize_conversation
from core.qdrant import get_qdrant_client
from api.deps import get_db, get_qdrant

router = APIRouter()

@router.post("/", response_model=Conversation)
async def save_conversation(
    conversation: ConversationCreate, 
    db: AsyncSession = Depends(get_db),
    qdrant: AsyncQdrantClient = Depends(get_qdrant)
):
    # Generate summary if not provided
    if not conversation.summary:
        try:
            summary, keywords = await summarize_conversation(conversation.content)
            conversation.summary = summary
            conversation.keywords = keywords
        except Exception as e:
            print(f"Warning: Summarization failed: {e}")
            conversation.summary = "Summary generation failed."
            conversation.keywords = ""

    db_conv = await create_conversation(db, conversation)
    try:
        await store_vectors(qdrant, db_conv.conversation_id, db_conv.content)
    except Exception as e:
        print(f"Warning: Vector storageㅌ failed: {e}")
    return db_conv

@router.get("/", response_model=list[Conversation])
async def list_conversations(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await get_conversations(db, skip=skip, limit=limit)

@router.get("/graph")
async def get_graph_data(db: AsyncSession = Depends(get_db), qdrant: AsyncQdrantClient = Depends(get_qdrant)):
    convs = await get_conversations(db, limit=100)
    if not convs:
        return {"nodes": [], "links": []}

    nodes = [{"id": str(c.id), "name": c.title, "val": 1} for c in convs]
    # 일단은 노드만 보내고, 나중에 링크(유사도) 로직은 Qdrant랑 더 깊게 연동하자
    # 지금은 맛보기로 빈 링크만 보냄
    return {"nodes": nodes, "links": []}

@router.put("/{id}", response_model=Conversation)
async def update_conversation_api(
    id: int,
    conversation_in: ConversationUpdate,
    db: AsyncSession = Depends(get_db),
    qdrant: AsyncQdrantClient = Depends(get_qdrant)
):
    db_conv = await get_conversation_by_id(db, id=id)
    if not db_conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check if content changed to update vectors
    content_changed = conversation_in.content is not None and conversation_in.content != db_conv.content
    
    db_conv = await update_conversation(db, db_obj=db_conv, obj_in=conversation_in)
    
    if content_changed:
        try:
            # Re-summarize if content changed (optional)
            summary, keywords = await summarize_conversation(db_conv.content)
            db_conv.summary = summary
            db_conv.keywords = keywords
            await db.commit()
            await db.refresh(db_conv)
            
            # Update vectors
            await delete_vectors(qdrant, db_conv.conversation_id)
            await store_vectors(qdrant, db_conv.conversation_id, db_conv.content)
        except Exception as e:
            print(f"Warning: Vector update failed: {e}")
            
    return db_conv

@router.delete("/{id}", response_model=Conversation)
async def delete_conversation_api(
    id: int,
    db: AsyncSession = Depends(get_db),
    qdrant: AsyncQdrantClient = Depends(get_qdrant)
):
    db_conv = await get_conversation_by_id(db, id=id)
    if not db_conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Delete from Qdrant first
    try:
        await delete_vectors(qdrant, db_conv.conversation_id)
    except Exception as e:
        print(f"Warning: Vector deletion failed: {e}")
        
    # Delete from DB
    await delete_conversation(db, db_obj=db_conv)
    return db_conv
