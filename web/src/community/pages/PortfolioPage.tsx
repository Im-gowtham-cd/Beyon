import { useState, useEffect } from 'react';
import { communityApi } from '../services/communityApi';
import type { VerifiedAchievement } from '../types/community';
import styles from './Community.module.css';

const ACHIEVEMENT_TYPES = ['CERTIFICATION', 'HACKATHON', 'COMPETITION', 'PUBLICATION', 'PATENT', 'OPEN_SOURCE', 'LEADERSHIP', 'COMMUNITY', 'SPORTS', 'ARTS'];
const STATUS_COLORS: Record<string, string> = { PENDING: '#ca8a04', VERIFIED: '#16a34a', REJECTED: '#dc2626', EXPIRED: '#6b7280' };

export function PortfolioPage() {
  const [achievements, setAchievements] = useState<VerifiedAchievement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ achievementType: 'CERTIFICATION', title: '', description: '', issuingOrganization: '', credentialUrl: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { communityApi.getMyAchievements().then(setAchievements).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    const a = await communityApi.submitAchievement(form as any);
    setAchievements([a, ...achievements]);
    setShowForm(false);
    setForm({ achievementType: 'CERTIFICATION', title: '', description: '', issuingOrganization: '', credentialUrl: '' });
  };

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading portfolio...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Portfolio</h1>
        <button className={styles.createBtn} onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Achievement'}</button>
      </div>

      {showForm && (
        <div className={styles.createForm}>
          <select value={form.achievementType} onChange={e => setForm({ ...form, achievementType: e.target.value })}>
            {ACHIEVEMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          <input placeholder="Issuing organization" value={form.issuingOrganization} onChange={e => setForm({ ...form, issuingOrganization: e.target.value })} />
          <input placeholder="Credential URL" value={form.credentialUrl} onChange={e => setForm({ ...form, credentialUrl: e.target.value })} />
          <button className={styles.createBtn} onClick={handleSubmit}>Submit for Verification</button>
        </div>
      )}

      <div className={styles.achievementList}>
        {achievements.map(a => (
          <div className={styles.achievementCard} key={a.id}>
            <div className={styles.achievementHeader}>
              <span className={styles.achievementType}>{a.achievementType}</span>
              <span className={styles.statusBadge} style={{ background: STATUS_COLORS[a.verificationStatus] }}>{a.verificationStatus}</span>
            </div>
            <div className={styles.achievementTitle}>{a.title}</div>
            {a.description && <div className={styles.achievementDesc}>{a.description}</div>}
            <div className={styles.achievementMeta}>
              {a.issuingOrganization && <span>🏢 {a.issuingOrganization}</span>}
              {a.issueDate && <span>📅 {a.issueDate}</span>}
            </div>
            {a.credentialUrl && <a className={styles.credentialLink} href={a.credentialUrl} target="_blank" rel="noopener noreferrer">View Credential →</a>}
          </div>
        ))}
      </div>
    </div>
  );
}
