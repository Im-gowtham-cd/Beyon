import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './Recruitment.module.css';

export function CandidateDiscoveryPage() {
  const [drives, setDrives] = useState<any[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<string>('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/drives/my').then((r: any) => {
      const list = Array.isArray(r) ? r : [];
      setDrives(list);
      if (list.length > 0) setSelectedDrive(list[0].id);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedDrive) return;
    api.post(`/candidates/drive/${selectedDrive}/auto-shortlist`).then((r: any) => {
      setCandidates(Array.isArray(r) ? r : []);
    }).catch(() => {});
    api.get(`/candidates/drive/${selectedDrive}/shortlist`).then((r: any) => {
      setShortlist(Array.isArray(r) ? r : []);
    }).catch(() => {});
  }, [selectedDrive]);

  const shortlistCandidate = async (studentId: string) => {
    await api.post(`/candidates/drive/${selectedDrive}/shortlist/${studentId}`);
    const r: any = await api.get(`/candidates/drive/${selectedDrive}/shortlist`);
    setShortlist(Array.isArray(r) ? r : []);
  };

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Candidate Discovery</h1>
        <p className={styles.subtitle}>Auto-rank and shortlist candidates for your drives</p>
      </div>

      {drives.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {drives.map(d => (
            <button key={d.id} className={`${styles.filterBtn} ${selectedDrive === d.id ? styles.filterActive : ''}`} onClick={() => setSelectedDrive(d.id)}>
              {d.title}
            </button>
          ))}
        </div>
      )}

      {candidates.length > 0 && (
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Auto-Ranked Candidates</h3>
          <div className={styles.table}>
            <div className={styles.tableHeader} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px 100px 100px 100px' }}>
              <span>Rank</span><span>Student</span><span>Skill Match</span><span>Assessment</span><span>Overall</span><span>Action</span>
            </div>
            {candidates.map((c: any) => (
              <div className={styles.tableRow} key={c.studentId} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px 100px 100px 100px' }}>
                <span style={{ fontWeight: 700, color: '#6366f1' }}>#{c.rank}</span>
                <span>{c.studentId?.toString().substring(0, 8)}...</span>
                <span>{Math.round(c.skillMatch)}%</span>
                <span>{c.assessmentScore || '—'}</span>
                <span style={{ fontWeight: 600 }}>{Math.round(c.overallScore)}%</span>
                <button className={styles.btnPrimary} onClick={() => shortlistCandidate(c.studentId)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                  Shortlist
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {shortlist.length > 0 && (
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Shortlisted Candidates ({shortlist.length})</h3>
          <div className={styles.table}>
            <div className={styles.tableHeader} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px 100px 120px' }}>
              <span>Rank</span><span>Student</span><span>Skill Match</span><span>Score</span><span>Status</span>
            </div>
            {shortlist.map((s: any) => (
              <div className={styles.tableRow} key={s.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px 100px 120px' }}>
                <span style={{ fontWeight: 700, color: '#6366f1' }}>#{s.rankInDrive}</span>
                <span>{s.studentId?.toString().substring(0, 8)}...</span>
                <span>{Math.round(s.skillMatchScore || 0)}%</span>
                <span>{Math.round(s.overallScore || 0)}%</span>
                <span className={styles.statusBadge} style={{ background: s.status === 'SHORTLISTED' ? '#16a34a' : '#6b7280' }}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
