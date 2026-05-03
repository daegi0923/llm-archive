import { useState, useEffect } from 'react';
import { FileText, ExternalLink, Edit, Trash2, X, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Conversation {
  id: number;
  title: string;
  created_at: string;
  url?: string;
  content: string;
  summary?: string;
  keywords?: string;
}

interface ConversationViewerProps {
  conversation: Conversation | null;
  onUpdate?: () => void;
}

export default function ConversationViewer({ conversation, onUpdate }: ConversationViewerProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '', summary: '', keywords: '' });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (conversation) {
      setEditForm({
        title: conversation.title || '',
        content: conversation.content || '',
        summary: conversation.summary || '',
        keywords: conversation.keywords || ''
      });
    }
  }, [conversation]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 bg-white dark:bg-zinc-950">
        <FileText size={48} className="mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-zinc-600 dark:text-zinc-300">Select a conversation</h3>
        <p className="text-sm">Choose a chat from the sidebar to view details</p>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this conversation? This will also remove it from the vector store.')) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/conversations/${conversation.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('refreshConversations'));
        router.push('/');
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete conversation.");
    }
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/conversations/${conversation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('refreshConversations'));
        setIsEditModalOpen(false);
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update conversation.");
    } finally {
      setIsSaving(false);
    }
  };

  const keywordsArray = conversation.keywords 
    ? conversation.keywords.split(',').map(k => k.replace(/[\[\]]/g, '').trim())
    : [];

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 overflow-hidden relative h-full">
      {/* Header */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm shrink-0">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
              {conversation.title}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              {conversation.url && (
                <a 
                  href={conversation.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors whitespace-nowrap"
                >
                  <ExternalLink size={14} />
                  Source
                </a>
              )}
              <p className="text-sm text-zinc-500">
                Archived on {new Date(conversation.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              title="Edit"
            >
              <Edit size={18} />
            </button>
            <button 
              onClick={handleDelete}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        
        {/* Keywords */}
        {keywordsArray.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {keywordsArray.map((keyword, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
                #{keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto w-full pb-20">
          {/* Summary Section */}
          {conversation.summary && (
            <div className="mb-8 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">AI Summary</h4>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                "{conversation.summary}"
              </p>
            </div>
          )}

          {/* Main Content */}
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap leading-relaxed text-zinc-800 dark:text-zinc-200 text-lg">
              {conversation.content}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-zinc-900 dark:text-zinc-100">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-lg font-bold">Edit Conversation</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Title</label>
                <input 
                  type="text" 
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Keywords (comma separated)</label>
                <input 
                  type="text" 
                  value={editForm.keywords}
                  onChange={(e) => setEditForm({...editForm, keywords: e.target.value})}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">AI Summary</label>
                <textarea 
                  rows={3}
                  value={editForm.summary}
                  onChange={(e) => setEditForm({...editForm, summary: e.target.value})}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm italic"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Content</label>
                <textarea 
                  rows={8}
                  value={editForm.content}
                  onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
                />
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
              >
                {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
