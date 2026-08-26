import { useState, useEffect } from 'react';
import { skillXpApi } from '../services/practiceApi';
import type { SkillLevel, SkillXpTransaction } from '../types/practice';
import styles from './Gamification.module.css';

export function SkillXpDashboard() {
  const [levels, setLevels] = useState<SkillLevel[]>([]);
  const [transactions, setTransactions] = useState<SkillXpTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'levels' | 'history'>('levels');

  useEffect(() => {
    async function load() {
      try {
        const [l, t] = await Promise.all([
          skillXpApi.getLevels(),
          skillXpApi.getTransactions(),
        ]);
        setLevels(l);
        setTransactions(t);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  function getLevelBadgeClass(levelName: string) {
    const key = levelName.replace(/\s/g, '');
    return (styles as Record<string, string>)[`skillLevelBadge${key}`] || styles.skillLevelBadge;
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} style={{ height: 80 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Skill XP</h1>
          <p className={styles.subtitle}>Track your learning progression across skills</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Skills</span>
          <span className={styles.statValue}>{levels.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total XP</span>
          <span className={styles.statValue}>{levels.reduce((a, l) => a + l.totalXp, 0)}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Highest Level</span>
          <span className={styles.statValue}>{levels.length > 0 ? Math.max(...levels.map(l => l.currentLevel)) : 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Transactions</span>
          <span className={styles.statValue}>{transactions.length}</span>
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'levels' ? styles.tabActive : ''}`} onClick={() => setTab('levels')}>
          Skill Levels
        </button>
        <button className={`${styles.tab} ${tab === 'history' ? styles.tabActive : ''}`} onClick={() => setTab('history')}>
          XP History
        </button>
      </div>

      {tab === 'levels' && (
        levels.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⚡</div>
            <h3 className={styles.emptyTitle}>No skill XP yet</h3>
            <p className={styles.emptyText}>Complete challenges and practice questions to earn XP for your skills.</p>
          </div>
        ) : (
          <div className={styles.cardList}>
            {levels.map(s => {
              const progress = s.xpForNextLevel > 0 ? (s.totalXp / s.xpForNextLevel) * 100 : 100;
              return (
                <div key={s.id} className={styles.skillLevelCard}>
                  <div className={styles.skillLevelHeader}>
                    <h3 className={styles.skillLevelName}>{s.skillName}</h3>
                    <span className={`${styles.skillLevelBadge} ${getLevelBadgeClass(s.levelName)}`}>
                      {s.levelName}
                    </span>
                  </div>
                  <div className={styles.xpBar}>
                    <div className={styles.xpBarFill} style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  <div className={styles.xpInfo}>
                    <span>{s.totalXp} / {s.xpForNextLevel} XP</span>
                    <span>Level {s.currentLevel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === 'history' && (
        transactions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3 className={styles.emptyTitle}>No XP history</h3>
            <p className={styles.emptyText}>Your XP earning history will appear here.</p>
          </div>
        ) : (
          <div className={styles.transactionList}>
            {transactions.map(t => (
              <div key={t.id} className={styles.transactionItem}>
                <div className={styles.transactionInfo}>
                  <span className={styles.transactionDesc}>{t.skillName} — {t.description || t.source}</span>
                  <span className={styles.transactionSource}>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
                <span className={styles.transactionXp}>+{t.xpAmount} XP</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
