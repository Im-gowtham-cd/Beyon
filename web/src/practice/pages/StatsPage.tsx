import { useState, useEffect } from 'react';
import { practiceApi, coinApi, gamificationApi } from '../services/practiceApi';
import type { PracticeStats, CoinWallet, StudentStreak, AchievementBadge, LeaderboardEntry } from '../types/practice';
import styles from './PracticePages.module.css';

export function StatsPage() {
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [wallet, setWallet] = useState<CoinWallet | null>(null);
  const [streak, setStreak] = useState<StudentStreak | null>(null);
  const [badges, setBadges] = useState<AchievementBadge[]>([]);
  const [rank, setRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, w, st, b, r] = await Promise.all([
          practiceApi.getStats().catch(() => null),
          coinApi.getWallet().catch(() => null),
          gamificationApi.getStreak().catch(() => null),
          gamificationApi.getBadges().catch(() => []),
          gamificationApi.getMyRank().catch(() => null),
        ]);
        setStats(s);
        setWallet(w);
        setStreak(st);
        setBadges(b);
        setRank(r);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.skeleton} style={{ height: 100 }} />
          <div className={styles.skeleton} style={{ height: 100 }} />
        </div>
      </div>
    );
  }

  const accuracy = stats && stats.totalAttempted > 0
    ? Math.round((stats.totalSolved / stats.totalAttempted) * 100)
    : 0;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Your Progress</h1>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Solved</span>
          <span className={styles.statValue}>{stats?.totalSolved || 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Accuracy</span>
          <span className={styles.statValue}>{accuracy}%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Streak</span>
          <span className={styles.statValue}>{streak?.currentStreak || 0} 🔥</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Coins</span>
          <span className={styles.statValue} style={{ color: 'var(--color-primary)' }}>{wallet?.balance || 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Rank</span>
          <span className={styles.statValue}>#{rank?.rankPosition || '—'}</span>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Easy</span>
          <span className={styles.statValue} style={{ color: 'var(--color-secondary)' }}>{stats?.easySolved || 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Medium</span>
          <span className={styles.statValue} style={{ color: 'var(--color-warning)' }}>{stats?.mediumSolved || 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Hard</span>
          <span className={styles.statValue} style={{ color: 'var(--color-error)' }}>{stats?.hardSolved || 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Longest Streak</span>
          <span className={styles.statValue}>{streak?.longestStreak || 0}</span>
        </div>
      </div>

      {badges.length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)', margin: '0 0 var(--space-md)' }}>
            Achievements
          </h2>
          <div className={styles.statsRow}>
            {badges.map(b => (
              <div key={b.id} className={styles.statCard}>
                <span style={{ fontSize: '24px' }}>{b.badgeIcon || '🏆'}</span>
                <span className={styles.statLabel}>{b.achievementName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
