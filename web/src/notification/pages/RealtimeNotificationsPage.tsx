import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api/client';
import styles from './Notifications.module.css';

interface RealtimeEvent {
  id: string;
  eventType: string;
  payload: string;
  read: boolean;
  createdAt: string;
}

export function RealtimeNotificationsPage() {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    try {
      const res = await api.get<{ events: RealtimeEvent[]; count: number }>('/realtime/unread');
      setEvents(res.events);
      setUnreadCount(res.count);
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  async function handleMarkRead(eventId: string) {
    try {
      await api.post(`/realtime/read/${eventId}`);
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, read: true } : e));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* */ }
  }

  async function handleMarkAllRead() {
    try {
      await api.post('/realtime/read-all');
      setEvents(prev => prev.map(e => ({ ...e, read: true })));
      setUnreadCount(0);
    } catch { /* */ }
  }

  function getEventIcon(type: string) {
    const map: Record<string, string> = {
      NEW_OPPORTUNITY: '🎯', ASSESSMENT_INVITATION: '📝', APPLICATION_STATUS: '📋',
      INTERVIEW_UPDATE: '🎤', MENTOR_MESSAGE: '🧑‍🏫', EVENT_REMINDER: '📅',
      CHALLENGE_RESULT: '🏆', ACHIEVEMENT: '🏅', COIN_REWARD: '💰',
      COMPANY_POST: '🏢', INSTITUTION_ANNOUNCEMENT: '🎓',
    };
    return map[type] || '📌';
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} style={{ height: 60 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Notifications</h1>
          <span className={styles.unreadBadge}>{unreadCount} unread</span>
        </div>
        {unreadCount > 0 && (
          <button className={styles.markAllBtn} onClick={handleMarkAllRead}>Mark all read</button>
        )}
      </div>

      {events.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔔</div>
          <h3 className={styles.emptyTitle}>All caught up!</h3>
          <p className={styles.emptyText}>No new notifications right now.</p>
        </div>
      ) : (
        <div className={styles.eventList}>
          {events.map(e => (
            <div key={e.id} className={`${styles.eventCard} ${!e.read ? styles.unread : ''}`}
                 onClick={() => !e.read && handleMarkRead(e.id)}>
              <span className={styles.eventIcon}>{getEventIcon(e.eventType)}</span>
              <div className={styles.eventInfo}>
                <span className={styles.eventType}>{e.eventType.replace(/_/g, ' ')}</span>
                <span className={styles.eventTime}>{new Date(e.createdAt).toLocaleString()}</span>
              </div>
              {!e.read && <span className={styles.dot} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
