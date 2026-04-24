from fastapi import APIRouter, Depends
from schemas.conversation import RAGQuery
from services.vector_store import search_similar
from services.llm import generate_rag_answer
from api.deps import get_qdrant

router = APIRouter()

@router.post("/chat")
def chat_with_brain(
    query: RAGQuery,
    qdrant = Depends(get_qdrant)
):
    similar_docs = search_similar(qdrant, query.query)
    
    if not similar_docs:
        return {"answer": "관련 정보를 찾을 수 없습니다."}
        
    context = "\n\n".join([doc['payload']['content'] for doc in similar_docs])
    answer = generate_rag_answer(context, query.query)
    
    return {"answer": answer, "sources": similar_docs}