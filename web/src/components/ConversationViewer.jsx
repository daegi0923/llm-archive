import { FileText } from 'lucide-react';

export default function ConversationViewer({ conversation }) {
  if (!conversation) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <FileText size={32} />
        </div>
        <h3>Select a conversation to view</h3>
        <p>Choose an archived conversation from the sidebar to view its details.</p>
      </div>
    );
  }

  return (
    <div className="viewer-container">
      <div className="viewer-header">
        <h2>{conversation.title}</h2>
        <div className="flex items-center gap-4 text-muted text-sm">
          <span>{new Date(conversation.created_at).toLocaleString()}</span>
          {conversation.url && (
            <a href={conversation.url} target="_blank" rel="noopener noreferrer">
              Original Source
            </a>
          )}
        </div>
      </div>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-main)', fontSize: '15px' }}>
        {conversation.content}
      </div>
    </div>
  );
}
