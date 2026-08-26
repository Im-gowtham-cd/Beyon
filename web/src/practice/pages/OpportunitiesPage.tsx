import { useState, useEffect } from 'react';
import { opportunityApi } from '../services/practiceApi';
import type { CompanyOpportunity } from '../types/practice';
import styles from './PracticePages.module.css';

export function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<CompanyOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    opportunityApi.getOpportunities().then(setOpportunities).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Opportunities</h1>

      {loading ? (
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} style={{ height: 80 }} />)}
        </div>
      ) : opportunities.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No opportunities available yet. Companies will post openings soon!</p>
        </div>
      ) : (
        <div className={styles.questionList}>
          {opportunities.map(opp => (
            <div key={opp.id} className={styles.questionCard}>
              <div className={styles.questionInfo}>
                <h3 className={styles.questionTitle}>{opp.title}</h3>
                <div className={styles.questionMeta}>
                  <span className={styles.typeBadge}>{opp.opportunityType.replace('_', ' ')}</span>
                  {opp.location && <span className={styles.typeBadge}>{opp.location}</span>}
                  {opp.minBeyonCoins > 0 && (
                    <span className={styles.typeBadge} style={{ color: 'var(--color-primary)' }}>
                      🪙 {opp.minBeyonCoins} Coins
                    </span>
                  )}
                </div>
              </div>
              <button className={styles.filterChip}>View</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
