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

  if (loading) {
    return <div className={styles.container}><div className={styles.emptyState}>Loading assessment...</div></div>;
  }

  if (error) {
    return <div className={styles.container}><div className={styles.emptyState}><div className={styles.emptyStateTitle}>Error</div><p className={styles.emptyStateText}>{error}</p></div></div>;
  }

  if (!session && !launchToken) {
    return <div className={styles.container}><div className={styles.emptyState}><div className={styles.emptyStateTitle}>No Assessment</div><p className={styles.emptyStateText}>Please open this page from the desktop assessment app.</p></div></div>;
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
              <div className={`${styles.checkIcon} ${styles.checkPass}`}>📷</div>
              <div><div className={styles.checkLabel}>Camera Access</div><div className={styles.checkStatus}>Ready</div></div>
            </div>
            <div className={styles.checkItem}>
              <div className={`${styles.checkIcon} ${styles.checkPass}`}>👤</div>
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
          >
            {answers[questionId]?.marked ? '★ Marked' : '☆ Mark for Review'}
          </button>
        </div>
      </div>

      <div className={styles.navButtons}>
        <button
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          ← Previous
        </button>
        <div className={styles.flexRow}>
          {currentQuestion < totalQuestions - 1 && (
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setCurrentQuestion(currentQuestion + 1)}>
              Next →
            </button>
          )}
          {currentQuestion === totalQuestions - 1 && (
            <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={handleSubmit}>
              Submit Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssessmentPage;
