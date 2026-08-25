import { useState, useEffect } from 'react';
import { recruitmentApi } from '../services/recruitmentApi';
import type { RecruitmentApplication } from '../../institution/types/institution';
import styles from './RecruitmentPages.module.css';

const STATUS_LABELS: Record<string, string> = {
  ELIGIBLE: 'Eligible',
  APPLIED: 'Applied',
  ASSESSMENT_PENDING: 'Assessment Pending',
  ASSESSMENT_STARTED: 'Assessment Started',
  ASSESSMENT_COMPLETED: 'Assessment Completed',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

const STATUS_STEP: Record<string, number> = {
  ELIGIBLE: 0, APPLIED: 1, ASSESSMENT_PENDING: 2, ASSESSMENT_STARTED: 3,
  ASSESSMENT_COMPLETED: 4, SHORTLISTED: 5, INTERVIEW: 6, SELECTED: 7,
};

export function MyApplicationsPage() {
  const [applications, setApplications] = useState<RecruitmentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recruitmentApi.getMyApplications().then(setApplications).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleWithdraw(id: string) {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    await recruitmentApi.withdraw(id);
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'WITHDRAWN' } : a));
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Applications</h1>

      {loading ? (
        <div className={styles.loadingContainer}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} style={{ height: 80 }} />)}
        </div>
      ) : applications.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No applications yet. Browse opportunities to get started!</p>
        </div>
      ) : (
        <div className={styles.appList}>
          {applications.map(app => {
            const step = STATUS_STEP[app.status] ?? 0;
            return (
              <div key={app.id} className={styles.appCard}>
                <div className={styles.appInfo}>
                  <h3 className={styles.appTitle}>Application</h3>
                  <span className={styles.appStatus}>{STATUS_LABELS[app.status] || app.status}</span>
                </div>
                <div className={styles.progressBar}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={`${styles.progressDot} ${i <= step ? styles.progressFilled : ''}`} />
                  ))}
                </div>
                {app.status !== 'WITHDRAWN' && app.status !== 'SELECTED' && app.status !== 'REJECTED' && (
                  <button className={styles.withdrawBtn} onClick={() => handleWithdraw(app.id)}>
                    Withdraw
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
