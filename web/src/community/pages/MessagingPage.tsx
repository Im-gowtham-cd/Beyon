import { useState, useEffect, useRef } from 'react';
import { communityApi } from '../services/communityApi';
import type { MessageConversation, Message } from '../types/community';
import styles from './Community.module.css';

export function MessagingPage() {
  const [conversations, setConversations] = useState<MessageConversation[]>([]);
  const [selected, setSelected] = useState<MessageConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    communityApi.getConversations()
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = async (conv: MessageConversation) => {
    setSelected(conv);
    try {
      const msgs = await communityApi.getMessages(conv.id);
      setMessages(msgs);
    } catch { setMessages([]); }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selected) return;
    try {
      const msg = await communityApi.sendMessage(selected.id, newMessage);
      setMessages([...messages, msg]);
      setNewMessage('');
    } catch {}
  };

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading messages...</div></div>;

  return (
    <div className={styles.messagingLayout}>
      <div className={styles.conversationList}>
        <div className={styles.messagingHeader}>
          <h2 className={styles.messagingTitle}>Messages</h2>
        </div>
        {conversations.length === 0 ? (
          <div className={styles.emptyConversation}>No conversations yet</div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.id}
              className={`${styles.conversationItem} ${selected?.id === conv.id ? styles.conversationActive : ''}`}
              onClick={() => selectConversation(conv)}
            >
              <div className={styles.conversationTitle}>{conv.title || 'Conversation'}</div>
              <div className={styles.conversationTime}>
                {new Date(conv.lastMessageAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.messagePanel}>
        {selected ? (
          <>
            <div className={styles.messagePanelHeader}>
              <h3>{selected.title || 'Conversation'}</h3>
            </div>
            <div className={styles.messageList}>
              {messages.length === 0 ? (
                <div className={styles.emptyMessages}>No messages yet. Say hello!</div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={styles.messageBubble}>
                    <div className={styles.messageContent}>{msg.content}</div>
                    <div className={styles.messageTime}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className={styles.messageInputRow}>
              <input
                className={styles.messageInput}
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button className={styles.sendBtn} onClick={handleSend} disabled={!newMessage.trim()}>Send</button>
            </div>
          </>
        ) : (
          <div className={styles.emptyMessagePanel}>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
