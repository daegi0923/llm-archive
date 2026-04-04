import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

export default function RagChat() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! I am Brain Sync. Ask me anything about your archived conversations.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [
          ...prev, 
          { 
            role: 'bot', 
            content: data.answer, 
            sources: data.sources 
          }
        ]);
      } else {
        throw new Error('Failed to fetch response');
      }
    } catch (error) {
      setMessages(prev => [
        ...prev, 
        { role: 'bot', content: 'Sorry, I encountered an error. Please try again later.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'bot' && (
              <div className="logo-icon" style={{ width: '32px', height: '32px', minWidth: '32px' }}>
                <Bot size={18} color="white" />
              </div>
            )}
            
            <div className={`message-bubble ${msg.role === 'user' ? 'message-user' : 'message-bot'}`}>
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <strong>Sources:</strong>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                    {msg.sources.map((s, idx) => (
                      <li key={idx}>Score {s.score?.toFixed(2)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="logo-icon" style={{ width: '32px', height: '32px', minWidth: '32px' }}>
              <Bot size={18} color="white" />
            </div>
            <div className="message-bubble message-bot flex items-center">
              <div className="loader"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <input 
            type="text" 
            placeholder="Ask about your synced knowledge..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button className="send-btn" onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
