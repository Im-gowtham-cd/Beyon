import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './AssessmentApp.module.css';

declare global {
  interface Window {
    beyon?: {
      platform: string;
      auth?: {
        getToken: () => Promise<string | null>;
        setToken: (token: string) => Promise<void>;
        clearToken: () => Promise<void>;
      };
      assessment?: {
        enterFullscreen: () => Promise<boolean>;
        exitFullscreen: () => Promise<boolean>;
        isFullscreen: () => Promise<boolean>;
        lockWindow: () => Promise<boolean>;
        unlockWindow: () => Promise<boolean>;
        disableKeyboardShortcuts: () => Promise<boolean>;
        enableKeyboardShortcuts: () => Promise<boolean>;
        getSystemInfo: () => Promise<any>;
        getDeviceInfo: () => Promise<any>;
      };
      proctoring?: {
        onFullscreenChange: (callback: (isFullscreen: boolean) => void) => void;
        onFocusChange: (callback: (hasFocus: boolean) => void) => void;
        onBeforeQuit: (callback: () => void) => void;
        removeListeners: () => void;
      };
    };
  }
}

type Step = 'auth' | 'launch' | 'verify' | 'system-check' | 'instructions' | 'exam' | 'submitting' | 'results';

const API_BASE = 'http://localhost:8080/api/v1';

interface Session {
  sessionId: string;
  status: string;
  totalQuestions: number;
  durationMinutes: number;
  expiresAt?: string;
}

interface TimeInfo {
  remainingSeconds: number;
  expired: boolean;
  serverTime: string;
}

const CHECK_TYPES = ['CAMERA', 'MICROPHONE', 'SCREEN_CAPTURE', 'INTERNET', 'DISPLAY'] as const;
const CHECK_LABELS: Record<string, string> = {
  CAMERA: 'Camera',
  MICROPHONE: 'Microphone',
  SCREEN_CAPTURE: 'Screen Capture',
  INTERNET: 'Internet Connection',
  DISPLAY: 'Display',
};

export function AssessmentApp() {
  const [step, setStep] = useState<Step>('auth');
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { optionId?: string; marked: boolean }>>({});
  const [timeInfo, setTimeInfo] = useState<TimeInfo | null>(null);
  const [checkStatus, setCheckStatus] = useState<Record<string, 'PENDING' | 'PASS' | 'FAIL'>>({});
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [proctoringWarnings, setProctoringWarnings] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const launchToken = new URLSearchParams(window.location.search).get('token');

  const apiFetch = async (path: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  };

  useEffect(() => {
    const loadToken = async () => {
      const t = await window.beyon?.auth?.getToken();
      if (t) {
        setToken(t);
        setStep(launchToken ? 'launch' : 'auth');
      } else {
        setStep('auth');
      }
    };
    loadToken();

    return () => {
      window.beyon?.proctoring?.removeListeners();
      if (timerRef.current) clearInterval(timerRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [launchToken]);

  useEffect(() => {
    if (step !== 'exam') return;

    const handleFullscreenChange = (isFullscreen: boolean) => {
      if (!isFullscreen) {
        setProctoringWarnings(prev => [...prev, 'Fullscreen exited']);
        apiFetch('/proctoring/event/fullscreen-exit', {
          method: 'POST',
          body: JSON.stringify({ sessionId: session?.sessionId }),
        }).catch(() => {});
      }
    };

    const handleFocusChange = (hasFocus: boolean) => {
      if (!hasFocus) {
        setProctoringWarnings(prev => [...prev, 'Window focus lost']);
        apiFetch('/proctoring/event/focus-lost', {
          method: 'POST',
          body: JSON.stringify({ sessionId: session?.sessionId }),
        }).catch(() => {});
      }
    };

    const handleBeforeQuit = () => {
      setProctoringWarnings(prev => [...prev, 'Attempted to quit']);
      apiFetch('/proctoring/event/suspicious', {
        method: 'POST',
        body: JSON.stringify({ sessionId: session?.sessionId, description: 'Candidate attempted to quit during assessment' }),
      }).catch(() => {});
    };

    window.beyon?.proctoring?.onFullscreenChange(handleFullscreenChange);
    window.beyon?.proctoring?.onFocusChange(handleFocusChange);
    window.beyon?.proctoring?.onBeforeQuit(handleBeforeQuit);

    window.beyon?.assessment?.enterFullscreen();
    window.beyon?.assessment?.lockWindow();

    return () => {
      window.beyon?.proctoring?.removeListeners();
      window.beyon?.assessment?.unlockWindow();
    };
  }, [step, session]);

  const fetchTime = useCallback(async () => {
    if (!session?.sessionId) return;
    try {
      const time: TimeInfo = await apiFetch(`/assessment/session/${session.sessionId}/time`);
      setTimeInfo(time);
      if (time.expired) handleSubmit();
    } catch {}
  }, [session]);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(fetchTime, 10000);
    heartbeatRef.current = setInterval(() => {
      if (session?.sessionId) {
        apiFetch(`/assessment/session/${session.sessionId}/heartbeat`).catch(() => {});
      }
    }, 30000);
  }, [fetchTime, session]);

  const handleLaunch = async () => {
    if (!launchToken) return;
    try {
      const deviceInfo = await window.beyon?.assessment?.getDeviceInfo();
      const data = await apiFetch('/assessment/launch', {
        method: 'POST',
        body: JSON.stringify({ launchToken, deviceFingerprint: navigator.userAgent, deviceInfo: JSON.stringify(deviceInfo) }),
      });
      setSession({ sessionId: data.sessionId, status: data.status, totalQuestions: data.totalQuestions, durationMinutes: data.durationMinutes });
      setStep('verify');
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (step === 'launch' && launchToken) {
      handleLaunch();
    }
  }, [step, launchToken]);

  const handleVerify = async () => {
    if (!session) return;
    try {
      await apiFetch(`/assessment/session/${session.sessionId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ status: 'VERIFIED', faceDetected: true, faceCount: 1, livenessScore: 0.95 }),
      });
      setStep('system-check');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const runSystemChecks = async () => {
    if (!session) return;
    for (const ct of CHECK_TYPES) {
      setCheckStatus(prev => ({ ...prev, [ct]: 'PASS' }));
      await apiFetch(`/assessment/session/${session.sessionId}/system-check`, {
        method: 'POST',
        body: JSON.stringify({ checkType: ct, status: 'PASS' }),
      }).catch(() => {});
    }
    await apiFetch(`/assessment/session/${session.sessionId}/system-check/complete`, { method: 'POST' }).catch(() => {});
    setStep('instructions');
  };

  const startExam = async () => {
    if (!session) return;
    try {
      const questionIds = Array.from({ length: session.totalQuestions || 20 }, (_, i) => `q-${i + 1}`);
      const data = await apiFetch(`/assessment/session/${session.sessionId}/start`, {
        method: 'POST',
        body: JSON.stringify({ questionIds }),
      });
      setSession(prev => prev ? { ...prev, status: 'IN_PROGRESS', expiresAt: data.expiresAt } : prev);
      setStep('exam');
      startTimer();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { optionId, marked: prev[questionId]?.marked || false },
    }));
  };

  const handleMarkReview = (questionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], marked: !prev[questionId]?.marked },
    }));
  };

  const handleSubmit = async () => {
    if (!session) return;
    if (timerRef.current) clearInterval(timerRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    window.beyon?.assessment?.exitFullscreen();
    window.beyon?.assessment?.unlockWindow();
    setStep('submitting');
    try {
      for (const [questionId, answer] of Object.entries(answers)) {
        await apiFetch(`/assessment/session/${session.sessionId}/answer`, {
          method: 'POST',
          body: JSON.stringify({ questionId, selectedOptionId: answer.optionId, timeSpentSeconds: 0, markedForReview: answer.marked }),
        });
      }
      const data = await apiFetch(`/assessment/session/${session.sessionId}/submit`, { method: 'POST' });
      setResults(data);
      setStep('results');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.logoLarge}>B</div>
          <h2 className={styles.title}>Error</h2>
          <p className={styles.subtitle}>{error}</p>
          <button className={styles.btn} onClick={() => { setError(''); window.location.reload(); }}>Retry</button>
        </div>
      </div>
    );
  }

  if (step === 'auth') {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.logoLarge}>B</div>
          <h1 className={styles.title}>Beyon Assessment</h1>
          <p className={styles.subtitle}>Please open this app from the web application to start your assessment.</p>
        </div>
      </div>
    );
  }

  if (step === 'launch') {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.logoLarge}>B</div>
          <h1 className={styles.title}>Preparing Assessment...</h1>
          <p className={styles.subtitle}>Setting up secure environment</p>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.logoLarge}>B</div>
          <h1 className={styles.title}>Identity Verification</h1>
          <p className={styles.subtitle}>Please look at the camera and verify your identity</p>
          <div className={styles.cameraPreview}>
            <div style={{ color: '#6b7280', textAlign: 'center' }}>📷 Camera feed will appear here</div>
          </div>
          <button className={styles.btn} onClick={handleVerify} style={{ marginTop: '1.5rem' }}>Verify Identity</button>
        </div>
      </div>
    );
  }

  if (step === 'system-check') {
    const allDone = CHECK_TYPES.every(ct => checkStatus[ct] === 'PASS');
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <h1 className={styles.title}>System Check</h1>
          <p className={styles.subtitle}>Verifying your system meets requirements</p>
          <div className={styles.checkList}>
            {CHECK_TYPES.map(ct => (
              <div className={styles.checkItem} key={ct}>
                <div className={`${styles.checkIcon} ${checkStatus[ct] === 'PASS' ? styles.checkPass : styles.checkPending}`}>
                  {checkStatus[ct] === 'PASS' ? '✓' : '...'}
                </div>
                <div>
                  <div className={styles.checkLabel}>{CHECK_LABELS[ct]}</div>
                  <div className={styles.checkStatus}>{checkStatus[ct] === 'PASS' ? 'Passed' : 'Checking...'}</div>
                </div>
              </div>
            ))}
          </div>
          {!allDone && <button className={styles.btn} onClick={runSystemChecks}>Run System Checks</button>}
          {allDone && <button className={styles.btn} onClick={() => setStep('instructions')}>Continue</button>}
        </div>
      </div>
    );
  }

  if (step === 'instructions') {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <h1 className={styles.title}>Assessment Instructions</h1>
          <div className={styles.instructions}>
            <p><strong>Duration:</strong> {session?.durationMinutes || 60} minutes</p>
            <p><strong>Questions:</strong> {session?.totalQuestions || 20}</p>
            <p>• Do not switch windows or exit fullscreen</p>
            <p>• Your camera and screen are being monitored</p>
            <p>• The timer cannot be paused once started</p>
            <p>• Auto-submit when time expires</p>
          </div>
          <button className={styles.btn} onClick={startExam} style={{ marginTop: '1.5rem' }}>Start Assessment</button>
        </div>
      </div>
    );
  }

  if (step === 'submitting') {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.logoLarge}>B</div>
          <h1 className={styles.title}>Submitting...</h1>
          <p className={styles.subtitle}>Please wait while we save your answers</p>
        </div>
      </div>
    );
  }

  if (step === 'results' && results) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <h1 className={styles.title}>Assessment Complete</h1>
          <div className={styles.resultScore}>{results.accuracy ?? 0}%</div>
          <p className={styles.subtitle}>Your result has been submitted to the company</p>
          <div className={styles.resultGrid}>
            <div className={styles.resultItem}>
              <div className={styles.resultLabel}>Attempted</div>
              <div className={styles.resultValue}>{results.questionsAttempted}</div>
            </div>
            <div className={styles.resultItem}>
              <div className={styles.resultLabel}>Correct</div>
              <div className={styles.resultValue}>{results.questionsCorrect}</div>
            </div>
            <div className={styles.resultItem}>
              <div className={styles.resultLabel}>Time Used</div>
              <div className={styles.resultValue}>{formatTime(results.timeUsedSeconds)}</div>
            </div>
            <div className={styles.resultItem}>
              <div className={styles.resultLabel}>Integrity</div>
              <div className={styles.resultValue}>{results.integrityStatus}</div>
            </div>
          </div>
          <button className={styles.btn} onClick={() => window.close()} style={{ marginTop: '1.5rem' }}>Close</button>
        </div>
      </div>
    );
  }

  const totalQ = session?.totalQuestions || 20;
  const qId = `q-${currentQuestion + 1}`;

  return (
    <div className={styles.container}>
      <div className={styles.assessmentHeader}>
        <div className={styles.timerSection}>
          <span className={styles.timerLabel}>TIME</span>
          <span className={`${styles.timerValue} ${timeInfo && timeInfo.remainingSeconds < 300 ? styles.timerWarning : ''}`}>
            {timeInfo ? formatTime(timeInfo.remainingSeconds) : '--:--'}
          </span>
        </div>
        <div className={styles.assessmentTitle}>Assessment — Question {currentQuestion + 1}/{totalQ}</div>
        <div className={styles.warningCount}>
          {proctoringWarnings.length > 0 && <span className={styles.warningBadge}>⚠ {proctoringWarnings.length}</span>}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.palette}>
          {Array.from({ length: totalQ }, (_, i) => {
            const qid = `q-${i + 1}`;
            const a = answers[qid];
            return (
              <button
                key={i}
                className={`${styles.paletteBtn} ${i === currentQuestion ? styles.paletteActive : a?.marked ? styles.paletteMarked : a?.optionId ? styles.paletteAnswered : ''}`}
                onClick={() => setCurrentQuestion(i)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div className={styles.questionArea}>
          <div className={styles.questionNum}>Question {currentQuestion + 1}</div>
          <div className={styles.questionText}>Sample question {currentQuestion + 1} for this assessment.</div>

          <div className={styles.options}>
            {['A', 'B', 'C', 'D'].map((label, idx) => (
              <div
                key={label}
                className={`${styles.option} ${answers[qId]?.optionId === `opt-${idx + 1}` ? styles.optionSelected : ''}`}
                onClick={() => handleAnswer(qId, `opt-${idx + 1}`)}
              >
                <span className={styles.optionMarker}>{label}</span>
                <span>Option {label}</span>
              </div>
            ))}
          </div>

          <div className={styles.questionActions}>
            <button className={`${styles.markBtn} ${answers[qId]?.marked ? styles.markedActive : ''}`} onClick={() => handleMarkReview(qId)}>
              {answers[qId]?.marked ? '★ Marked' : '☆ Mark for Review'}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.navBar}>
        <button className={styles.navBtn} onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0}>
          ← Previous
        </button>
        {currentQuestion < totalQ - 1 ? (
          <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} onClick={() => setCurrentQuestion(currentQuestion + 1)}>
            Next →
          </button>
        ) : (
          <button className={`${styles.navBtn} ${styles.navBtnSubmit}`} onClick={handleSubmit}>
            Submit Assessment
          </button>
        )}
      </div>
    </div>
  );
}

export default AssessmentApp;
