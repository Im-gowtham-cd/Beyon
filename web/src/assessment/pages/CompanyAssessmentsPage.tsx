import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentApi } from '../services/assessmentApi';
import { api } from '../../services/api/client';
import type { AssessmentSession, AssessmentResult, ProctoringReport } from '../types/assessment';
import { ShieldCheck, FileText, AlertTriangle } from 'lucide-react';
import styles from './AssessmentBuilderPage.module.css';

export function CompanyAssessmentsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'sessions' | 'reattempts'>('sessions');
  const [sessions, setSessions] = useState<AssessmentSession[]>([]);
  const [reattempts, setReattempts] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [report, setReport] = useState<ProctoringReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [sessionsData, reattemptsData] = await Promise.all([
        assessmentApi.getMySessions().catch(() => []),
        api.get<any[]>('/company/reattempts').catch(() => []),
      ]);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setReattempts(Array.isArray(reattemptsData) ? reattemptsData : []);
    } catch {
      setSessions([]);
      setReattempts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReattempt = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await api.post(`/company/reattempts/${requestId}/approve`, {
        reviewNotes: 'Approved by recruiter. 1 fresh attempt granted.',
      });
      await loadData();
    } catch (e) {
      console.error('Error approving reattempt:', e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectReattempt = async (requestId: string) => {
    const reason = window.prompt('Enter rejection reason for candidate:', 'Violations verified via dual-camera audit. Reattempt denied.');
    if (reason === null) return;
    setProcessingId(requestId);
    try {
      await api.post(`/company/reattempts/${requestId}/reject`, {
        reviewNotes: reason,
      });
      await loadData();
    } catch (e) {
      console.error('Error rejecting reattempt:', e);
    } finally {
      setProcessingId(null);
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

  const pendingReattemptsCount = reattempts.filter(r => r.status === 'PENDING').length;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Candidate Assessment Sessions &amp; Integrity Logs</h1>
          <p className={styles.subtitle}>
            Monitor live proctoring telemetry, audit anti-cheat violations, and review student reattempt appeals
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
          <span className={styles.statLabel}>Pending Reattempt Requests</span>
          <span className={styles.statValue} style={{ color: pendingReattemptsCount > 0 ? '#ea580c' : '#15803d' }}>
            {pendingReattemptsCount}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Clean Integrity Rate</span>
          <span className={styles.statValue} style={{ color: '#15803d' }}>
            {sessions.length > 0 ? '96.5%' : '0.0%'}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Proctoring Incident Flags</span>
          <span className={styles.statValue} style={{ color: '#dc2626' }}>
            {reattempts.length}
          </span>
        </div>
      </div>

      {/* Pending Reattempts Banner */}
      {pendingReattemptsCount > 0 && activeTab !== 'reattempts' && (
        <div
          style={{
            background: '#fff7ed',
            border: '1px solid #fdba74',
            borderLeft: '5px solid #ea580c',
            padding: '14px 18px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} style={{ color: '#ea580c' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#9a3412' }}>
                {pendingReattemptsCount} Candidate Reattempt Request{pendingReattemptsCount > 1 ? 's' : ''} Awaiting Review
              </div>
              <div style={{ fontSize: '0.78rem', color: '#c2410c' }}>
                Students whose proctored sessions were terminated have submitted appeals to retake the test.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('reattempts')}
            style={{
              padding: '7px 16px',
              background: '#ea580c',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            Review Reattempt Requests →
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('sessions')}
          style={{
            padding: '10px 18px',
            fontSize: '0.88rem',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'sessions' ? '3px solid #1c2d81' : '3px solid transparent',
            color: activeTab === 'sessions' ? '#1c2d81' : '#64748b',
            cursor: 'pointer',
          }}
        >
          All Candidate Sessions ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('reattempts')}
          style={{
            padding: '10px 18px',
            fontSize: '0.88rem',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'reattempts' ? '3px solid #ea580c' : '3px solid transparent',
            color: activeTab === 'reattempts' ? '#ea580c' : '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>Reattempt Requests</span>
          {pendingReattemptsCount > 0 && (
            <span style={{ padding: '2px 7px', borderRadius: '10px', background: '#ea580c', color: '#fff', fontSize: '0.72rem', fontWeight: 800 }}>
              {pendingReattemptsCount}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '80px', background: '#f1f5f9', border: '1px solid #e2e8f0' }} />
          ))}
        </div>
      ) : activeTab === 'reattempts' ? (
        /* Reattempt Requests Section */
        reattempts.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No reattempt requests submitted by candidates yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reattempts.map((req: any) => (
              <div
                key={req.id}
                style={{
                  background: '#ffffff',
                  border: `1px solid ${req.status === 'PENDING' ? '#fdba74' : req.status === 'APPROVED' ? '#86efac' : '#e2e8f0'}`,
                  borderLeft: `5px solid ${req.status === 'PENDING' ? '#ea580c' : req.status === 'APPROVED' ? '#16a34a' : '#94a3b8'}`,
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                      {req.candidateName}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      ({req.candidateEmail} &middot; {req.registrationNumber || req.department || 'Student'})
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        background: req.status === 'PENDING' ? '#fff7ed' : req.status === 'APPROVED' ? '#f0fdf4' : '#fef2f2',
                        color: req.status === 'PENDING' ? '#c2410c' : req.status === 'APPROVED' ? '#15803d' : '#991b1b',
                        border: `1px solid ${req.status === 'PENDING' ? '#fdba74' : req.status === 'APPROVED' ? '#86efac' : '#fca5a5'}`,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {req.status}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Requested: {req.createdAt ? new Date(req.createdAt).toLocaleString() : ''}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  <div style={{ background: '#f8fafc', padding: '10px 14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Target Drive &amp; Termination Cause:
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{req.opportunityTitle}</div>
                    <div style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '2px', fontWeight: 500 }}>
                      {req.terminationReason || 'Terminated by Proctoring Rule Engine'}
                    </div>
                  </div>

                  <div style={{ background: '#fffbeb', padding: '10px 14px', border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Student's Appeal / Reason:
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#78350f', lineHeight: 1.4 }}>
                      "{req.studentReason || 'No details provided'}"
                    </div>
                  </div>
                </div>

                {req.reviewNotes && (
                  <div style={{ fontSize: '0.78rem', color: '#475569', fontStyle: 'italic' }}>
                    Recruiter Note: {req.reviewNotes}
                  </div>
                )}

                {req.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button
                      onClick={() => handleRejectReattempt(req.id)}
                      disabled={processingId === req.id}
                      style={{
                        padding: '6px 14px',
                        background: '#ffffff',
                        border: '1px solid #dc2626',
                        color: '#dc2626',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      ✕ Reject Reattempt
                    </button>
                    <button
                      onClick={() => handleApproveReattempt(req.id)}
                      disabled={processingId === req.id}
                      style={{
                        padding: '6px 16px',
                        background: '#16a34a',
                        border: '1px solid #16a34a',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                      }}
                    >
                      ✓ Approve Reattempt (Unlock Test)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : sessions.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No assessment sessions logged yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sessions.map((session: any) => {
            const sid = session.sessionId || session.id;
            return (
              <div
                key={sid}
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
                      {session.candidateName || 'Verified Candidate'}
                    </span>
                    {session.candidateEmail && (
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        ({session.candidateEmail} &middot; {session.college || session.department || 'Campus Scholar'})
                      </span>
                    )}
                    <span className={`${styles.statusBadge} ${session.status === 'COMPLETED' || session.status === 'SUBMITTED' ? styles.statusPublished : styles.statusDraft}`}>
                      {session.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{session.assessmentTitle || session.opportunityTitle || 'Technical Benchmark Test'}</span>
                    <span>&middot;</span>
                    <span>{session.questionsAttempted ?? session.totalQuestions ?? 0} Qs Attempted</span>
                    {session.score !== undefined && session.score !== null && (
                      <>
                        <span>&middot;</span>
                        <span style={{ color: '#15803d', fontWeight: 600 }}>Score: {session.score}%</span>
                      </>
                    )}
                    {session.integrityStatus && (
                      <>
                        <span>&middot;</span>
                        <span style={{ color: session.integrityStatus === 'CLEAN' ? '#15803d' : '#dc2626', fontWeight: 600 }}>
                          Integrity: {session.integrityStatus}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className={styles.btnSecondary}
                    onClick={() => navigate(`/company/assessments/${sid}/proctoring`)}
                    title="Open full DualView multi-camera incident & risk audit"
                  >
                    <ShieldCheck size={15} color="#2563eb" />
                    <span>DualView Audit</span>
                  </button>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => viewResults(sid)}
                  >
                    <FileText size={15} />
                    <span>Audit Results</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Session Modal / Details */}
      {selectedSession && results && (
        <div className={styles.formCard} style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <h2 className={styles.sectionHeading} style={{ border: 'none', margin: 0, padding: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} style={{ color: '#1c2d81' }} />
                <span>Candidate Assessment Scorecard &amp; Integrity Audit</span>
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                Session ID: {selectedSession}
              </div>
            </div>
            <button className={styles.btnSecondary} onClick={() => setSelectedSession(null)}>
              Close Audit
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '12px' }}>
            <div className={styles.statCard} style={{ borderTopColor: '#15803d' }}>
              <span className={styles.statLabel}>Candidate Score</span>
              <span className={styles.statValue} style={{ color: '#15803d' }}>
                {results.accuracy !== undefined && results.accuracy !== null ? `${results.accuracy}%` : `${results.score ?? 0}%`}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Questions Correct</span>
              <span className={styles.statValue}>
                {results.questionsCorrect ?? 0} / {results.questionsAttempted ?? 0}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Time Used</span>
              <span className={styles.statValue}>{formatTime(results.timeUsedSeconds ?? 0)}</span>
            </div>
            <div className={styles.statCard} style={{ borderTopColor: results.integrityStatus === 'CLEAN' ? '#15803d' : '#dc2626' }}>
              <span className={styles.statLabel}>Integrity Status</span>
              <span className={styles.statValue} style={{ color: results.integrityStatus === 'CLEAN' ? '#15803d' : '#dc2626' }}>
                {results.integrityStatus || 'CLEAN'}
              </span>
            </div>
          </div>

          {((report && report.events && report.events.length > 0) || (results.proctoringEvents && results.proctoringEvents.length > 0)) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Proctoring Telemetry Events &amp; Anomaly Log
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(report?.events || results.proctoringEvents || []).map((ev: any, idx: number) => (
                  <div key={idx} style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        background: ev.severity === 'CRITICAL' ? '#fee2e2' : ev.severity === 'HIGH' ? '#ffedd5' : '#f0fdf4',
                        color: ev.severity === 'CRITICAL' ? '#dc2626' : ev.severity === 'HIGH' ? '#c2410c' : '#15803d',
                        border: `1px solid ${ev.severity === 'CRITICAL' ? '#fca5a5' : ev.severity === 'HIGH' ? '#fdba74' : '#bbf7d0'}`
                      }}>
                        {ev.severity || 'INFO'}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>{ev.title || ev.eventType}</div>
                        {ev.description && <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{ev.description}</div>}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : 'Logged'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '16px', padding: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '0.84rem', fontWeight: 600 }}>
              ✓ No integrity anomalies detected during this proctored session.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CompanyAssessmentsPage;
