import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Award,
  Briefcase,
  ShieldCheck,
  Check,
} from 'lucide-react';
import styles from './NotificationsPage.module.css';

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  notificationType: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchNotifications = async () => {
    try {
      const data = await api.get<NotificationItem[]>('/notifications');
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  async function handleMarkAllRead() {
    try {
      await api.put('/notifications/read-all').catch(() => {});
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }

  async function handleMarkRead(id: string) {
    try {
      await api.put(`/notifications/${id}/read`).catch(() => {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = filter === 'ALL'
    ? notifications
    : filter === 'UNREAD'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => (n.notificationType || '').toUpperCase().includes(filter));

  const getNotificationIcon = (type: string) => {
    const t = (type || '').toUpperCase();
    if (t.includes('REATTEMPT') || t.includes('WARNING') || t.includes('TERMINAT')) {
      return <AlertTriangle size={18} style={{ color: '#ea580c' }} />;
    }
    if (t.includes('ASSESS') || t.includes('PROCTOR') || t.includes('TEST')) {
      return <ShieldCheck size={18} style={{ color: '#1c2d81' }} />;
    }
    if (t.includes('APPLY') || t.includes('RECRUIT') || t.includes('CANDIDATE') || t.includes('DRIVE')) {
      return <Briefcase size={18} style={{ color: '#0284c7' }} />;
    }
    if (t.includes('ACHIEVE') || t.includes('COIN') || t.includes('BADGE')) {
      return <Award size={18} style={{ color: '#eab308' }} />;
    }
    return <Bell size={18} style={{ color: '#1c2d81' }} />;
  };

  return (
    <div className={styles.page}>
      {/* Header Banner */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Corporate Notifications &amp; Alerts</h1>
          <p className={styles.subtitle}>
            System events, reattempt requests, candidate submissions, and recruitment telemetry
          </p>
        </div>

        {unreadCount > 0 && (
          <button className={styles.markAllBtn} onClick={handleMarkAllRead}>
            <Check size={14} />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className={styles.filters}>
        {[
          { key: 'ALL', label: `All Notifications (${notifications.length})` },
          { key: 'UNREAD', label: `Unread (${unreadCount})` },
          { key: 'REATTEMPT', label: 'Reattempt Appeals' },
          { key: 'ASSESSMENT', label: 'Assessments & Proctoring' },
          { key: 'APPLICATION', label: 'Recruitment & Drives' },
          { key: 'SYSTEM', label: 'System' },
        ].map(f => (
          <button
            key={f.key}
            className={`${styles.filterChip} ${filter === f.key ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.list}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '76px', background: '#f1f5f9', border: '1px solid #e2e8f0' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <Bell size={36} style={{ color: '#cbd5e1' }} />
          <h3 className={styles.emptyTitle}>No notifications found</h3>
          <p className={styles.emptyText}>
            {filter === 'UNREAD' ? 'You are all caught up! No unread notifications.' : 'No alerts logged in this category.'}
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map(n => (
            <div
              key={n.id}
              className={`${styles.item} ${!n.read ? styles.itemUnread : ''}`}
              onClick={() => !n.read && handleMarkRead(n.id)}
            >
              <div className={styles.icon}>
                {getNotificationIcon(n.notificationType)}
              </div>

              <div className={styles.itemContent}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                  <h3 className={styles.itemTitle}>{n.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={styles.itemTime}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}
                    </span>
                    {!n.read && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          background: '#1c2d81',
                          color: '#ffffff',
                          textTransform: 'uppercase',
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </div>
                </div>

                <p className={styles.itemMessage}>{n.message}</p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#64748b',
                      background: '#f1f5f9',
                      padding: '2px 8px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {n.notificationType || 'GENERAL'}
                  </span>

                  {!n.read && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(n.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1c2d81',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Mark as read</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
