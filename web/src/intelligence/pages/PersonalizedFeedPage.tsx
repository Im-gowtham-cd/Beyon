import { useState, useEffect } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import type { PersonalizedFeedItem } from '../types/intelligence';
import styles from '../../practice/pages/Gamification.module.css';

export function PersonalizedFeedPage() {
  const [items, setItems] = useState<PersonalizedFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const feed = await intelligenceApi.getPersonalizedFeed();
        setItems(feed.sort((a: PersonalizedFeedItem, b: PersonalizedFeedItem) => a.priority - b.priority));
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  async function handleDismiss(itemId: string) {
    setItems(prev => prev.filter((i: PersonalizedFeedItem) => i.id !== itemId));
    try {
      await intelligenceApi.dismissFeedItem(itemId);
    } catch { /* */ }
  }

  function getFeedTypeIcon(type: string) {
    const map: Record<string, string> = {
      DAILY_CHALLENGE: '🎯',
      CONTINUE_LEARNING: '📖',
      SKILL_GAP: '⚡',
      RECOMMENDED_COURSE: '📚',
      COMPANY_OPPORTUNITY: '🏢',
      WEEKEND_TEST: '📝',
      CERTIFICATION: '🎓',
      ACHIEVEMENT: '🏆',
      CAREER_TIP: '💡',
    };
    return map[type] || '📌';
  }

  function getFeedTypeLabel(type: string) {
    const map: Record<string, string> = {
      DAILY_CHALLENGE: "Today's Challenge",
      CONTINUE_LEARNING: 'Continue Learning',
      SKILL_GAP: 'Skill Gap',
      RECOMMENDED_COURSE: 'Recommended Course',
      COMPANY_OPPORTUNITY: 'Opportunity',
      WEEKEND_TEST: 'Weekend Test',
      CERTIFICATION: 'Certification',
      ACHIEVEMENT: 'Achievement',
      CAREER_TIP: 'Career Tip',
    };
    return map[type] || type;
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
          <h1 className={styles.title}>Your Feed</h1>
          <p className={styles.subtitle}>Personalized recommendations based on your skills and goals</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✨</div>
          <h3 className={styles.emptyTitle}>All caught up!</h3>
          <p className={styles.emptyText}>No new recommendations right now. Keep learning to unlock personalized suggestions.</p>
        </div>
      ) : (
        <div className={styles.cardList}>
          {items.map(item => (
            <div key={item.id} className={styles.feedItem}>
              <div className={styles.feedItemHeader}>
                <span className={styles.feedItemType}>
                  {getFeedTypeIcon(item.feedType)} {getFeedTypeLabel(item.feedType)}
                </span>
                <div className={styles.feedItemRewards}>
                  {item.coinReward != null && <span>💰 {item.coinReward}</span>}
                  {item.xpReward != null && <span>⚡ {item.xpReward} XP</span>}
                </div>
              </div>
              <h3 className={styles.feedItemTitle}>{item.title}</h3>
              {item.description && <p className={styles.feedItemDesc}>{item.description}</p>}
              <div className={styles.feedItemActions}>
                {item.actionLabel && item.actionUrl && (
                  <a href={item.actionUrl} className={styles.feedActionBtn} style={{ textDecoration: 'none' }}>
                    {item.actionLabel}
                  </a>
                )}
                <button className={styles.feedDismissBtn} onClick={() => handleDismiss(item.id)}>
                  Not interested
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
