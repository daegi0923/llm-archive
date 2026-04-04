import { RefreshCcw } from 'lucide-react';

export default function Sidebar({ conversations, active, onSelect, onRefresh }) {
  return (
    <div className="sidebar-content flex-col">
      <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>ARCHIVED CHATS</h3>
        <button onClick={onRefresh} className="btn-icon" title="Refresh">
          <RefreshCcw size={16} />
        </button>
      </div>
      
      {conversations.length === 0 ? (
        <div className="text-muted text-sm flex justify-center items-center h-full">
          No conversations found. Use the extension to archive some!
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.map((c) => (
            <div 
              key={c.id} 
              className={`conversation-item ${active?.id === c.id ? 'active' : ''}`}
              onClick={() => onSelect(c)}
            >
              <h4>{c.title}</h4>
              <p>{new Date(c.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
