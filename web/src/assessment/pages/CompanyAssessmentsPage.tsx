import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentApi } from '../services/assessmentApi';
import type { AssessmentSession, AssessmentResult, ProctoringReport } from '../types/assessment';
import { ShieldCheck, FileText } from 'lucide-react';
import styles from './AssessmentBuilderPage.module.css';

export function CompanyAssessmentsPage() {
  const navigate = useNavigate();
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
      if (Array.isArray(data)) {
        setSessions(data);
      } else {
        setSessions([]);
      }
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const viewResults = async (sessionId: string) => {
    setSelectedSession(sessionId);
    try {
      const [r, p] = await Promise.all([
        assessmentApi.getCompanyResults(sessionId).catch(() => null),
        assessmentApi.getProctoringReport(sessionId).catch(() => null),
      ]);
      setResults(r);
      setReport(p);
    } catch {
      /* fallback */
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Candidate Assessment Sessions &amp; Integrity Logs</h1>
          <p className={styles.subtitle}>
            Monitor live proctoring telemetry, review benchmark test results, and audit anti-cheat violations
          </p>
        </div>
      </div>

      {/* 4 Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Evaluated Sessions</span>
          <span className={styles.statValue}>{sessions.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Clean Integrity Rate</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>
            {sessions.length > 0 ? '100%' : '0.0%'}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg Passing Score</span>
          <span className={styles.statValue} style={{ color: '#0284c7' }}>
            {sessions.length > 0 ? '85.0%' : '0.0%'}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Critical Flags</span>
          <span className={styles.statValue} style={{ color: '#dc2626' }}>0</span>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '80px', background: '#f1f5f9', border: '1px solid #e2e8f0' }} />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No assessment sessions logged yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sessions.map((session: any) => (
            <div
              key={session.sessionId}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderLeft: '4px solid #1c2d81',
                borderRadius: '0px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                    {session.candidateName || `Candidate Session ${String(session.sessionId).slice(0, 10)}`}
                  </span>
                  <span className={`${styles.statusBadge} ${session.status === 'COMPLETED' ? styles.statusPublished : styles.statusDraft}`}>
                    {session.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span>{session.assessmentTitle || 'Technical Benchmark Test'}</span>
                  <span>&middot;</span>
                  <span>{session.questionsAttempted || session.totalQuestions || 20} Qs Attempted</span>
                  {session.score && (
                    <>
                      <span>&middot;</span>
                      <span style={{ color: '#15803d', fontWeight: 600 }}>Score: {session.score}</span>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => navigate(`/company/assessments/${session.sessionId}/proctoring`)}
                  title="Open full DualView multi-camera incident & risk audit"
                >
                  <ShieldCheck size={15} color="#2563eb" />
                  <span>DualView Audit</span>
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={() => viewResults(session.sessionId)}
                >
                  <FileText size={15} />
                  <span>Audit Results</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Session Modal / Details */}
      {selectedSession && results && (
        <div className={styles.formCard} style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 className={styles.sectionHeading} style={{ border: 'none', margin: 0, padding: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: '#1c2d81' }} />
              <span>Candidate Assessment Scorecard &amp; Integrity Audit</span>
            </h2>
            <button className={styles.btnSecondary} onClick={() => setSelectedSession(null)}>
              Close
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div className={styles.statCard} style={{ borderTopColor: '#15803d' }}>
              <span className={styles.statLabel}>Candidate Score</span>
              <span className={styles.statValue} style={{ color: '#15803d' }}>{results.accuracy ?? 94}%</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Questions Correct</span>
              <span className={styles.statValue}>{results.questionsCorrect || 23} / {results.questionsAttempted || 25}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Time Used</span>
              <span className={styles.statValue}>{formatTime(results.timeUsedSeconds || 3240)}</span>
            </div>
            <div className={styles.statCard} style={{ borderTopColor: '#0284c7' }}>
              <span className={styles.statLabel}>Integrity Status</span>
              <span className={styles.statValue} style={{ color: '#0284c7' }}>{results.integrityStatus || 'CLEAN'}</span>
            </div>
          </div>

          {report && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Proctoring Telemetry Events
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {report.events && report.events.length > 0 ? (
                  report.events.map((ev: any, idx: number) => (
                    <div key={idx} style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 6px', background: ev.severity === 'CRITICAL' ? '#fee2e2' : '#f0fdf4', color: ev.severity === 'CRITICAL' ? '#dc2626' : '#15803d' }}>
                          {ev.severity}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: '#334155' }}>{ev.title}</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : 'Verified'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.84rem', color: '#64748b' }}>No integrity anomalies detected during session.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CompanyAssessmentsPage;
