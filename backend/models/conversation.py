from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from core.database import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String, unique=True, index=True)
    title = Column(String, index=True)
    url = Column(String)
    content = Column(Text)
    summary = Column(Text)
    keywords = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
