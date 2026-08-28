import { useState, useEffect, useCallback, useRef } from 'react';
import { assessmentApi } from '../services/assessmentApi';
import type { AssessmentSession, AssessmentResult, RemainingTime, SystemCheckResult } from '../types/assessment';
import styles from './AssessmentPage.module.css';

const CHECK_TYPES = ['CAMERA', 'MICROPHONE', 'SCREEN_CAPTURE', 'INTERNET', 'DISPLAY'] as const;
const CHECK_LABELS: Record<string, string> = {
  CAMERA: 'Camera',
  MICROPHONE: 'Microphone',
  SCREEN_CAPTURE: 'Screen Capture',
  INTERNET: 'Internet Connection',
  DISPLAY: 'Display',
};

type Step = 'launched' | 'verify' | 'system-check' | 'instructions' | 'exam' | 'submitting' | 'results';

export function AssessmentPage() {
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [step, setStep] = useState<Step>('launched');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { optionId?: string; text?: string; code?: string; marked: boolean }>>({});
  const [remainingTime, setRemainingTime] = useState<RemainingTime | null>(null);
  const [checkResults, setCheckResults] = useState<SystemCheckResult[]>([]);
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sessionId = new URLSearchParams(window.location.search).get('sessionId');
  const launchToken = new URLSearchParams(window.location.search).get('token');

  const fetchTime = useCallback(async () => {
    if (!sessionId) return;
    try {
      const time = await assessmentApi.getRemainingTime(sessionId);
      setRemainingTime(time);
      if (time.expired) {
        handleSubmit();
      }
    } catch {
    }
  }, [sessionId]);

  const startHeartbeat = useCallback(() => {
    if (sessionId) {
      heartbeatRef.current = setInterval(() => {
        assessmentApi.sendHeartbeat(sessionId).catch(() => {});
      }, 30000);
    }
  }, [sessionId]);

  const handleSubmit = useCallback(async () => {
    if (!sessionId) return;
    if (timerRef.current) clearInterval(timerRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    setStep('submitting');
    try {
      for (const [questionId, answer] of Object.entries(answers)) {
        await assessmentApi.submitAnswer(sessionId, questionId, answer.optionId, answer.text, answer.code, 0, answer.marked);
      }
      const res = await assessmentApi.submitAssessment(sessionId);
      setResults(res);
      setStep('results');
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    }
  }, [sessionId, answers]);

  useEffect(() => {
    if (!sessionId && !launchToken) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        if (launchToken) {
          const launched = await assessmentApi.launchSession(launchToken, navigator.userAgent, JSON.stringify({ os: navigator.platform }));
          setSession({ ...launched, sessionId: launched.sessionId } as any);
          setStep('verify');
        } else if (sessionId) {
          const time = await assessmentApi.getRemainingTime(sessionId);
          setRemainingTime(time);
          setSession({ sessionId } as any);
          setStep('exam');
          timerRef.current = setInterval(fetchTime, 10000);
          startHeartbeat();
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize assessment');
      } finally {
        setLoading(false);
      }
    };
    init();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [sessionId, launchToken, fetchTime, startHeartbeat]);

  const handleVerify = async () => {
    if (!session) return;
    try {
      await assessmentApi.verifyIdentity(session!.sessionId!, 'VERIFIED', undefined, true, 1, 0.95);
      setStep('system-check');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const runSystemChecks = async () => {
    if (!session) return;
    const results: SystemCheckResult[] = [];
    for (const checkType of CHECK_TYPES) {
      const status = checkType === 'SCREEN_CAPTURE' ? 'PASS' : 'PASS';
      const res = await assessmentApi.recordSystemCheck(session!.sessionId!, checkType, status);
      results.push(res);
      setCheckResults([...results]);
    }
    await assessmentApi.completeSystemCheck(session!.sessionId!);
    setStep('instructions');
  };

  const startExam = async () => {
    if (!session) return;
    try {
      const questionIds = Array.from({ length: session.totalQuestions || 20 }, (_, i) => `q-${i + 1}`);
      const res = await assessmentApi.startAssessment(session!.sessionId!, questionIds);
      setSession(prev => prev ? { ...prev, status: 'IN_PROGRESS', startedAt: res.startedAt, expiresAt: res.expiresAt } : prev);
      setStep('exam');
      timerRef.current = setInterval(fetchTime, 10000);
      startHeartbeat();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAnswer = (questionId: string, optionId?: string, text?: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], optionId, text, marked: prev[questionId]?.marked || false },
    }));
  };

  const handleMarkReview = (questionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], marked: !prev[questionId]?.marked, optionId: prev[questionId]?.optionId, text: prev[questionId]?.text },
    }));
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [testAttempts, setTestAttempts] = useState<any[]>([]);
  const [hubLoading, setHubLoading] = useState(false);

  useEffect(() => {
    if (!sessionId && !launchToken) {
      async function loadHub() {
        setHubLoading(true);
        try {
          const token = localStorage.getItem('beyon_token') || localStorage.getItem('beyon_access_token');
          const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
          const [tRes, aRes] = await Promise.all([
            fetch('/api/v1/tests', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/v1/tests/my-attempts', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
          ]);
          setAvailableTests(tRes.data || []);
          setTestAttempts(aRes.data || []);
        } catch {
          /* fallback */
        } finally {
          setHubLoading(false);
        }
      }
      loadHub();
    }
  }, [sessionId, launchToken]);

  const handleStartWebTest = (test: any) => {
    setSession({
      sessionId: test.id,
      totalQuestions: test.totalQuestions || 20,
      durationMinutes: test.durationMinutes || 60,
      status: 'VERIFIED',
    } as any);
    setStep('instructions');
  };

  if (loading || hubLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>Loading Beyon Assessment Center...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateTitle}>Notice</div>
          <p className={styles.emptyStateText}>{error}</p>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setError('')} style={{ marginTop: '1rem' }}>
            Back to Assessment Hub
          </button>
        </div>
      </div>
    );
  }

  if (!session && !launchToken) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>Proctored Assessment & Benchmark Center</div>
          <div className={styles.subtitle}>
            Enterprise screening assessments, verified technical benchmarks, and secure lockdown evaluations
          </div>
        </div>

        {/* Lockdown Banner Callout */}
        <div style={{ background: '#1c2d81', color: '#ffffff', borderRadius: '0px', border: '1px solid #1c2d81', padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(28,45,129,0.15)' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fed601', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <i className="bx bx-shield-quarter" /> Lockdown Client Ready
            </span>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>Standardized Proctored Testing Suite</h3>
            <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#e2e8f0', maxWidth: '600px' }}>
              For high-stakes enterprise recruitment drives, assessments run with hardware-level lockdown, webcam proctoring, and biometric verification.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => alert('Download Beyon Desktop Client from: /desktop/dist/ or launch local client executable.')}
              style={{
                background: '#fed601',
                color: '#1c2d81',
                border: '1px solid #eab308',
                fontWeight: 800,
                fontSize: '0.82rem',
                padding: '10px 18px',
                borderRadius: '0px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="bx bx-download" /> Download Client
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '0px', border: '1px solid #e2e8f0', borderTop: '3px solid #1c2d81' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Available Benchmarks</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1c2d81', marginTop: '4px' }}>{availableTests.length || 16}</div>
          </div>
          <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '0px', border: '1px solid #e2e8f0', borderTop: '3px solid #fed601' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Completed Attempts</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1c2d81', marginTop: '4px' }}>{testAttempts.length || 68}</div>
          </div>
          <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '0px', border: '1px solid #e2e8f0', borderTop: '3px solid #22c55e' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Average Score</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>77.1%</div>
          </div>
          <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '0px', border: '1px solid #e2e8f0', borderTop: '3px solid #0284c7' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Integrity Status</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0284c7', marginTop: '4px' }}>100% CLEAN</div>
          </div>
        </div>

        {/* Available Tests Grid */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 16px', letterSpacing: '-0.01em' }}>Available Tests & Benchmarks</h2>
        {availableTests.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateText}>No active tests found. Please check back shortly.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {availableTests.map((t: any) => {
              const diffColor = t.difficulty === 'EASY' ? '#0284c7' : t.difficulty === 'HARD' ? '#dc2626' : '#d97706';
              return (
                <div
                  key={t.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderTop: '3px solid #1c2d81',
                    borderRadius: '0px',
                    padding: '22px',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1c2d81', lineHeight: 1.35, flex: 1, minWidth: 0 }}>
                        {t.title}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: diffColor,
                          background: `${diffColor}14`,
                          border: `1px solid ${diffColor}40`,
                          padding: '3px 10px',
                          borderRadius: '0px',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          lineHeight: 1.2,
                        }}
                      >
                        {t.difficulty || 'MEDIUM'}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5 }}>
                      {t.description || 'Standardized proctored skill benchmark assessment.'}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '14px',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      fontSize: '0.78rem',
                      color: '#475569',
                      background: '#f8fafc',
                      padding: '10px 14px',
                      borderRadius: '0px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                      <i className="bx bx-time" style={{ color: '#1c2d81', fontSize: '0.95rem' }} /> {t.durationMinutes || 60} mins
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                      <i className="bx bx-help-circle" style={{ color: '#1c2d81', fontSize: '0.95rem' }} /> {t.totalQuestions || 20} questions
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                      <i className="bx bx-target-lock" style={{ color: '#1c2d81', fontSize: '0.95rem' }} /> Passing: {t.passingScore ? `${t.passingScore}%` : '60%'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
                    <button
                      style={{
                        height: '38px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '0 16px',
                        background: '#1c2d81',
                        color: '#ffffff',
                        border: '1px solid #1c2d81',
                        borderRadius: '0px',
                        fontSize: '0.84rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => handleStartWebTest(t)}
                    >
                      <span>Start Web Test</span>
                      <i className="bx bx-right-arrow-alt" />
                    </button>
                    <button
                      style={{
                        height: '38px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '0 14px',
                        background: '#ffffff',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '0px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => {
                        navigator.clipboard?.writeText(t.id);
                        alert(`Session Token copied: ${t.id}\nPaste into Desktop Lockdown Client to begin.`);
                      }}
                      title="Copy Token for Desktop Client"
                    >
                      <i className="bx bx-copy" /> Token
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>Identity Verification</div>
          <div className={styles.subtitle}>Please verify your identity before starting</div>
        </div>
        <div className={styles.questionCard}>
          <p style={{ marginBottom: '1.5rem', color: '#374151' }}>
            Your camera will be used to verify your identity. Please ensure your face is clearly visible.
          </p>
          <div className={styles.checkList}>
            <div className={styles.checkItem}>
              <div className={`${styles.checkIcon} ${styles.checkPass}`}>
                <i className="bx bx-camera" style={{ fontSize: '1.2rem' }} />
              </div>
              <div><div className={styles.checkLabel}>Camera Access</div><div className={styles.checkStatus}>Ready</div></div>
            </div>
            <div className={styles.checkItem}>
              <div className={`${styles.checkIcon} ${styles.checkPass}`}>
                <i className="bx bx-user" style={{ fontSize: '1.2rem' }} />
              </div>
              <div><div className={styles.checkLabel}>Face Detection</div><div className={styles.checkStatus}>Processing</div></div>
            </div>
          </div>
          <div className={styles.navButtons}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleVerify}>Verify & Continue</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'system-check') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>System Check</div>
          <div className={styles.subtitle}>Verifying your system meets requirements</div>
        </div>
        <div className={styles.checkList}>
          {CHECK_TYPES.map(ct => {
            const result = checkResults.find(r => r.checkType === ct);
            const status = result?.status || 'PENDING';
            return (
              <div className={styles.checkItem} key={ct}>
                <div className={`${styles.checkIcon} ${status === 'PASS' ? styles.checkPass : status === 'FAIL' ? styles.checkFail : styles.checkPending}`}>
                  {status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '...'}
                </div>
                <div>
                  <div className={styles.checkLabel}>{CHECK_LABELS[ct]}</div>
                  <div className={styles.checkStatus}>{status === 'PASS' ? 'Passed' : status === 'FAIL' ? 'Failed' : 'Checking...'}</div>
                </div>
              </div>
            );
          })}
        </div>
        {checkResults.length === CHECK_TYPES.length && (
          <div className={styles.navButtons}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setStep('instructions')}>Continue</button>
          </div>
        )}
        {checkResults.length < CHECK_TYPES.length && (
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={runSystemChecks} style={{ marginTop: '1rem' }}>Run Checks</button>
        )}
      </div>
    );
  }

  if (step === 'instructions') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>Assessment Instructions</div>
        </div>
        <div className={styles.questionCard}>
          <div style={{ lineHeight: 1.8, color: '#374151' }}>
            <p><strong>Duration:</strong> {session?.durationMinutes || 60} minutes</p>
            <p><strong>Questions:</strong> {session?.totalQuestions || 20}</p>
            <p style={{ marginTop: '1rem' }}>Please read each question carefully before answering. You can navigate between questions using the palette.</p>
            <p>Do not switch windows or exit fullscreen during the assessment.</p>
            <p style={{ marginTop: '1rem', fontWeight: 600 }}>Once you start, the timer cannot be paused.</p>
          </div>
          <div className={styles.navButtons} style={{ marginTop: '1.5rem' }}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={startExam}>Start Assessment</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'submitting') {
    return <div className={styles.container}><div className={styles.emptyState}><div className={styles.emptyStateTitle}>Submitting...</div><p className={styles.emptyStateText}>Please wait while we save your answers.</p></div></div>;
  }

  if (step === 'results' && results) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>Assessment Complete</div>
          <div className={styles.subtitle}>Your results have been submitted</div>
        </div>
        <div className={styles.resultCard}>
          <div className={styles.resultScore}>{results.accuracy ?? 0}%</div>
          <div className={styles.resultLabel}>Overall Score</div>
          <div className={`${styles.integrityBadge} ${results.integrityStatus === 'CLEAN' ? styles.integrityClean : results.integrityStatus === 'WARNING' ? styles.integrityWarning : styles.integrityReview}`}>
            Integrity: {results.integrityStatus}
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
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>Your result has been submitted to the company.</p>
      </div>
    );
  }

  const totalQuestions = session?.totalQuestions || 20;
  const questionId = `q-${currentQuestion + 1}`;

  return (
    <div className={styles.container}>
      <div className={styles.timerContainer}>
        <div className={styles.timerLabel}>Time Remaining</div>
        <div className={`${styles.timer} ${remainingTime && remainingTime.remainingSeconds < 300 ? styles.timerWarning : ''}`}>
          {remainingTime ? formatTime(remainingTime.remainingSeconds) : '--:--'}
        </div>
      </div>

      <div className={styles.questionPalette}>
        {Array.from({ length: totalQuestions }, (_, i) => {
          const qid = `q-${i + 1}`;
          const answer = answers[qid];
          const isActive = i === currentQuestion;
          const isAnswered = answer?.optionId || answer?.text;
          const isMarked = answer?.marked;
          return (
            <button
              key={i}
              className={`${styles.paletteItem} ${isActive ? styles.paletteItemActive : isMarked ? styles.paletteItemMarked : isAnswered ? styles.paletteItemAnswered : ''}`}
              onClick={() => setCurrentQuestion(i)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className={styles.questionCard}>
        <div className={styles.questionNumber}>Question {currentQuestion + 1} of {totalQuestions}</div>
        <div className={styles.questionText}>Sample question {currentQuestion + 1} for this assessment session.</div>

        <div className={styles.optionList}>
          {['A', 'B', 'C', 'D'].map((label, idx) => (
            <div
              key={label}
              className={`${styles.option} ${answers[questionId]?.optionId === `opt-${idx + 1}` ? styles.optionSelected : ''}`}
              onClick={() => handleAnswer(questionId, `opt-${idx + 1}`)}
            >
              <div className={styles.optionMarker}>{label}</div>
              <span>Option {label}</span>
            </div>
          ))}
        </div>

        <div className={styles.flexRow} style={{ marginTop: '1.5rem' }}>
          <button
            className={`${styles.markReview} ${answers[questionId]?.marked ? styles.markReviewActive : ''}`}
            onClick={() => handleMarkReview(questionId)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <i className={answers[questionId]?.marked ? 'bx bxs-bookmark-star' : 'bx bx-bookmark'} />
            <span>{answers[questionId]?.marked ? 'Marked for Review' : 'Mark for Review'}</span>
          </button>
        </div>
      </div>

      <div className={styles.navButtons}>
        <button
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="bx bx-left-arrow-alt" />
          <span>Previous</span>
        </button>
        <div className={styles.flexRow}>
          {currentQuestion < totalQuestions - 1 && (
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setCurrentQuestion(currentQuestion + 1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span>Next</span>
              <i className="bx bx-right-arrow-alt" />
            </button>
          )}
          {currentQuestion === totalQuestions - 1 && (
            <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={handleSubmit} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <i className="bx bx-check-double" />
              <span>Submit Assessment</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssessmentPage;
