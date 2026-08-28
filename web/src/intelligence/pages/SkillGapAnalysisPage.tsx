import { useState, useEffect } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import type { CareerPath, SkillGapAnalysis } from '../types/intelligence';
import styles from './CareerIntel.module.css';

export function SkillGapAnalysisPage() {
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    intelligenceApi.getAllCareerPaths().then(setPaths).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const runAnalysis = async (pathId: string) => {
    setAnalyzing(true);
    try {
      const result = await intelligenceApi.analyzeSkillGaps(pathId);
      setAnalysis(result);
    } catch {
      setAnalysis(null);
    }
    setAnalyzing(false);
  };

  const statusColor = (status: string) => {
    if (status === 'STRONG') return styles.gapStatusStrong;
    if (status === 'CRITICAL') return styles.gapStatusCritical;
    return styles.gapStatusNeedsWork;
  };

  const barColor = (pct: number) => pct >= 60 ? '#16a34a' : pct >= 30 ? '#ca8a04' : '#dc2626';

  if (loading) return <div className={styles.container}><div className={styles.loading}><div className={styles.loadingSpinner} /> Loading...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Skill Gap Analysis</h1>
        <p className={styles.subtitle}>Compare your skills against target career requirements</p>
      </div>

      {!analysis && (
        <>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0a0a0f', marginBottom: '1rem' }}>Select a Career Path to Analyze</h3>
          <div className={styles.graphContainer}>
            {paths.map(p => (
              <div className={styles.graphCard} key={p.id} style={{ cursor: 'pointer' }} onClick={() => runAnalysis(p.id)}>
                <div style={{ fontWeight: 600, color: '#0a0a0f', marginBottom: '0.25rem' }}>{p.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>{p.description}</div>
                <div style={{ fontSize: '0.8rem', color: '#6366f1' }}>Analyze gaps →</div>
              </div>
            ))}
          </div>
        </>
      )}

      {analyzing && <div className={styles.loading}><div className={styles.loadingSpinner} /> Analyzing skill gaps...</div>}

      {analysis && (
        <div>
          <button className={styles.btnSecondary} onClick={() => setAnalysis(null)} style={{ marginBottom: '1.5rem' }}>← Back to career paths</button>

          <div className={styles.gapSummary}>
            <div className={styles.gapSummaryCard}>
              <div className={`${styles.gapSummaryValue} ${styles.gapSummaryGood}`}>{analysis.readinessScore}%</div>
              <div className={styles.gapSummaryLabel}>Readiness Score</div>
            </div>
            <div className={styles.gapSummaryCard}>
              <div className={`${styles.gapSummaryValue}`} style={{ color: '#16a34a' }}>{analysis.acquiredSkills}</div>
              <div className={styles.gapSummaryLabel}>Skills Acquired</div>
            </div>
            <div className={styles.gapSummaryCard}>
              <div className={`${styles.gapSummaryValue}`} style={{ color: '#6366f1' }}>{analysis.totalSkills}</div>
              <div className={styles.gapSummaryLabel}>Total Required</div>
            </div>
            <div className={styles.gapSummaryCard}>
              <div className={`${styles.gapSummaryValue} ${styles.gapSummaryBad}`}>{analysis.criticalGaps.length}</div>
              <div className={styles.gapSummaryLabel}>Critical Gaps</div>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>Your Skills vs Requirements</div>
            <div className={styles.gapList}>
              {analysis.skills.map((s: any) => (
                <div className={styles.gapItem} key={s.skillId}>
                  <span className={`${styles.gapStatus} ${statusColor(s.status)}`}>{s.status.replace('_', ' ')}</span>
                  <span className={styles.gapSkillName}>{s.skillName}</span>
                  <div className={styles.gapBar}>
                    <div className={styles.gapBarTrack}>
                      <div className={styles.gapBarFill} style={{ width: `${Math.min(100, s.proficiencyPct || 0)}%`, background: barColor(s.proficiencyPct || 0) }} />
                    </div>
                  </div>
                  <span className={styles.gapLevels}>{s.currentLevel} → {s.requiredLevel}</span>
                  {s.estimatedHours && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>~{s.estimatedHours}h</span>}
                </div>
              ))}
            </div>
          </div>

          {analysis.criticalGaps.length > 0 && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionTitle}>🔴 Critical Gaps — Focus Areas</div>
              {analysis.criticalGaps.map((g: any) => (
                <div key={g.skillId} style={{ padding: '0.75rem', background: '#fef2f2', borderRadius: 8, marginBottom: '0.5rem', fontSize: '0.9rem', color: '#991b1b' }}>
                  ⚠ <strong>{g.skillName}</strong> — You need {g.requiredLevel} but currently have {g.currentLevel}. Estimated effort: ~{g.estimatedHours || 40}h
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
