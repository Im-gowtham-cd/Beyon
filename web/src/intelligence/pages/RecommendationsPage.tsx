import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './Intelligence.module.css';

const TYPE_ICONS: Record<string, string> = { PRACTICE: '📝', ASSESSMENT: '📋', COURSE: '🎓', CERTIFICATION: '🏆', PROJECT: '🛠️' };
const TYPE_LABELS: Record<string, string> = { PRACTICE: 'Practice', ASSESSMENT: 'Take Assessment', COURSE: 'Course', CERTIFICATION: 'Certification', PROJECT: 'Project' };

export function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { loadRecs(); }, []);

  const loadRecs = async () => {
    setLoading(true);
    try { setRecommendations(await api.get('/recommendations')); }
    catch { setRecommendations([]); }
    finally { setLoading(false); }
  };

  const generate = async () => {
    setGenerating(true);
    try { setRecommendations(await api.post('/recommendations/generate')); }
    catch {}
    finally { setGenerating(false); }
  };

  const markDone = async (id: string) => {
    await api.post(`/recommendations/${id}/complete`);
    setRecommendations(recommendations.map(r => r.id === id ? { ...r, status: 'COMPLETED' } : r));
  };

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading recommendations...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Skill Recommendations</h1>
          <p className={styles.subtitle}>Personalized recommendations based on your skills, gaps, and career goals</p>
        </div>
        <button className={styles.createBtn} onClick={generate} disabled={generating}>
          {generating ? 'Generating...' : '🔄 Refresh Recommendations'}
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyTitle}>No recommendations yet</div>
          <div className={styles.emptyDesc}>Generate recommendations to get personalized skill suggestions.</div>
          <button className={styles.createBtn} onClick={generate} disabled={generating}>Generate Recommendations</button>
        </div>
      ) : (
        <div className={styles.recommendationList}>
          {recommendations.map((rec, i) => (
            <div className={`${styles.recommendationCard} ${rec.status === 'COMPLETED' ? styles.recCompleted : ''}`} key={rec.id}>
              <div className={styles.recRank}>#{i + 1}</div>
              <div className={styles.recContent}>
                <div className={styles.recHeader}>
                  <span className={styles.recType}>{TYPE_ICONS[rec.recommendationType] || '📌'} {TYPE_LABELS[rec.recommendationType] || rec.recommendationType}</span>
                  <span className={styles.recScore}>{Math.round(Number(rec.score))}%</span>
                </div>
                <div className={styles.recSkill}>{rec.skillName}</div>
                {rec.reason && <div className={styles.recReason}>{rec.reason}</div>}
              </div>
              {rec.status !== 'COMPLETED' && (
                <button className={styles.recAction} onClick={() => markDone(rec.id)}>Mark Done</button>
              )}
              {rec.status === 'COMPLETED' && (
                <span className={styles.recDoneBadge}>✓ Done</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
