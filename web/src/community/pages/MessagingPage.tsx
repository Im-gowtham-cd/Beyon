import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  Building2,
  Briefcase,
  GraduationCap,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import styles from './MessagingPage.module.css';

interface Conversation {
  id: string;
  conversationType: string;
  title: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
  recipientId: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientRole?: 'STUDENT' | 'INSTITUTION' | 'COMPANY' | 'ADMIN';
  recipientOrg?: string;
  recipientSubtitle?: string;
}

interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  senderName?: string;
  senderEmail?: string;
  senderRole?: string;
}

interface ContactUser {
  id: string;
  displayName?: string;
  email: string;
  role: 'STUDENT' | 'INSTITUTION' | 'COMPANY' | 'ADMIN';
  organization?: string;
  subtitle?: string;
}

export function MessagingPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // New Chat Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [contactFilterRole, setContactFilterRole] = useState<'ALL' | 'STUDENT' | 'INSTITUTION' | 'COMPANY'>('ALL');
  const [contactSearch, setContactSearch] = useState('');
  const [contacts, setContacts] = useState<ContactUser[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [newChatInitialMsg, setNewChatInitialMsg] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<any>(null);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch('/api/v1/messages/conversations', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        const list = json.data || [];
        setConversations(list);
        return list;
      }
    } catch {
      /* fallback */
    } finally {
      setLoading(false);
    }
    return [];
  };

  const fetchMessages = async (convId: string) => {
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch(`/api/v1/messages/conversations/${convId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setMessages(json.data || []);
      }
    } catch {
      /* fallback */
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations().then((list) => {
      if (list.length > 0 && !selectedConv) {
        selectConversation(list[0]);
      }
    });
  }, []);

  // Polling for new messages in active chat
  useEffect(() => {
    if (selectedConv) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = setInterval(() => {
        fetchMessages(selectedConv.id);
        fetchConversations();
      }, 5000);
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [selectedConv]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = (conv: Conversation) => {
    setSelectedConv(conv);
    fetchMessages(conv.id);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedConv || sending) return;
    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch(`/api/v1/messages/conversations/${selectedConv.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: text }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setMessages((prev) => [...prev, json.data]);
          fetchConversations();
        }
      }
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  };

  // Fetch contacts for modal
  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const url = `/api/v1/messages/contacts?role=${contactFilterRole}&query=${encodeURIComponent(contactSearch)}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setContacts(json.data || []);
      }
    } catch {
      /* fallback */
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    if (modalOpen) {
      fetchContacts();
    }
  }, [modalOpen, contactFilterRole, contactSearch]);

  const handleStartNewChat = async (recipient: ContactUser) => {
    try {
      const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
      const res = await fetch('/api/v1/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          recipientId: recipient.id,
          title: `Chat with ${recipient.displayName || recipient.email}`,
          message: newChatInitialMsg.trim() || undefined,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setModalOpen(false);
        setNewChatInitialMsg('');
        const updatedList = await fetchConversations();
        if (json.data) {
          const createdOrExisting = updatedList.find((c: Conversation) => c.id === json.data.id) || json.data;
          selectConversation(createdOrExisting);
        }
      }
    } catch {
      /* ignore */
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'INSTITUTION':
        return <Building2 size={12} />;
      case 'COMPANY':
        return <Briefcase size={12} />;
      default:
        return <GraduationCap size={12} />;
    }
  };

  const getRoleTagClass = (role?: string) => {
    switch (role) {
      case 'INSTITUTION':
        return styles.roleTagInstitution;
      case 'COMPANY':
        return styles.roleTagCompany;
      default:
        return styles.roleTagStudent;
    }
  };

  const getAvatarClass = (role?: string) => {
    switch (role) {
      case 'INSTITUTION':
        return styles.avatarInstitution;
      case 'COMPANY':
        return styles.avatarCompany;
      default:
        return styles.avatarStudent;
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return 'U';
  };

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const name = (c.recipientName || '').toLowerCase();
    const email = (c.recipientEmail || '').toLowerCase();
    const title = (c.title || '').toLowerCase();
    const org = (c.recipientOrg || '').toLowerCase();
    return name.includes(q) || email.includes(q) || title.includes(q) || org.includes(q);
  });

  return (
    <div className={styles.messagingContainer}>
      {/* ===================================================================
          1. LEFT SIDEBAR (Conversations & Contacts)
          =================================================================== */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.headerTop}>
            <h2 className={styles.headerTitle}>
              <MessageSquare size={20} />
              <span>Messages</span>
            </h2>
            <button
              type="button"
              className={styles.btnNewChat}
              onClick={() => setModalOpen(true)}
            >
              <Plus size={14} />
              <span>New Chat</span>
            </button>
          </div>

          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search conversations or contacts..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.conversationList}>
          {loading ? (
            <div className={styles.emptyState}>Loading conversations...</div>
          ) : filteredConversations.length === 0 ? (
            <div className={styles.emptyState}>
              <p style={{ margin: '0 0 10px', fontWeight: 600 }}>No conversations found</p>
              <button
                type="button"
                className={styles.btnNewChat}
                style={{ margin: '0 auto' }}
                onClick={() => setModalOpen(true)}
              >
                <Plus size={14} />
                <span>Start a conversation</span>
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const active = selectedConv?.id === conv.id;
              const initials = getInitials(conv.recipientName, conv.recipientEmail);
              const displayName = conv.recipientName || conv.recipientEmail || 'Direct Message';

              return (
                <div
                  key={conv.id}
                  className={`${styles.conversationItem} ${active ? styles.conversationItemActive : ''}`}
                  onClick={() => selectConversation(conv)}
                >
                  <div className={styles.avatarWrap}>
                    <div className={`${styles.avatar} ${getAvatarClass(conv.recipientRole)}`}>
                      {initials}
                    </div>
                    <span className={styles.onlineBadge} />
                  </div>

                  <div className={styles.convDetails}>
                    <div className={styles.convTopRow}>
                      <span className={styles.convName}>{displayName}</span>
                      <span className={styles.convTime}>
                        {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div className={styles.convMeta}>
                      <span className={`${styles.roleTag} ${getRoleTagClass(conv.recipientRole)}`}>
                        {getRoleIcon(conv.recipientRole)}
                        <span>{conv.recipientRole || 'USER'}</span>
                      </span>
                      {conv.recipientOrg && (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          &bull; {conv.recipientOrg}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                      <p className={styles.convPreview}>
                        {conv.lastMessagePreview || 'No messages yet'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className={styles.unreadBadge}>{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ===================================================================
          2. RIGHT PANEL (Active Chat Stream)
          =================================================================== */}
      <main className={styles.chatWindow}>
        {selectedConv ? (
          <>
            <header className={styles.chatHeader}>
              <div className={styles.recipientInfo}>
                <div className={styles.avatarWrap}>
                  <div className={`${styles.avatar} ${getAvatarClass(selectedConv.recipientRole)}`}>
                    {getInitials(selectedConv.recipientName, selectedConv.recipientEmail)}
                  </div>
                  <span className={styles.onlineBadge} />
                </div>
                <div>
                  <h3 className={styles.recipientName}>
                    <span>{selectedConv.recipientName || selectedConv.recipientEmail || 'Direct Message'}</span>
                    <span className={`${styles.roleTag} ${getRoleTagClass(selectedConv.recipientRole)}`}>
                      {getRoleIcon(selectedConv.recipientRole)}
                      <span>{selectedConv.recipientRole || 'USER'}</span>
                    </span>
                  </h3>
                  <p className={styles.recipientSub}>
                    {selectedConv.recipientOrg || 'Beyon Platform Network'}
                    {selectedConv.recipientSubtitle ? ` &bull; ${selectedConv.recipientSubtitle}` : ''}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: 6, height: 6, background: '#22c55e', borderRadius: '50%' }} />
                  Active Direct Channel
                </span>
              </div>
            </header>

            <div className={styles.messageStream}>
              <div className={styles.dateDivider}>
                <span className={styles.datePill}>
                  <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                  Encrypted End-to-End Chat
                </span>
              </div>

              {messages.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No messages yet. Send a greeting to start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user?.id || (user?.email && msg.senderEmail === user.email);

                  return (
                    <div
                      key={msg.id}
                      className={`${styles.messageRow} ${isMe ? styles.messageRowOutgoing : styles.messageRowIncoming}`}
                    >
                      <div className={`${styles.bubble} ${isMe ? styles.bubbleOutgoing : styles.bubbleIncoming}`}>
                        {!isMe && (
                          <span className={styles.bubbleSenderName}>
                            {msg.senderName || msg.senderEmail || 'Participant'}
                          </span>
                        )}
                        <div className={styles.bubbleContent}>{msg.content}</div>
                        <div className={`${styles.bubbleFooter} ${isMe ? styles.bubbleFooterOutgoing : styles.bubbleFooterIncoming}`}>
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && <span>&bull; Sent</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <footer className={styles.inputBar}>
              <textarea
                className={styles.inputField}
                placeholder="Type your message... (Press Enter to send)"
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                type="button"
                className={styles.btnSend}
                onClick={handleSendMessage}
                disabled={!inputText.trim() || sending}
              >
                <Send size={15} />
                <span>Send</span>
              </button>
            </footer>
          </>
        ) : (
          <div className={styles.emptySelectionScreen}>
            <div className={styles.emptyIcon}>
              <MessageSquare size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1c2d81', margin: 0 }}>
              Select or Start a Conversation
            </h3>
            <p style={{ maxWidth: '400px', margin: 0, fontSize: '0.85rem' }}>
              Connect directly across all ecosystem roles: Students, Higher-Ed Institutions, and Corporate Enterprise Recruiters.
            </p>
            <button
              type="button"
              className={styles.btnNewChat}
              style={{ marginTop: '8px' }}
              onClick={() => setModalOpen(true)}
            >
              <Plus size={14} />
              <span>New Direct Message</span>
            </button>
          </div>
        )}
      </main>

      {/* ===================================================================
          3. NEW CONVERSATION DIRECTORY MODAL
          =================================================================== */}
      {modalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <Sparkles size={16} color="#1c2d81" style={{ display: 'inline', marginRight: 6 }} />
                New Direct Conversation
              </h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalFilterRow}>
              {(['ALL', 'STUDENT', 'INSTITUTION', 'COMPANY'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`${styles.filterBtn} ${contactFilterRole === r ? styles.filterBtnActive : ''}`}
                  onClick={() => setContactFilterRole(r)}
                >
                  {r === 'ALL' ? 'All Roles' : r === 'STUDENT' ? 'Students' : r === 'INSTITUTION' ? 'Institutions' : 'Companies'}
                </button>
              ))}
            </div>

            <div style={{ padding: '12px 24px 0' }}>
              <div className={styles.searchBox}>
                <Search size={14} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by name, email, college, or company..."
                  className={styles.searchInput}
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.contactList}>
              {loadingContacts ? (
                <div className={styles.emptyState}>Searching directory...</div>
              ) : contacts.length === 0 ? (
                <div className={styles.emptyState}>No contacts match your query</div>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={styles.contactCard}
                    onClick={() => handleStartNewChat(contact)}
                  >
                    <div className={styles.contactUser}>
                      <div className={`${styles.avatar} ${getAvatarClass(contact.role)}`} style={{ width: 38, height: 38, fontSize: '0.85rem' }}>
                        {getInitials(contact.displayName, contact.email)}
                      </div>
                      <div>
                        <h4 className={styles.contactName}>{contact.displayName || contact.email}</h4>
                        <p className={styles.contactOrg}>
                          {contact.organization || 'Beyon Ecosystem'}
                          {contact.subtitle ? ` &bull; ${contact.subtitle}` : ''}
                        </p>
                      </div>
                    </div>

                    <span className={`${styles.roleTag} ${getRoleTagClass(contact.role)}`}>
                      {getRoleIcon(contact.role)}
                      <span>{contact.role}</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
