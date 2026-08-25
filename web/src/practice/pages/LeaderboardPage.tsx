import { useState, useEffect } from 'react';
import { gamificationApi } from '../services/practiceApi';
import type { LeaderboardEntry } from '../types/practice';
import styles from './PracticePages.module.css';

export function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gamificationApi.getLeaderboard(50).then(setEntries).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Leaderboard</h1>

      {loading ? (
        <div className={styles.loadingContainer}>
          {[1, 2, 3, 4, 5].map(i => <div key={i} className={styles.skeleton} style={{ height: 48 }} />)}
        </div>
      ) : entries.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No rankings yet. Start practicing to climb the leaderboard!</p>
        </div>
      ) : (
        <div className={styles.questionList}>
          {entries.map((entry, i) => (
            <div key={entry.studentId} className={styles.questionCard}>
              <div className={styles.questionInfo}>
                <span style={{ fontWeight: 'var(--font-bold)', color: i < 3 ? 'var(--color-primary)' : 'var(--color-text)', minWidth: 32 }}>
                  #{i + 1}
                </span>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Student
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)' }}>
                {entry.score.toLocaleString()} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
