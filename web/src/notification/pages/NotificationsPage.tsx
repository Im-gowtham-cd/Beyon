import { useState, useEffect } from 'react';
import { notificationApi } from '../../institution/services/institutionApi';
import type { NotificationItem } from '../../institution/types/institution';
import styles from './NotificationsPage.module.css';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    notificationApi.getNotifications().then(setNotifications).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleMarkAllRead() {
    await notificationApi.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  async function handleMarkRead(id: string) {
    await notificationApi.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  const filtered = filter === 'ALL' ? notifications
    : filter === 'UNREAD' ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.notificationType.includes(filter));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Notifications</h1>
        <button className={styles.markAllBtn} onClick={handleMarkAllRead}>Mark all read</button>
      </div>

      <div className={styles.filters}>
        {['ALL', 'UNREAD', 'APPLICATION', 'ACHIEVEMENT', 'SYSTEM'].map(f => (
          <button
            key={f}
            className={`${styles.filterChip} ${filter === f ? styles.filterActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} style={{ height: 60 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No notifications</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map(n => (
            <div
              key={n.id}
              className={`${styles.notifCard} ${!n.read ? styles.unread : ''}`}
              onClick={() => !n.read && handleMarkRead(n.id)}
            >
              <div className={styles.notifContent}>
                <h3 className={styles.notifTitle}>{n.title}</h3>
                <p className={styles.notifMessage}>{n.message}</p>
                <span className={styles.notifTime}>
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
              {!n.read && <span className={styles.unreadDot} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
