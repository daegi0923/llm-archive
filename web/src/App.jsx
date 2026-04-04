import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import ConversationViewer from './components/ConversationViewer';
import RagChat from './components/RagChat';
import { Bot, FileText } from 'lucide-react';

function App() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [viewMode, setViewMode] = useState('viewer'); // 'viewer' or 'chat'

  // Fetch conversations on load
  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/conversations/');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar with Glassmorphism */}
      <div className="sidebar glass-panel">
        <div className="sidebar-header">
          <div className="logo-icon">
            <Bot size={24} color="white" />
          </div>
          <h2 className="text-gradient">Brain Sync</h2>
        </div>
        
        <Sidebar 
          conversations={conversations} 
          active={activeConversation} 
          onSelect={(c) => {
            setActiveConversation(c);
            setViewMode('viewer');
          }} 
          onRefresh={fetchConversations}
        />
      </div>

      {/* Main Content Area */}
      <div className="main-content glass-panel">
        
        {/* Toggle between Viewer and Chat modes */}
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'viewer' ? 'active' : ''}`}
            onClick={() => setViewMode('viewer')}
          >
            <FileText size={16} /> Archive View
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'chat' ? 'active' : ''}`}
            onClick={() => setViewMode('chat')}
          >
            <Bot size={16} /> RAG Chat
          </button>
        </div>

        {viewMode === 'viewer' ? (
          <ConversationViewer conversation={activeConversation} />
        ) : (
          <RagChat />
        )}
      </div>
    </div>
  );
}

export default App;
