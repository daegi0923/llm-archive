from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.conversation import Conversation
from schemas.conversation import ConversationCreate

async def get_conversation(db: AsyncSession, conversation_id: str):
    result = await db.execute(select(Conversation).filter(Conversation.conversation_id == conversation_id))
    return result.scalars().first()

async def get_conversations(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Conversation).offset(skip).limit(limit))
    return result.scalars().all()

async def create_conversation(db: AsyncSession, conversation: ConversationCreate):
    db_conversation = Conversation(
        conversation_id=conversation.conversation_id,
        title=conversation.title,
        url=conversation.url,
        content=conversation.content
    )
    db.add(db_conversation)
    await db.commit()
    await db.refresh(db_conversation)
    return db_conversation
