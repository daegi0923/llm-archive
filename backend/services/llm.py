import google.generativeai as genai
from core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

def get_model():
    # 리스트에 있는 모델 중 가장 범용적인 gemini-flash-latest 사용
    return genai.GenerativeModel('gemini-flash-latest')

from typing import Tuple

async def summarize_conversation(content: str) -> Tuple[str, str]:
    model = get_model()
    prompt = f"""다음 대화를 바탕으로 핵심 주제와 중요 정보를 3문장 이내로 요약하고, 핵심 키워드 5개를 뽑아줘.
    결과는 반드시 아래 형식을 지켜줘:
    요약: [요약 내용]
    키워드: [키워드1, 키워드2, 키워드3, 키워드4, 키워드5]

    대화 내용:
    {content}"""
    
    response = await model.generate_content_async(prompt)
    text = response.text
    
    summary = ""
    keywords = ""
    
    for line in text.split('\n'):
        if line.startswith('요약:'):
            summary = line.replace('요약:', '').strip()
        elif line.startswith('키워드:'):
            keywords = line.replace('키워드:', '').strip()
            
    return summary, keywords

async def generate_rag_answer(context: str, query: str) -> str:
    prompt = f"다음 문맥 정보를 바탕으로 질문에 답변해줘. 문맥에 없는 내용은 지어내지 마.\n\n문맥:\n{context}\n\n질문: {query}"
    response = await model.generate_content_async(prompt)
    return response.text
