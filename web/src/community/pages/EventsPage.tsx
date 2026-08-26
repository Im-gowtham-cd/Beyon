import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './Collaboration.module.css';

interface EventItem {
  id: string;
  title: string;
  description?: string;
  eventType: string;
  speakerName?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  capacity?: number;
  registeredCount: number;
  isOnline: boolean;
  location?: string;
  coinReward: number;
  xpReward: number;
  status: string;
}

export function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const e = await api.get<EventItem[]>('/events');
        setEvents(e);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  async function handleRegister(eventId: string) {
    try {
      await api.post(`/events/${eventId}/register`);
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e));
    } catch { /* */ }
  }

  function getTypeIcon(type: string) {
    const map: Record<string, string> = {
      WORKSHOP: '🔧', WEBINAR: '🌐', GUEST_LECTURE: '🎤', HACKATHON: '💻',
      CAREER_FAIR: '🏢', TECHNICAL_TALK: '💡', FDP: '📚', MENTORSHIP_SESSION: '🧑‍🏫',
    };
    return map[type] || '📌';
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} style={{ height: 120 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Events & Workshops</h1>
      </div>

      {events.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📅</div>
          <h3 className={styles.emptyTitle}>No upcoming events</h3>
          <p className={styles.emptyText}>Check back soon for workshops, webinars, and hackathons.</p>
        </div>
      ) : (
        <div className={styles.cardList}>
          {events.map(e => (
            <div key={e.id} className={styles.postCard}>
              <div className={styles.postHeader}>
                <div>
                  <h3 className={styles.postTitle}>{getTypeIcon(e.eventType)} {e.title}</h3>
                  <span className={styles.postMeta}>{e.eventType} · {e.isOnline ? 'Online' : 'Offline'}</span>
                </div>
                <span className={styles.tagBadge}>{e.status}</span>
              </div>
              {e.description && <p className={styles.postContent}>{e.description}</p>}
              <div className={styles.postMeta}>
                <span>📅 {new Date(e.eventDate).toLocaleDateString()}</span>
                {e.speakerName && <span>🎤 {e.speakerName}</span>}
                <span>👥 {e.registeredCount}{e.capacity ? `/${e.capacity}` : ''}</span>
                {e.coinReward > 0 && <span>💰 {e.coinReward}</span>}
                {e.xpReward > 0 && <span>⚡ {e.xpReward} XP</span>}
              </div>
              {e.status === 'PUBLISHED' && (
                <button className={styles.followBtn} onClick={() => handleRegister(e.id)}>Register</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
