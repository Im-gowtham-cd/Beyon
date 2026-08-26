import { useState, useEffect } from 'react';
import { weeklyTestApi } from '../services/practiceApi';
import type { WeeklyTest, WeeklyTestAttempt, LeaderboardEntry } from '../types/practice';
import styles from './Gamification.module.css';

export function WeeklyTestPage() {
  const [tests, setTests] = useState<WeeklyTest[]>([]);
  const [attempts, setAttempts] = useState<WeeklyTestAttempt[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'tests' | 'history' | 'leaderboard'>('tests');

  useEffect(() => {
    async function load() {
      try {
        const [t, a, l] = await Promise.all([
          weeklyTestApi.getAvailable(),
          weeklyTestApi.getMyAttempts(),
          weeklyTestApi.getLeaderboard(),
        ]);
        setTests(t);
        setAttempts(a);
        setLeaderboard(l);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          {[1, 2].map(i => <div key={i} className={styles.skeleton} style={{ height: 120 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Weekly Test</h1>
          <p className={styles.subtitle}>Challenge yourself with weekly assessments</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Available</span>
          <span className={styles.statValue}>{tests.filter(t => t.status === 'PUBLISHED').length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Completed</span>
          <span className={styles.statValue}>{attempts.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Best Score</span>
          <span className={styles.statValue}>{attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>XP Earned</span>
          <span className={styles.statValue}>{attempts.reduce((a, att) => a + att.score, 0)}</span>
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'tests' ? styles.tabActive : ''}`} onClick={() => setTab('tests')}>Available Tests</button>
        <button className={`${styles.tab} ${tab === 'history' ? styles.tabActive : ''}`} onClick={() => setTab('history')}>My Attempts</button>
        <button className={`${styles.tab} ${tab === 'leaderboard' ? styles.tabActive : ''}`} onClick={() => setTab('leaderboard')}>Leaderboard</button>
      </div>

      {tab === 'tests' && (
        tests.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <h3 className={styles.emptyTitle}>No tests available</h3>
            <p className={styles.emptyText}>Weekly tests are published every weekend. Check back soon!</p>
          </div>
        ) : (
          <div className={styles.cardList}>
            {tests.map(t => (
              <div key={t.id} className={styles.testCard}>
                <div className={styles.testCardHeader}>
                  <h3 className={styles.testTitle}>{t.title}</h3>
                  <span className={styles.testBadge}>{t.status}</span>
                </div>
                {t.description && <p className={styles.emptyText}>{t.description}</p>}
                <div className={styles.testMeta}>
                  <span className={styles.testMetaItem}>⏱ {t.durationMinutes} min</span>
                  <span className={styles.testMetaItem}>❓ {t.totalQuestions} questions</span>
                  <span className={styles.testMetaItem}>📊 {t.totalMarks} marks</span>
                  <span className={styles.testMetaItem}>✅ {t.passingMarks} to pass</span>
                </div>
                <div className={styles.testRewards}>
                  <span>💰 {t.coinReward} coins</span>
                  <span>⚡ {t.xpReward} XP</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'history' && (
        attempts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3 className={styles.emptyTitle}>No attempts yet</h3>
            <p className={styles.emptyText}>Take a weekly test to see your history here.</p>
          </div>
        ) : (
          <div className={styles.cardList}>
            {attempts.map(a => {
              const test = tests.find(t => t.id === a.testId);
              return (
                <div key={a.id} className={styles.transactionItem}>
                  <div className={styles.transactionInfo}>
                    <span className={styles.transactionDesc}>{test?.title || 'Weekly Test'}</span>
                    <span className={styles.transactionSource}>
                      Score: {a.score}/{test?.totalMarks || '?'} · {a.correctAnswers}/{a.totalAnswered} correct · {Math.round(a.timeTakenSeconds / 60)}m
                    </span>
                  </div>
                  <span className={styles.transactionXp} style={{ color: a.score >= (test?.passingMarks || 0) ? 'var(--color-secondary)' : 'var(--color-error)' }}>
                    {a.status}
                  </span>
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === 'leaderboard' && (
        leaderboard.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏆</div>
            <h3 className={styles.emptyTitle}>No leaderboard data</h3>
            <p className={styles.emptyText}>Complete a weekly test to appear on the leaderboard.</p>
          </div>
        ) : (
          <div className={styles.cardList}>
            {leaderboard.map((entry, idx) => (
              <div key={entry.studentId} className={styles.transactionItem}>
                <div className={styles.transactionInfo}>
                  <span className={styles.transactionDesc}>#{idx + 1} — Student</span>
                  <span className={styles.transactionSource}>Score: {entry.score}</span>
                </div>
                <span className={styles.transactionXp}>{entry.score} pts</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
