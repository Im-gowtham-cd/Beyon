import { useState, useEffect } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import type { SkillGraphNode } from '../types/intelligence';
import styles from './CareerIntel.module.css';

export function SkillGraphPage() {
  const [skills, setSkills] = useState<SkillGraphNode[]>([]);
  const [strengths, setStrengths] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      intelligenceApi.getMySkillGraph(),
      intelligenceApi.getSkillStrengths()
    ]).then(([graph, str]) => {
      setSkills(graph);
      setStrengths(str);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const levelColor = (level: string) => {
    switch (level) {
      case 'EXPERT': return '#16a34a';
      case 'ADVANCED': return '#2563eb';
      case 'INTERMEDIATE': return '#ca8a04';
      case 'ELEMENTARY': return '#ea580c';
      default: return '#6b7280';
    }
  };

  const barClass = (pct: number) => {
    if (pct >= 80) return styles.graphBarFillLevel5;
    if (pct >= 60) return styles.graphBarFillLevel4;
    if (pct >= 40) return styles.graphBarFillLevel3;
    if (pct >= 20) return styles.graphBarFillLevel2;
    return styles.graphBarFillLevel1;
  };

  const trendIcon = (trend: string) => {
    if (trend === 'IMPROVING') return <span className={styles.trendUp}>↑ Improving</span>;
    if (trend === 'DECLINING') return <span className={styles.trendDown}>↓ Declining</span>;
    return <span className={styles.trendStable}>→ Stable</span>;
  };

  if (loading) return <div className={styles.container}><div className={styles.loading}><div className={styles.loadingSpinner} /> Loading skill graph...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Skill Graph</h1>
        <p className={styles.subtitle}>Your unified skill profile across practice, assessments, projects, and certifications</p>
      </div>

      {strengths && (
        <div className={styles.gapSummary}>
          <div className={styles.gapSummaryCard}>
            <div className={`${styles.gapSummaryValue} ${styles.gapSummaryGood}`}>{strengths.totalSkills || 0}</div>
            <div className={styles.gapSummaryLabel}>Total Skills</div>
          </div>
          <div className={styles.gapSummaryCard}>
            <div className={`${styles.gapSummaryValue}`} style={{ color: '#6366f1' }}>{strengths.verifiedSkills || 0}</div>
            <div className={styles.gapSummaryLabel}>Verified Skills</div>
          </div>
          <div className={styles.gapSummaryCard}>
            <div className={`${styles.gapSummaryValue} ${styles.gapSummaryGood}`}>{(strengths.strengths || []).length}</div>
            <div className={styles.gapSummaryLabel}>Strong Skills</div>
          </div>
        </div>
      )}

      {skills.length === 0 ? (
        <div className={styles.empty}>
          <p>Your skill graph is empty. Start practicing questions and taking assessments to build your skill profile.</p>
        </div>
      ) : (
        <div className={styles.graphContainer}>
          {skills.map(s => (
            <div className={styles.graphCard} key={s.id}>
              <div className={styles.graphSkillName}>{s.skillName}</div>
              <div className={styles.graphPctRow}>
                <div className={styles.graphPct}>{Math.round(s.proficiencyPct)}%</div>
                <div className={styles.graphBar}>
                  <div className={`${styles.graphBarFill} ${barClass(s.proficiencyPct)}`} style={{ width: `${Math.min(100, s.proficiencyPct)}%` }} />
                </div>
                <span className={styles.graphLevel} style={{ background: levelColor(s.level) }}>{s.level}</span>
              </div>
              <div className={styles.graphMeta}>
                <span>Confidence: {Math.round(s.confidence)}%</span>
                <span>Evidence: {s.evidenceCount}</span>
                {s.verified && <span className={styles.graphVerified}>✓ Verified</span>}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                {trendIcon(s.improvementTrend)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
