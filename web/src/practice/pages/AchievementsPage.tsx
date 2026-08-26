import { useState, useEffect } from 'react';
import { achievementApi, streakApi } from '../services/practiceApi';
import type { Achievement, StreakInfo } from '../types/practice';
import styles from './Gamification.module.css';

export function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    async function load() {
      try {
        const [a, s] = await Promise.all([
          achievementApi.getAchievements(),
          streakApi.getInfo(),
        ]);
        setAchievements(a);
        setStreak(s);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  const categories = ['ALL', ...new Set(achievements.map(a => a.category))];
  const filtered = filter === 'ALL' ? achievements : achievements.filter(a => a.category === filter);

  function getRarityClass(rarity: string) {
    return (styles as Record<string, string>)[`badgeRarity${rarity}`] || styles.badgeRarityCommon;
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} style={{ height: 100 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Achievements</h1>
          <p className={styles.subtitle}>Your badges and streak milestones</p>
        </div>
      </div>

      {streak && (
        <div className={styles.streakBanner}>
          <div className={styles.streakFire}>🔥</div>
          <div className={styles.streakInfo}>
            <span className={styles.streakCount}>{streak.currentStreak} Day Streak</span>
            <span className={styles.streakLabel}>Longest: {streak.longestStreak} days</span>
          </div>
          <span className={styles.streakFreezes}>
            ❄️ {streak.streakFreezesAvailable} freeze{streak.streakFreezesAvailable !== 1 ? 's' : ''} available
          </span>
        </div>
      )}

      <div className={styles.filters}>
        {categories.map(c => (
          <button
            key={c}
            className={`${styles.filterChip} ${filter === c ? styles.filterActive : ''}`}
            onClick={() => setFilter(c)}
          >
            {c === 'ALL' ? 'All' : c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🏆</div>
          <h3 className={styles.emptyTitle}>No achievements yet</h3>
          <p className={styles.emptyText}>Keep practicing and learning to unlock badges!</p>
        </div>
      ) : (
        <div className={styles.badgeGrid}>
          {filtered.map(a => (
            <div key={a.id} className={`${styles.badgeCard} ${styles.badgeCardEarned}`}>
              <div className={styles.badgeIcon}>{a.badgeIcon || '🏅'}</div>
              <h3 className={styles.badgeName}>{a.achievementName}</h3>
              <p className={styles.badgeDesc}>{a.description}</p>
              <span className={`${styles.badgeRarity} ${getRarityClass(a.rarity)}`}>{a.rarity}</span>
              <span className={styles.badgeDate}>{new Date(a.earnedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
