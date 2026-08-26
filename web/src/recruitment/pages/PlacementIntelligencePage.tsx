import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './Recruitment.module.css';

export function PlacementIntelligencePage() {
  const [tab, setTab] = useState('readiness');
  const [readiness, setReadiness] = useState<any>(null);
  const [outcomes, setOutcomes] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/intelligence/readiness/my').catch(() => ({})),
      api.get('/intelligence/outcomes/my').catch(() => []),
      api.get('/intelligence/verification/my').catch(() => []),
      api.get('/intelligence/referrals/active').catch(() => []),
    ]).then(([r, o, v, ref]) => {
      setReadiness(r);
      setOutcomes(Array.isArray(o) ? o : []);
      setVerifications(Array.isArray(v) ? v : []);
      setReferrals(Array.isArray(ref) ? ref : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'readiness', label: 'Readiness Score' },
    { id: 'outcomes', label: 'Career Outcomes' },
    { id: 'verifications', label: 'Verifications' },
    { id: 'alumni', label: 'Alumni' },
    { id: 'referrals', label: 'Referrals' },
  ];

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Placement Intelligence</h1>
        <p className={styles.subtitle}>Verification, readiness, career outcomes & alumni network</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} className={`${styles.filterBtn} ${tab === t.id ? styles.filterActive : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'readiness' && (
        <div>
          {readiness?.overallScore != null ? (
            <div>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{Math.round(readiness.overallScore)}%</div>
                  <div className={styles.statLabel}>Overall Readiness</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{Math.round(readiness.skillsScore || 0)}</div>
                  <div className={styles.statLabel}>Skills</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{Math.round(readiness.projectsScore || 0)}</div>
                  <div className={styles.statLabel}>Projects</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{Math.round(readiness.interviewScore || 0)}</div>
                  <div className={styles.statLabel}>Interview</div>
                </div>
              </div>
              {readiness.recommendations?.length > 0 && (
                <div className={styles.sectionCard}>
                  <h3 className={styles.sectionTitle}>Recommendations</h3>
                  {readiness.recommendations.map((r: any, i: number) => (
                    <div key={i} style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: 8, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <strong>{r.area}:</strong> {r.action}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.empty}>Complete your profile to see readiness score.</div>
          )}
        </div>
      )}

      {tab === 'outcomes' && (
        <div>
          {outcomes.length > 0 ? (
            <div className={styles.table}>
              <div className={styles.tableHeader} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px 100px' }}>
                <span>Type</span><span>Company</span><span>Role</span><span>Current</span><span>Verified</span>
              </div>
              {outcomes.map(o => (
                <div className={styles.tableRow} key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px 100px' }}>
                  <span>{o.outcomeType}</span>
                  <span>{o.companyName || '—'}</span>
                  <span>{o.role || '—'}</span>
                  <span>{o.isCurrent ? '✓' : ''}</span>
                  <span>{o.verified ? '✓' : ''}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>No career outcomes recorded yet.</div>
          )}
        </div>
      )}

      {tab === 'verifications' && (
        <div>
          {verifications.length > 0 ? (
            <div className={styles.table}>
              <div className={styles.tableHeader} style={{ display: 'grid', gridTemplateColumns: '1fr 150px 150px 120px' }}>
                <span>Placement</span><span>Source</span><span>Status</span><span>Verified</span>
              </div>
              {verifications.map(v => (
                <div className={styles.tableRow} key={v.id} style={{ display: 'grid', gridTemplateColumns: '1fr 150px 150px 120px' }}>
                  <span>{v.placementRecordId?.toString().substring(0, 8)}...</span>
                  <span>{v.verificationSource || '—'}</span>
                  <span className={styles.statusBadge} style={{ background: v.verificationStatus === 'VERIFIED' ? '#16a34a' : '#ca8a04' }}>{v.verificationStatus}</span>
                  <span>{v.verifiedAt ? new Date(v.verifiedAt).toLocaleDateString() : '—'}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>No verifications yet.</div>
          )}
        </div>
      )}

      {tab === 'alumni' && (
        <div>
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Alumni Network</h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>Connect with alumni for mentorship, referrals, and career guidance.</p>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>0</div>
                <div className={styles.statLabel}>Alumni Connections</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>0</div>
                <div className={styles.statLabel}>Mentor Requests</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'referrals' && (
        <div>
          {referrals.length > 0 ? (
            <div className={styles.driveList}>
              {referrals.map(r => (
                <div className={styles.driveCard} key={r.id}>
                  <div className={styles.driveHeader}>
                    <div>
                      <div className={styles.driveTitle}>{r.title}</div>
                      <div className={styles.driveRole}>{r.opportunityType} — {r.companyName || 'Unknown'}</div>
                    </div>
                    <span className={styles.statusBadge} style={{ background: '#16a34a' }}>ACTIVE</span>
                  </div>
                  <div className={styles.driveMeta}>
                    {r.location && <span>📍 {r.location}</span>}
                    {r.salaryRange && <span>💰 {r.salaryRange}</span>}
                    <span>👥 {r.referralCount} clicks</span>
                  </div>
                  {r.description && <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>{r.description}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>No active referrals. Check back later!</div>
          )}
        </div>
      )}
    </div>
  );
}
