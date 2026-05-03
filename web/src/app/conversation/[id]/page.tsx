"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ConversationViewer from '@/components/ConversationViewer';
import { ArrowLeft } from 'lucide-react';

export default function ConversationDetailPage() {
  const { id } = useParams();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDetail = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      // 전체 리스트에서 찾거나, 상세 API를 호출 (지금은 전체 리스트에서 필터링하는 식으로 우선 구현)
      const res = await fetch(`${apiUrl}/api/v1/conversations/`);
      if (res.ok) {
        const data = await res.json();
        const found = data.find((c: any) => c.id.toString() === id);
        setConversation(found);
      }
    } catch (err) {
      console.error("Failed to fetch detail", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-4 shrink-0">
        <button 
          onClick={() => router.push('/')}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="font-medium">Back to Knowledge Graph</span>
      </div>
      
      <div className="flex-1 overflow-hidden h-full">
        {loading ? (
          <div className="h-full flex items-center justify-center">Loading...</div>
        ) : (
          <ConversationViewer 
            conversation={conversation} 
            onUpdate={fetchDetail}
          />
        )}
      </div>
    </div>
  );
}
