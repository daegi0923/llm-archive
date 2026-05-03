from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ConversationBase(BaseModel):
    conversation_id: str
    title: str
    url: Optional[str] = None
    content: str
    summary: Optional[str] = None
    keywords: Optional[str] = None

class ConversationCreate(ConversationBase):
    pass

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    url: Optional[str] = None
    summary: Optional[str] = None
    keywords: Optional[str] = None

class Conversation(ConversationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class RAGQuery(BaseModel):
    query: str
