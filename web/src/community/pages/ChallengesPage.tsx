import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './Collaboration.module.css';

interface Challenge {
  id: string;
  title: string;
  description?: string;
  problemStatement?: string;
  requiredSkills?: string;
  difficulty: string;
  deadline?: string;
  minTeamSize: number;
  maxTeamSize: number;
  coinReward: number;
  xpReward: number;
  status: string;
}

export function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const c = await api.get<Challenge[]>('/challenges');
        setChallenges(c);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  async function handleParticipate(challengeId: string) {
    try {
      await api.post(`/challenges/${challengeId}/participate`, {});
    } catch { /* */ }
  }

  const diffColors: Record<string, string> = {
    EASY: 'var(--color-secondary)',
    MEDIUM: 'var(--color-warning)',
    HARD: 'var(--color-error)',
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} style={{ height: 120 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Challenges & Hackathons</h1>
      </div>

      {challenges.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🏆</div>
          <h3 className={styles.emptyTitle}>No active challenges</h3>
          <p className={styles.emptyText}>Companies and institutions post real-world challenges here.</p>
        </div>
      ) : (
        <div className={styles.cardList}>
          {challenges.map(c => (
            <div key={c.id} className={styles.postCard}>
              <div className={styles.postHeader}>
                <div>
                  <h3 className={styles.postTitle}>🏆 {c.title}</h3>
                  <span className={styles.postMeta}>
                    <span style={{ color: diffColors[c.difficulty] || 'var(--color-text)' }}>{c.difficulty}</span>
                    {' · Team: '}{c.minTeamSize}-{c.maxTeamSize}
                  </span>
                </div>
                <span className={styles.tagBadge}>{c.status}</span>
              </div>
              {c.description && <p className={styles.postContent}>{c.description}</p>}
              <div className={styles.postMeta}>
                {c.deadline && <span>⏰ Deadline: {new Date(c.deadline).toLocaleDateString()}</span>}
                {c.coinReward > 0 && <span>💰 {c.coinReward} coins</span>}
                {c.xpReward > 0 && <span>⚡ {c.xpReward} XP</span>}
              </div>
              {c.requiredSkills && (
                <div className={styles.tagsRow}>
                  {c.requiredSkills.split(',').map(s => (
                    <span key={s.trim()} className={styles.tagBadge}>{s.trim()}</span>
                  ))}
                </div>
              )}
              {c.status === 'PUBLISHED' && (
                <button className={styles.followBtn} onClick={() => handleParticipate(c.id)}>Participate</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
