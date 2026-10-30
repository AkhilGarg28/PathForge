import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import { Button } from './Button.jsx';
import { Spinner } from './Spinner.jsx';

export function AITutorDrawer({ activeTopic = '', activeWeek = 1, skill = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadHistory = async () => {
    try {
      const res = await api.getTutorConversation();
      if (res.data?.messages) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.warn('Failed to load mentor history:', err.message);
    }
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    setInputMessage('');
    const tempUserMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.sendTutorMessage({
        message: text,
        topic: activeTopic,
        weekNumber: activeWeek,
        skill
      });

      if (res.data?.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.reply,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue connecting to the mentor service. Please try again.',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      await api.clearTutorConversation();
      setMessages([
        {
          role: 'assistant',
          content: 'Chat cleared. How can I assist your learning today?',
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.warn('Failed to clear conversation:', err);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle AI Learning Mentor"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          backgroundColor: 'var(--color-primary)',
          color: '#ffffff',
          borderRadius: '9999px',
          border: 'none',
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.95rem',
          transition: 'transform 0.15s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        <span style={{ fontSize: '1.2rem' }}>🤖</span>
        <span>{isOpen ? 'Close Mentor' : 'AI Mentor'}</span>
      </button>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div
          role="complementary"
          aria-label="AI Learning Mentor Chat"
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '24px',
            width: 'min(420px, calc(100vw - 32px))',
            height: 'min(580px, calc(100vh - 120px))',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 950,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-base)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.1rem' }}>🤖</span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>PathForge AI Mentor</span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--color-success)',
                    color: '#ffffff',
                    fontWeight: 600
                  }}
                >
                  ONLINE
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Context: Week {activeWeek} • {activeTopic || 'Curriculum Overview'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <Button variant="ghost" size="sm" onClick={handleClear} title="Clear conversation">
                Clear
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} aria-label="Close">
                ✕
              </Button>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-surface)',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            <button
              type="button"
              onClick={() => handleSend('Why did my roadmap adapt?')}
              style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Why did roadmap adapt?
            </button>
            <button
              type="button"
              onClick={() => handleSend('Give me a quick coding challenge on ' + (activeTopic || 'today topic'))}
              style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Practice challenge
            </button>
            <button
              type="button"
              onClick={() => handleSend('What are the common pitfalls for ' + (activeTopic || 'this topic') + '?')}
              style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Common pitfalls
            </button>
          </div>

          {/* Messages list */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    backgroundColor: isUser ? 'var(--color-primary)' : 'var(--color-bg-base)',
                    color: isUser ? '#ffffff' : 'var(--color-text-primary)',
                    padding: '10px 14px',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    border: isUser ? 'none' : '1px solid var(--color-border)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {m.content}
                </div>
              );
            })}

            {loading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: 'var(--color-bg-base)',
                  padding: '8px 14px',
                  borderRadius: '16px 16px 16px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                  color: 'var(--color-text-muted)'
                }}
              >
                <Spinner size="sm" />
                <span>Mentor is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '10px 12px',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-surface)',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about this topic..."
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-base)',
                color: 'var(--color-text-primary)',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
            <Button variant="primary" size="sm" type="submit" disabled={loading || !inputMessage.trim()}>
              Send
            </Button>
          </form>
        </div>
      )}
    </>
  );
}

export default AITutorDrawer;
