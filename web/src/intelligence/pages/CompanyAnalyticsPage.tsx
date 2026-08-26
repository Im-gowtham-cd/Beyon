import { useState, useEffect } from 'react';
import { intelligenceApi } from '../services/intelligenceApi';
import type { CompanyAnalytics } from '../types/intelligence';
import styles from './Intelligence.module.css';

export function CompanyAnalyticsPage() {
  const [analytics, setAnalytics] = useState<CompanyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    intelligenceApi.getCompanyAnalytics()
      .then(setAnalytics)
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      const data = await intelligenceApi.generateCompanyAnalytics();
      setAnalytics(data);
    } catch {}
    setGenerating(false);
  };

  if (loading) return <div className={styles.container}><div className={styles.empty}>Loading analytics...</div></div>;

  const funnel = analytics ? [
    { label: 'Applications', value: analytics.totalApplications, color: '#6366f1' },
    { label: 'Assessments', value: analytics.totalAssessments, color: '#8b5cf6' },
    { label: 'Shortlisted', value: analytics.totalShortlisted, color: '#ca8a04' },
    { label: 'Interviews', value: analytics.totalInterviews, color: '#2563eb' },
    { label: 'Selected', value: analytics.totalSelected, color: '#16a34a' },
  ] : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Recruitment Analytics</h1>
          <p className={styles.subtitle}>Measurable recruitment intelligence for your hiring pipeline</p>
        </div>
        <button className={styles.startBtn} onClick={generate} disabled={generating}>
          {generating ? 'Generating...' : 'Refresh Analytics'}
        </button>
      </div>

      {analytics ? (
        <>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{analytics.totalApplications.toLocaleString()}</div>
              <div className={styles.statLabel}>Applications</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{analytics.totalAssessments.toLocaleString()}</div>
              <div className={styles.statLabel}>Assessments</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{analytics.totalShortlisted.toLocaleString()}</div>
              <div className={styles.statLabel}>Shortlisted</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{analytics.totalInterviews.toLocaleString()}</div>
              <div className={styles.statLabel}>Interviews</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue} style={{ color: '#16a34a' }}>{analytics.totalSelected}</div>
              <div className={styles.statLabel}>Selected</div>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{analytics.conversionRate}%</div>
              <div className={styles.statLabel}>Conversion Rate</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{analytics.avgAssessmentScore}%</div>
              <div className={styles.statLabel}>Avg Assessment Score</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{analytics.avgTimeToHireDays}d</div>
              <div className={styles.statLabel}>Avg Time to Hire</div>
            </div>
          </div>

          <div className={styles.chartSection}>
            <h3 className={styles.sectionTitle}>Application Funnel</h3>
            <div className={styles.funnel}>
              {funnel.map((stage, idx) => (
                <div className={styles.funnelStage} key={stage.label}>
                  <div className={styles.funnelBar}>
                    <div
                      className={styles.funnelBarFill}
                      style={{
                        width: `${analytics.totalApplications > 0 ? (stage.value / analytics.totalApplications) * 100 : 0}%`,
                        background: stage.color,
                      }}
                    />
                  </div>
                  <div className={styles.funnelInfo}>
                    <span className={styles.funnelLabel}>{stage.label}</span>
                    <span className={styles.funnelValue}>{stage.value.toLocaleString()}</span>
                    {idx > 0 && funnel[idx - 1].value > 0 && (
                      <span className={styles.funnelRate}>
                        {Math.round((stage.value / funnel[idx - 1].value) * 100)}% of previous
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.chartSection}>
            <h3 className={styles.sectionTitle}>Pipeline Summary</h3>
            <div className={styles.pipelineGrid}>
              {funnel.map((stage, idx) => {
                if (idx === 0) return null;
                const prev = funnel[idx - 1];
                const drop = prev.value - stage.value;
                return (
                  <div className={styles.pipelineItem} key={stage.label}>
                    <div className={styles.pipelineHeader}>
                      <span>{prev.label} → {stage.label}</span>
                    </div>
                    <div className={styles.pipelineStats}>
                      <span className={styles.pipelineDrop}>{drop.toLocaleString()} dropped</span>
                      <span className={styles.pipelineConv}>
                        {prev.value > 0 ? Math.round((stage.value / prev.value) * 100) : 0}% conversion
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          <p>No analytics data available yet. Generate your first analytics snapshot.</p>
        </div>
      )}
    </div>
  );
}
