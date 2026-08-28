import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './Admin.module.css';

export function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/my').then((r: any) => setReports(Array.isArray(r) ? r : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const requestReport = async (type: string, title: string) => {
    await api.post('/reports', { type, title, format: 'PDF', parameters: {} });
    const r: any = await api.get('/reports/my');
    setReports(Array.isArray(r) ? r : []);
  };

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading reports...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reports</h1>
        <p className={styles.subtitle}>Generate and download platform reports</p>
      </div>

      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Request New Report</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <button className={styles.statCard} onClick={() => requestReport('PLACEMENT', 'Placement Report')} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div className={styles.statLabel}>Placement Report</div>
          </button>
          <button className={styles.statCard} onClick={() => requestReport('SKILL_GAP', 'Skill Gap Report')} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div className={styles.statLabel}>Skill Gap Report</div>
          </button>
          <button className={styles.statCard} onClick={() => requestReport('HIRING', 'Hiring Report')} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div className={styles.statLabel}>Hiring Report</div>
          </button>
          <button className={styles.statCard} onClick={() => requestReport('STUDENT_PROGRESS', 'Student Progress Report')} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div className={styles.statLabel}>Student Progress</div>
          </button>
          <button className={styles.statCard} onClick={() => requestReport('CAREER_READINESS', 'Career Readiness Report')} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div className={styles.statLabel}>Career Readiness</div>
          </button>
          <button className={styles.statCard} onClick={() => requestReport('ASSESSMENT', 'Assessment Report')} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div className={styles.statLabel}>Assessment Report</div>
          </button>
        </div>
      </div>

      {reports.length > 0 && (
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>My Reports</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {reports.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f9fafb', borderRadius: 8 }}>
                <div>
                  <div style={{ fontWeight: 500, color: '#0a0a0f' }}>{r.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{r.reportType} · {r.format} · {new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 500, background: r.generationStatus === 'COMPLETED' ? '#dcfce7' : '#fef9c3', color: r.generationStatus === 'COMPLETED' ? '#166534' : '#854d0e' }}>
                  {r.generationStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
