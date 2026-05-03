import { RefreshCcw } from 'lucide-react';

interface Conversation {
  id: number;
  conversation_id: string;
  title: string;
  created_at: string;
}

interface SidebarProps {
  conversations: Conversation[];
  active: Conversation | null;
  onSelect: (c: Conversation) => void;
  onRefresh: () => void;
}

export default function Sidebar({ conversations, active, onSelect, onRefresh }: SidebarProps) {
  return (
    <div className="flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800 w-64 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="p-4 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Archived Chats</h3>
        <button 
          onClick={onRefresh} 
          className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
          title="Refresh"
        >
          <RefreshCcw size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="text-sm text-zinc-500 text-center mt-10">
            No conversations found.
          </div>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                active?.id === c.id 
                  ? 'bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700' 
                  : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 border border-transparent'
              }`}
            >
              <h4 className="text-sm font-medium truncate">{c.title}</h4>
              <p className="text-xs text-zinc-500 mt-1">
                {new Date(c.created_at).toLocaleDateString()}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
