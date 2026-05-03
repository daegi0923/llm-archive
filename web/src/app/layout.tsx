"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

interface Conversation {
  id: number;
  conversation_id: string;
  title: string;
  created_at: string;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const fetchConversations = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/conversations/`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    
    // 리스트 갱신을 위한 커스텀 이벤트 리스너 등록
    const handleRefresh = () => fetchConversations();
    window.addEventListener('refreshConversations', handleRefresh);
    return () => window.removeEventListener('refreshConversations', handleRefresh);
  }, [fetchConversations]);

  useEffect(() => {
    const id = pathname.split('/').pop();
    if (id && !isNaN(Number(id))) {
      const found = conversations.find(c => c.id.toString() === id);
      if (found) setActiveConversation(found);
    } else {
      setActiveConversation(null);
    }
  }, [pathname, conversations]);

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50`}>
        <div className="flex h-screen w-screen overflow-hidden">
          <Sidebar 
            conversations={conversations} 
            active={activeConversation}
            onSelect={(c) => router.push(`/conversation/${c.id}`)}
            onRefresh={fetchConversations}
          />
          <main className="flex-1 flex flex-col min-w-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
