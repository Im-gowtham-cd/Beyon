import { useState, useEffect } from 'react';
import { communityApi } from '../services/communityApi';
import type { VerifiedAchievement } from '../types/community';
import styles from './Community.module.css';

const ACHIEVEMENT_TYPES = ['CERTIFICATION', 'HACKATHON', 'COMPETITION', 'PUBLICATION', 'PATENT', 'OPEN_SOURCE', 'LEADERSHIP', 'COMMUNITY', 'SPORTS', 'ARTS'];
const STATUS_COLORS: Record<string, string> = { PENDING: '#ca8a04', VERIFIED: '#16a34a', REJECTED: '#dc2626', EXPIRED: '#6b7280' };
const TYPE_ICONS: Record<string, string> = { CERTIFICATION: '🏆', HACKATHON: '🎯', COMPETITION: '🏅', PUBLICATION: '📄', PATENT: '📜', OPEN_SOURCE: '💻', LEADERSHIP: '👑', COMMUNITY: '🤝', SPORTS: '⚽', ARTS: '🎨' };

export function PortfolioPage() {
  const [achievements, setAchievements] = useState<VerifiedAchievement[]>([]);
  const [activeTab, setActiveTab] = useState<'achievements' | 'submit'>('achievements');
  const [form, setForm] = useState({ achievementType: 'CERTIFICATION', title: '', description: '', issuingOrganization: '', credentialUrl: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { communityApi.getMyAchievements().then(setAchievements).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    const a = await communityApi.submitAchievement(form as any);
    setAchievements([a, ...achievements]);
    setForm({ achievementType: 'CERTIFICATION', title: '', description: '', issuingOrganization: '', credentialUrl: '' });
    setActiveTab('achievements');
  };

  const verifiedCount = achievements.filter(a => a.verificationStatus === 'VERIFIED').length;
  const pendingCount = achievements.filter(a => a.verificationStatus === 'PENDING').length;

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading portfolio...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Portfolio</h1>
          <p className={styles.subtitle}>{verifiedCount} verified · {pendingCount} pending · {achievements.length} total</p>
        </div>
        <button className={styles.createBtn} onClick={() => setActiveTab(activeTab === 'submit' ? 'achievements' : 'submit')}>
          {activeTab === 'submit' ? '← Back' : '+ Add Achievement'}
        </button>
      </div>

      <div className={styles.tabRow}>
        <button className={`${styles.tabBtn} ${activeTab === 'achievements' ? styles.tabActive : ''}`} onClick={() => setActiveTab('achievements')}>Achievements ({achievements.length})</button>
        <button className={`${styles.tabBtn} ${activeTab === 'submit' ? styles.tabActive : ''}`} onClick={() => setActiveTab('submit')}>Submit New</button>
      </div>

      {activeTab === 'submit' && (
        <div className={styles.createForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Type</label>
            <select value={form.achievementType} onChange={e => setForm({ ...form, achievementType: e.target.value })} className={styles.formSelect}>
              {ACHIEVEMENT_TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Title *</label>
            <input className={styles.formInput} placeholder="e.g. AWS Certified Solutions Architect" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description</label>
            <textarea className={styles.formTextarea} placeholder="Describe your achievement..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Issuing Organization</label>
            <input className={styles.formInput} placeholder="e.g. Amazon Web Services" value={form.issuingOrganization} onChange={e => setForm({ ...form, issuingOrganization: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Credential URL</label>
            <input className={styles.formInput} placeholder="https://..." value={form.credentialUrl} onChange={e => setForm({ ...form, credentialUrl: e.target.value })} />
          </div>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={!form.title.trim()}>Submit for Verification</button>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className={styles.achievementList}>
          {achievements.length === 0 ? (
            <div className={styles.empty}>No achievements yet. Add your first achievement!</div>
          ) : (
            achievements.map(a => (
              <div className={styles.achievementCard} key={a.id}>
                <div className={styles.achievementHeader}>
                  <span className={styles.achievementType}>{TYPE_ICONS[a.achievementType] || '📌'} {a.achievementType}</span>
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
            ))
          )}
        </div>
      )}
    </div>
  );
}
