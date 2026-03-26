from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ConversationBase(BaseModel):
    conversation_id: str
    title: str
    url: Optional[str] = None
    content: str

class ConversationCreate(ConversationBase):
    pass

class Conversation(ConversationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class RAGQuery(BaseModel):
    query: str
