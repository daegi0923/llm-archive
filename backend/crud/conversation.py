from sqlalchemy.orm import Session
from models.conversation import Conversation
from schemas.conversation import ConversationCreate

def get_conversation(db: Session, conversation_id: str):
    return db.query(Conversation).filter(Conversation.conversation_id == conversation_id).first()

def get_conversations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Conversation).offset(skip).limit(limit).all()

def create_conversation(db: Session, conversation: ConversationCreate):
    db_conversation = Conversation(
        conversation_id=conversation.conversation_id,
        title=conversation.title,
        url=conversation.url,
        content=conversation.content
    )
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation
