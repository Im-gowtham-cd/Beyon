import { useState, useEffect } from 'react';
import { api } from '../../services/api/client';
import styles from './Recruitment.module.css';

const STAGES = ['APPLIED', 'ELIGIBLE', 'ASSESSMENT_INVITED', 'ASSESSMENT_COMPLETED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'OFFERED'];
const STAGE_COLORS: Record<string, string> = {
  APPLIED: '#6b7280', ELIGIBLE: '#2563eb', ASSESSMENT_INVITED: '#7c3aed',
  ASSESSMENT_COMPLETED: '#0ea5e9', SHORTLISTED: '#ca8a04', INTERVIEW: '#f97316',
  SELECTED: '#16a34a', OFFERED: '#059669', REJECTED: '#dc2626',
};

export function PipelinePage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { api.get<any[]>('/pipeline/my-applications').then(setApplications).catch(() => {}).finally(() => setLoading(false)); }, []);

  const filtered = filter === 'ALL' ? applications : applications.filter(a => a.currentStage === filter);

  if (loading) return <div className={styles.container}><div className={styles.loading}>Loading applications...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Applications</h1>
        <p className={styles.subtitle}>Track your recruitment progress</p>
      </div>

      <div className={styles.filterRow}>
        <button className={`${styles.filterBtn} ${filter === 'ALL' ? styles.filterActive : ''}`} onClick={() => setFilter('ALL')}>All ({applications.length})</button>
        {STAGES.map(s => {
          const count = applications.filter(a => a.currentStage === s).length;
          if (count === 0) return null;
          return (
            <button key={s} className={`${styles.filterBtn} ${filter === s ? styles.filterActive : ''}`} onClick={() => setFilter(s)}>
              {s.replace(/_/g, ' ')} ({count})
            </button>
          );
        })}
      </div>

      <div className={styles.pipelineList}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyTitle}>No applications yet</div>
            <div className={styles.emptyDesc}>Browse opportunities and apply to get started.</div>
          </div>
        ) : filtered.map(app => (
          <div className={styles.pipelineCard} key={app.id}>
            <div className={styles.pipelineHeader}>
              <span className={styles.pipelineId}>#{app.id.slice(0, 8)}</span>
              <span className={styles.stageBadge} style={{ background: STAGE_COLORS[app.currentStage] || '#6b7280' }}>
                {app.currentStage.replace(/_/g, ' ')}
              </span>
            </div>
            <div className={styles.pipelineMeta}>
              <span>📅 Applied {new Date(app.createdAt).toLocaleDateString()}</span>
              {app.overallScore && <span>📊 Score: {app.overallScore}%</span>}
            </div>
            <div className={styles.pipelineProgress}>
              {STAGES.map((stage, i) => {
                const currentIdx = STAGES.indexOf(app.currentStage);
                const isActive = i <= currentIdx;
                const isCurrent = stage === app.currentStage;
                return (
                  <div key={stage} className={`${styles.progressStep} ${isActive ? styles.progressActive : ''} ${isCurrent ? styles.progressCurrent : ''}`}>
                    <div className={styles.progressDot} />
                    <span className={styles.progressLabel}>{stage.replace(/_/g, ' ')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
