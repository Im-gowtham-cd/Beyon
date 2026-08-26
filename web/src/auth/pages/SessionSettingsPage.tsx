import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './SettingsPages.module.css';

interface Session {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  lastAccessedAt: string;
  createdAt: string;
  isActive: boolean;
}

export function SessionSettingsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const s = await api.get<Session[]>('/sessions/active');
        setSessions(s);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  async function handleRevoke(sessionId: string) {
    try {
      await api.post(`/sessions/${sessionId}/revoke`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch { /* */ }
  }

  async function handleRevokeAll() {
    if (confirm('This will log you out of all devices. Continue?')) {
      try {
        await api.post('/sessions/revoke-all');
        setSessions([]);
      } catch { /* */ }
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          {[1, 2].map(i => <div key={i} className={styles.skeleton} style={{ height: 80 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Active Sessions</h1>
        {sessions.length > 1 && (
          <button className={styles.dangerBtn} onClick={handleRevokeAll}>Logout All Devices</button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No active sessions.</p>
        </div>
      ) : (
        <div className={styles.cardList}>
          {sessions.map(s => (
            <div key={s.id} className={styles.sessionCard}>
              <div className={styles.sessionInfo}>
                <span className={styles.sessionDevice}>{s.deviceInfo || 'Unknown Device'}</span>
                <span className={styles.sessionMeta}>{s.ipAddress} · {new Date(s.lastAccessedAt).toLocaleString()}</span>
              </div>
              <button className={styles.revokeBtn} onClick={() => handleRevoke(s.id)}>Revoke</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
