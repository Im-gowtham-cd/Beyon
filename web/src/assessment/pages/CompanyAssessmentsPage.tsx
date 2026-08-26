import { useState, useEffect } from 'react';
import { assessmentApi } from '../services/assessmentApi';
import type { AssessmentSession, AssessmentResult, ProctoringReport } from '../types/assessment';
import styles from './AssessmentPage.module.css';

export function CompanyAssessmentsPage() {
  const [sessions, setSessions] = useState<AssessmentSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [report, setReport] = useState<ProctoringReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await assessmentApi.getMySessions();
      setSessions(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const viewResults = async (sessionId: string) => {
    setSelectedSession(sessionId);
    try {
      const [r, p] = await Promise.all([
        assessmentApi.getCompanyResults(sessionId),
        assessmentApi.getProctoringReport(sessionId),
      ]);
      setResults(r);
      setReport(p);
    } catch {
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return styles.badgeGreen;
      case 'IN_PROGRESS': return styles.badgeBlue;
      case 'SUBMITTED': return styles.badgeYellow;
      case 'TERMINATED': return styles.badgeRed;
      default: return styles.badgeGray;
    }
  };

  const getIntegrityColor = (status: string) => {
    switch (status) {
      case 'CLEAN': return styles.integrityClean;
      case 'WARNING': return styles.integrityWarning;
      case 'FLAGGED': return styles.integrityFlagged;
      case 'REVIEW_REQUIRED': return styles.integrityReview;
      default: return styles.integrityClean;
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (loading) {
    return <div className={styles.container}><div className={styles.emptyState}>Loading assessments...</div></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Assessment Results</div>
        <div className={styles.subtitle}>Monitor candidate assessments and review results</div>
      </div>

      {sessions.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateTitle}>No Assessments Yet</div>
          <p className={styles.emptyStateText}>Assessment sessions will appear here once candidates start.</p>
        </div>
      ) : (
        <div className={styles.sessionList}>
          {sessions.map(session => (
            <div className={styles.sessionItem} key={session.sessionId}>
              <div className={styles.sessionInfo}>
                <div className={styles.sessionTitle}>Session {String(session.sessionId).slice(0, 8)}</div>
                <div className={styles.sessionMeta}>
                  {session.status} · {session.questionsAttempted || 0}/{session.totalQuestions} questions
                </div>
              </div>
              <div className={styles.flexRow}>
                <span className={`${styles.badge} ${getStatusColor(session.status)}`}>{session.status}</span>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => viewResults(session.sessionId)}>
                  View Results
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSession && results && (
        <div style={{ marginTop: '2rem' }}>
          <div className={styles.resultCard}>
            <div className={styles.resultScore}>{results.accuracy ?? 0}%</div>
            <div className={styles.resultLabel}>Candidate Score</div>
            <div className={`${styles.integrityBadge} ${getIntegrityColor(results.integrityStatus)}`}>
              Proctoring: {results.integrityStatus}
            </div>
            <div className={styles.resultGrid}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Attempted</span>
                <span className={styles.statValue}>{results.questionsAttempted}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Correct</span>
                <span className={styles.statValue}>{results.questionsCorrect}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Time Used</span>
                <span className={styles.statValue}>{formatTime(results.timeUsedSeconds)}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Warnings</span>
                <span className={styles.statValue}>{results.warningCount}</span>
              </div>
            </div>
          </div>

          {report && (
            <div className={styles.questionCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>Proctoring Report</div>
                <span className={`${styles.badge} ${report.recommendation === 'APPROVE' ? styles.badgeGreen : styles.badgeYellow}`}>
                  {report.recommendation}
                </span>
              </div>
              <div className={styles.statsRow}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Warnings</span>
                  <span className={styles.statValue}>{report.warningCount}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Critical</span>
                  <span className={styles.statValue}>{report.criticalEventCount}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Fullscreen Exits</span>
                  <span className={styles.statValue}>{report.fullscreenExitCount}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Focus Lost</span>
                  <span className={styles.statValue}>{report.windowFocusLostCount}</span>
                </div>
              </div>

              {report.events.length > 0 && (
                <>
                  <div style={{ fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }}>Events</div>
                  <div className={styles.proctoringList}>
                    {report.events.map((event, i) => (
                      <div className={styles.proctoringItem} key={i}>
                        <span className={`${styles.badge} ${event.severity === 'CRITICAL' ? styles.badgeRed : event.severity === 'WARNING' ? styles.badgeYellow : styles.badgeGray}`}>
                          {event.severity}
                        </span>
                        <span className={styles.proctoringItemTime}>{event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : ''}</span>
                        <span>{event.title}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CompanyAssessmentsPage;
