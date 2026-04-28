from qdrant_client import AsyncQdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
import uuid
import google.generativeai as genai
from core.config import settings

# Text embedding model for Gemini
embedding_model = 'models/gemini-embedding-001'

async def get_embedding(text: str) -> list[float]:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    result = await genai.embed_content_async(
        model=embedding_model,
        content=text,
        task_type="retrieval_document",
        output_dimensionality=768
    )
    return result['embedding']

async def init_qdrant_collection(client: AsyncQdrantClient, collection_name: str = "conversations"):
    collections_response = await client.get_collections()
    collections = collections_response.collections
    if not any(c.name == collection_name for c in collections):
        await client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=768, distance=Distance.COSINE),
        )

async def store_vectors(client: AsyncQdrantClient, conversation_id: str, text: str, collection_name: str = "conversations"):
    embedding = await get_embedding(text)
    point_id = str(uuid.uuid4())
    await client.upsert(
        collection_name=collection_name,
        points=[
            PointStruct(
                id=point_id,
                vector=embedding,
                payload={
                    "conversation_id": conversation_id,
                    "content": text
                }
            )
        ]
    )

async def search_similar(client: AsyncQdrantClient, query: str, limit: int = 3, collection_name: str = "conversations") -> list[dict]:
    query_vector = await get_embedding(query)
    search_result = await client.search(
        collection_name=collection_name,
        query_vector=query_vector,
        limit=limit
    )
    return [{"id": hit.id, "score": hit.score, "payload": hit.payload} for hit in search_result]
