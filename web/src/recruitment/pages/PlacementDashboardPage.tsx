import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './Recruitment.module.css';

export function PlacementDashboardPage() {
  const [myStatus, setMyStatus] = useState<any>(null);
  const [myRecords, setMyRecords] = useState<any[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/placement/my-status').catch(() => ({ registration: null })),
      api.get('/placement/my-records').catch(() => []),
      api.get('/recruitment-interviews/upcoming').catch(() => ({}))
    ]).then(([status, records, interviews]) => {
      setMyStatus(status);
      setMyRecords(Array.isArray(records) ? records : []);
      const intv = interviews as any;
      setUpcomingInterviews(intv?.upcoming || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const registerForPlacement = async () => {
    await api.post('/placement/register', { placementPreference: 'WILLING' });
    const status: any = await api.get('/placement/my-status');
    setMyStatus(status);
  };

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading...</div></div>;

  const reg = myStatus?.registration;
  const placed = myRecords.filter(r => r.status === 'PLACED').length;
  const offered = myRecords.filter(r => r.status === 'OFFERED' || r.status === 'ACCEPTED').length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Placement Dashboard</h1>
        <p className={styles.subtitle}>Track your placement status, applications, and offers</p>
      </div>

      {/* Placement Registration */}
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Placement Registration</h3>
        {reg ? (
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div>
              <span className={`${styles.statusBadge}`} style={{ background: reg.placementPreference === 'WILLING' ? '#16a34a' : '#6b7280' }}>
                {reg.placementPreference}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              Registered: {new Date(reg.registeredAt).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>You haven't registered for placement yet.</p>
            <button className={styles.btnPrimary} onClick={registerForPlacement}>Register as Placement-Willing</button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{myRecords.length}</div>
          <div className={styles.statLabel}>Total Applications</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{offered}</div>
          <div className={styles.statLabel}>Offers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{placed}</div>
          <div className={styles.statLabel}>Placed</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{upcomingInterviews.length}</div>
          <div className={styles.statLabel}>Upcoming Interviews</div>
        </div>
      </div>

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Upcoming Interviews</h3>
          {upcomingInterviews.map((i: any) => (
            <div key={i.id} className={styles.driveCard} style={{ marginBottom: '0.5rem' }}>
              <div className={styles.driveHeader}>
                <div>
                  <div className={styles.driveTitle}>{i.interviewType} — Round {i.roundNumber}</div>
                  <div className={styles.driveMeta}>
                    {i.scheduledAt && <span>📅 {new Date(i.scheduledAt).toLocaleString()}</span>}
                    {i.durationMinutes && <span>⏱ {i.durationMinutes} min</span>}
                    {i.location && <span>📍 {i.location}</span>}
                  </div>
                </div>
                <span className={styles.statusBadge} style={{ background: '#2563eb' }}>{i.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Placement Records */}
      {myRecords.length > 0 && (
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Placement Records</h3>
          <div className={styles.table}>
            <div className={styles.tableHeader} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px 120px' }}>
              <span>Company</span><span>Role</span><span>Package</span><span>Type</span><span>Status</span>
            </div>
            {myRecords.map(r => (
              <div className={styles.tableRow} key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px 120px' }}>
                <span>{r.companyUserId?.toString().substring(0, 8)}...</span>
                <span>{r.jobRole}</span>
                <span>{r.ctcAmount ? `${r.ctcCurrency} ${r.ctcAmount}` : '—'}</span>
                <span>{r.placementType}</span>
                <span className={styles.statusBadge} style={{
                  background: r.status === 'PLACED' ? '#16a34a' : r.status === 'ACCEPTED' ? '#2563eb' : r.status === 'OFFERED' ? '#ca8a04' : '#6b7280'
                }}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
