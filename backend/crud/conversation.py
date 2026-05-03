from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.conversation import Conversation
from schemas.conversation import ConversationCreate, ConversationUpdate

async def get_conversation(db: AsyncSession, conversation_id: str):
    result = await db.execute(select(Conversation).filter(Conversation.conversation_id == conversation_id))
    return result.scalars().first()

async def get_conversation_by_id(db: AsyncSession, id: int):
    result = await db.execute(select(Conversation).filter(Conversation.id == id))
    return result.scalars().first()

async def get_conversations(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Conversation).offset(skip).limit(limit))
    return result.scalars().all()

async def create_conversation(db: AsyncSession, conversation: ConversationCreate):
    db_conversation = Conversation(
        conversation_id=conversation.conversation_id,
        title=conversation.title,
        url=conversation.url,
        content=conversation.content,
        summary=conversation.summary,
        keywords=conversation.keywords
    )
    db.add(db_conversation)
    await db.commit()
    await db.refresh(db_conversation)
    return db_conversation

async def update_conversation(db: AsyncSession, db_obj: Conversation, obj_in: ConversationUpdate):
    update_data = obj_in.model_dump(exclude_unset=True)
    for field in update_data:
        setattr(db_obj, field, update_data[field])
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def delete_conversation(db: AsyncSession, db_obj: Conversation):
    await db.delete(db_obj)
    await db.commit()
    return db_obj
