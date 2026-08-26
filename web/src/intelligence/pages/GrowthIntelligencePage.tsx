import { useState, useEffect } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import type { GrowthScore } from '../types/intelligence';
import styles from '../../practice/pages/Gamification.module.css';

export function GrowthIntelligencePage() {
  const [score, setScore] = useState<GrowthScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const s = await intelligenceApi.getMyGrowthScore();
        setScore(s);
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.skeleton} style={{ height: 200 }} />
          <div className={styles.skeleton} style={{ height: 100 }} />
        </div>
      </div>
    );
  }

  if (!score) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📈</div>
          <h3 className={styles.emptyTitle}>Growth data not available</h3>
          <p className={styles.emptyText}>Start practicing and learning to generate your growth intelligence.</p>
        </div>
      </div>
    );
  }

  function getReadinessClass(level: string) {
    const map: Record<string, string> = {
      'Developing': styles.growthReadinessDeveloping,
      'Almost Ready': styles.growthReadinessAlmostReady,
      'Industry Ready': styles.growthReadinessIndustryReady,
      'Highly Competitive': styles.growthReadinessHighlyCompetitive,
    };
    return map[level] || styles.growthReadinessDeveloping;
  }

  function getBarColor(score: number) {
    if (score >= 80) return 'var(--color-secondary)';
    if (score >= 60) return 'var(--color-primary)';
    if (score >= 40) return 'var(--color-warning)';
    return 'var(--color-error)';
  }

  const breakdown = [
    { label: 'Skills', value: score.skillsScore },
    { label: 'Consistency', value: score.consistencyScore },
    { label: 'Assessment', value: score.assessmentScore },
    { label: 'Certifications', value: score.certificationScore },
    { label: 'Projects', value: score.projectScore },
    { label: 'Career Ready', value: score.careerReadinessScore },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Growth Intelligence</h1>
          <p className={styles.subtitle}>Your overall career readiness and learning progress</p>
        </div>
      </div>

      <div className={styles.growthOverall}>
        <div className={styles.growthScoreCircle} style={{ borderColor: getBarColor(score.overallScore) }}>
          <span className={styles.growthScoreValue}>{score.overallScore}%</span>
          <span className={styles.growthScoreLabel}>Overall</span>
        </div>
        <div className={styles.growthBreakdown}>
          <div style={{ marginBottom: 'var(--space-sm)' }}>
            <span className={`${styles.growthReadiness} ${getReadinessClass(score.readinessLevel)}`}>
              {score.readinessLevel}
            </span>
          </div>
          {breakdown.map(b => (
            <div key={b.label} className={styles.growthBreakdownItem}>
              <span className={styles.growthBreakdownLabel}>{b.label}</span>
              <div className={styles.growthBreakdownBar}>
                <div className={styles.growthBreakdownFill} style={{ width: `${b.value}%`, background: getBarColor(b.value) }} />
              </div>
              <span className={styles.growthBreakdownValue}>{b.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insightCards}>
        {score.strengths.length > 0 && (
          <div className={styles.insightCard}>
            <h3 className={styles.insightTitle}>💪 Strengths</h3>
            <div className={styles.insightList}>
              {score.strengths.map((s: { skillName: string; level: string }) => (
                <div key={s.skillName} className={styles.insightItem}>
                  <span className={styles.insightItemStrong}>✓ {s.skillName}</span>
                  <span>{s.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {score.improvements.length > 0 && (
          <div className={styles.insightCard}>
            <h3 className={styles.insightTitle}>🎯 Improve</h3>
            <div className={styles.insightList}>
              {score.improvements.map((s: { skillName: string; currentLevel: string; targetLevel: string }) => (
                <div key={s.skillName} className={styles.insightItem}>
                  <span className={styles.insightItemImprove}>→ {s.skillName}</span>
                  <span>{s.currentLevel} → {s.targetLevel}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
