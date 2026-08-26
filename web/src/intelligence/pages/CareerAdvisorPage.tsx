import { useState, useEffect, useRef } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import type { AdvisorChatSession, AdvisorChatMessage } from '../types/intelligence';
import styles from './CareerIntel.module.css';

export function CareerAdvisorPage() {
  const [sessions, setSessions] = useState<AdvisorChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<string>('');
  const [messages, setMessages] = useState<AdvisorChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    intelligenceApi.getMyAdvisorSessions().then(s => {
      setSessions(s);
      if (s.length > 0) {
        setActiveSession(s[0].id);
        intelligenceApi.getAdvisorMessages(s[0].id).then(setMessages);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createSession = async () => {
    const session = await intelligenceApi.createAdvisorSession();
    setSessions(prev => [session, ...prev]);
    setActiveSession(session.id);
    setMessages([]);
  };

  const selectSession = async (sessionId: string) => {
    setActiveSession(sessionId);
    const msgs = await intelligenceApi.getAdvisorMessages(sessionId);
    setMessages(msgs);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeSession || sending) return;
    const question = input.trim();
    setInput('');
    setSending(true);

    try {
      const result = await intelligenceApi.askAdvisor(activeSession, question);
      setMessages(prev => [...prev, result.userMessage, result.assistantMessage]);
    } catch {}
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) return <div className={styles.container}><div className={styles.loading}><div className={styles.loadingSpinner} /> Loading advisor...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Career Advisor</h1>
        <p className={styles.subtitle}>Get personalized career guidance based on your Beyon data</p>
      </div>

      <button className={styles.btnPrimary} onClick={createSession} style={{ marginBottom: '1rem' }}>+ New Conversation</button>

      {sessions.length > 0 && (
        <div className={styles.sessionList}>
          {sessions.slice(0, 5).map(s => (
            <div key={s.id} className={`${styles.sessionItem} ${activeSession === s.id ? styles.sessionActive : ''}`} onClick={() => selectSession(s.id)}>
              {s.title} — {new Date(s.updatedAt).toLocaleDateString()}
            </div>
          ))}
        </div>
      )}

      <div className={styles.advisorContainer}>
        <div className={styles.advisorChat}>
          <div className={styles.chatHeader}>
            <div className={styles.chatTitle}>Career Advisor</div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Powered by your Beyon data</span>
          </div>

          <div className={styles.chatMessages}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', fontSize: '0.9rem' }}>
                <p>👋 Hi! I'm your Career Advisor.</p>
                <p style={{ marginTop: '0.5rem' }}>Ask me things like:</p>
                <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>"What should I learn next?"</p>
                <p style={{ fontStyle: 'italic' }}>"What skills am I missing?"</p>
                <p style={{ fontStyle: 'italic' }}>"Which roles suit my skills?"</p>
                <p style={{ fontStyle: 'italic' }}>"How can I improve my placement readiness?"</p>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`${styles.chatMsg} ${msg.role === 'user' ? styles.chatMsgUser : styles.chatMsgAi}`}>
                {msg.role === 'assistant'
                  ? msg.content.split('\n').map((line, i) => (
                      <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    ))
                  : msg.content
                }
              </div>
            ))}
            {sending && (
              <div className={`${styles.chatMsg} ${styles.chatMsgAi}`}>
                <div className={styles.loadingSpinner} /> Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.chatInput}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your career..."
              disabled={sending}
            />
            <button className={styles.chatSendBtn} onClick={sendMessage} disabled={sending || !input.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
