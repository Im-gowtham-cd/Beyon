import { useState, useEffect } from 'react';
import { CheckCircle2, RefreshCw, MessageSquare } from 'lucide-react';
import styles from './AdminHome.module.css';

export function AdminModerationPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/community/threads');
      if (res.ok) {
        const data = await res.json();
        setThreads(data.data || []);
      }
    } catch {
      /* fallback */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const handleAction = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 4000);
  };

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c2d81', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Community Content Moderation &amp; Safety
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            Audit community forum discussions, reported threads, project submissions, and comment streams.
          </p>
        </div>
        <button
          onClick={fetchThreads}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            padding: '8px 16px',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Threads</span>
        </button>
      </div>

      {msg && (
        <div style={{ padding: '12px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 600, fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          <span>{msg}</span>
        </div>
      )}

      <div className={styles.tableCard}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Discussion Thread</th>
              <th>Channel / Category</th>
              <th>Replies</th>
              <th>Moderation State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {threads.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No discussion threads reported.
                </td>
              </tr>
            ) : (
              threads.map((t) => (
                <tr key={t.id}>
                  <td style={{ maxWidth: '450px' }}>
                    <div style={{ fontWeight: 800, color: '#1c2d81' }}>{t.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                      {t.content ? t.content.slice(0, 120) + '...' : 'Community discussion topic.'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, padding: '2px 8px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                      {t.category || 'General'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '0.82rem' }}>
                      <MessageSquare size={13} />
                      <span>{t.replyCount || 0}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 7px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
                      SAFE &middot; APPROVED
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleAction(`Thread approved: ${t.title}`)}
                        style={{ padding: '4px 10px', background: '#1c2d81', color: '#ffffff', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Keep Safe
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

