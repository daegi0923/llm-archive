import google.generativeai as genai
from core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def summarize_conversation(content: str) -> str:
    prompt = f"다음 대화를 바탕으로 핵심 주제와 중요 정보를 3문장 이내로 요약해줘:\n\n{content}"
    response = model.generate_content(prompt)
    return response.text

def generate_rag_answer(context: str, query: str) -> str:
    prompt = f"다음 문맥 정보를 바탕으로 질문에 답변해줘. 문맥에 없는 내용은 지어내지 마.\n\n문맥:\n{context}\n\n질문: {query}"
    response = model.generate_content(prompt)
    return response.text
