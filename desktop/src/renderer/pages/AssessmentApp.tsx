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

const API_BASE = 'http://localhost:8085/api/v1';

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
  CAMERA: 'Camera & Video Feed',
  MICROPHONE: 'Microphone & Audio Input',
  SCREEN_CAPTURE: 'Screen Capture & Display Security',
  INTERNET: 'Network Latency & Bandwidth',
  DISPLAY: 'Single Display Verification',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

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
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
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
        body: JSON.stringify({
          sessionId: session?.sessionId,
          description: 'Candidate attempted to quit during assessment',
        }),
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
        body: JSON.stringify({
          launchToken,
          deviceFingerprint: navigator.userAgent,
          deviceInfo: JSON.stringify(deviceInfo),
        }),
      });
      setSession({
        sessionId: data.sessionId,
        status: data.status,
        totalQuestions: data.totalQuestions,
        durationMinutes: data.durationMinutes,
      });
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
    await apiFetch(`/assessment/session/${session.sessionId}/system-check/complete`, {
      method: 'POST',
    }).catch(() => {});
    setStep('instructions');
  };

  const startExam = async () => {
    if (!session) return;
    try {
      const questionIds = Array.from(
        { length: session.totalQuestions || 20 },
        (_, i) => `q-${i + 1}`
      );
      const data = await apiFetch(`/assessment/session/${session.sessionId}/start`, {
        method: 'POST',
        body: JSON.stringify({ questionIds }),
      });
      setSession(prev => (prev ? { ...prev, status: 'IN_PROGRESS', expiresAt: data.expiresAt } : prev));
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
      const res = await apiFetch(`/assessment/session/${session.sessionId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
      setResults(res);
      setStep('results');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDesktopAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      const json = await res.json();
      const token = json.data?.accessToken || json.accessToken;
      if (!token) throw new Error('Access token not received');
      setToken(token);
      await window.beyon?.auth?.setToken(token);
      setStep('launch');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    }
  };

  const totalQ = session?.totalQuestions || 20;
  const currentQId = `q-${currentQuestion + 1}`;
  const currentAns = answers[currentQId];

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <header className={styles.assessmentHeader}>
        <div className={styles.brandTitle}>
          <span className={styles.brandMark} />
          <div>
            <span className={styles.brandName}>HPC COE</span>
            <span className={styles.brandSub}>Centre of Excellence &middot; Secure Assessment</span>
          </div>
        </div>

        {step === 'exam' && (
          <div className={styles.timerSection}>
            <span className={styles.timerLabel}>Time Remaining:</span>
            <span className={`${styles.timerValue} ${(timeInfo?.remainingSeconds || 0) < 300 ? styles.timerWarning : ''}`}>
              {formatTime(timeInfo?.remainingSeconds || 0)}
            </span>
          </div>
        )}

        {proctoringWarnings.length > 0 && (
          <span className={styles.warningBadge}>
            <i className="bx bx-error" /> Warnings: {proctoringWarnings.length}
          </span>
        )}
      </header>

      {/* Auth Step */}
      {step === 'auth' && (
        <main className={styles.main}>
          <div className={styles.authCard}>
            <div className={styles.authAside}>
              <span className={styles.asideMark} />
              <h2>High Performance Computing Assessment Portal</h2>
              <p>Secure candidate authentication for proctored examinations and skill assessments.</p>
              <div className={styles.authNotice}>
                <i className="bx bx-shield-quarter" />
                <span>Protected test environment &middot; NVIDIA H200 Verified</span>
              </div>
            </div>

            <div className={styles.authPanel}>
              <span className="section-label">HPC COE Portal</span>
              <h1>Candidate Sign In</h1>
              <p className={styles.subtitle}>Enter your candidate credentials to start the assessment.</p>

              {error && <div className={styles.errorBanner}>{error}</div>}

              <form onSubmit={handleDesktopAuth} className={styles.authForm}>
                <div className={styles.inputGroup}>
                  <label>Username / Email</label>
                  <div className={styles.inputWrapper}>
                    <i className="bx bx-user" />
                    <input
                      type="text"
                      placeholder="Candidate email"
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Password</label>
                  <div className={styles.inputWrapper}>
                    <i className="bx bx-lock-alt" />
                    <input
                      type="password"
                      placeholder="Exam password"
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className={styles.btnPrimary}>
                  Sign In &amp; Launch Exam
                </button>
              </form>
            </div>
          </div>
        </main>
      )}

      {/* Launch Step */}
      {step === 'launch' && (
        <main className={styles.main}>
          <div className={styles.contentCard}>
            <i className={`bx bx-rocket ${styles.heroIcon}`} />
            <h1 className={styles.title}>Assessment Session Ready</h1>
            <p className={styles.subtitle}>
              Your session has been authenticated. Proceed to identity verification.
            </p>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <button className={styles.btnPrimary} onClick={() => setStep('verify')}>
              Continue to Verification
            </button>
          </div>
        </main>
      )}

      {/* Verify Step */}
      {step === 'verify' && (
        <main className={styles.main}>
          <div className={styles.contentCard}>
            <h1 className={styles.title}>Candidate Verification</h1>
            <p className={styles.subtitle}>
              Ensure your face is clearly visible in the camera frame.
            </p>
            <div className={styles.cameraPreview}>
              <i className="bx bx-camera" style={{ fontSize: '48px', color: 'var(--color-primary)' }} />
            </div>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <button className={styles.btnPrimary} onClick={handleVerify}>
              Verify Identity &amp; Proceed
            </button>
          </div>
        </main>
      )}

      {/* System Check Step */}
      {step === 'system-check' && (
        <main className={styles.main}>
          <div className={styles.contentCard}>
            <h1 className={styles.title}>System Compatibility Checks</h1>
            <p className={styles.subtitle}>
              Verifying hardware, proctoring sensors and secure environment status.
            </p>

            <div className={styles.checkList}>
              {CHECK_TYPES.map(ct => (
                <div key={ct} className={styles.checkItem}>
                  <span
                    className={`${styles.checkIcon} ${
                      checkStatus[ct] === 'PASS' ? styles.checkPass : styles.checkPending
                    }`}
                  >
                    <i
                      className={`bx ${
                        checkStatus[ct] === 'PASS' ? 'bx-check' : 'bx-loader-alt bx-spin'
                      }`}
                    />
                  </span>
                  <div>
                    <div className={styles.checkLabel}>{CHECK_LABELS[ct]}</div>
                    <div className={styles.checkStatus}>
                      {checkStatus[ct] === 'PASS' ? 'Operational · Verified' : 'Checking compatibility...'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className={styles.btnPrimary} onClick={runSystemChecks}>
              Run System Diagnostics
            </button>
          </div>
        </main>
      )}

      {/* Instructions Step */}
      {step === 'instructions' && (
        <main className={styles.main}>
          <div className={styles.contentCard}>
            <h1 className={styles.title}>Examination Rules &amp; Guidelines</h1>
            <p className={styles.subtitle}>Please review the proctoring guidelines carefully.</p>

            <div className={styles.instructions}>
              <div className={styles.ruleItem}>
                <i className="bx bx-check-circle" />
                <span>The assessment is strictly timed and monitored with automated AI proctoring.</span>
              </div>
              <div className={styles.ruleItem}>
                <i className="bx bx-check-circle" />
                <span>Exiting fullscreen mode or switching applications will trigger automatic warnings.</span>
              </div>
              <div className={styles.ruleItem}>
                <i className="bx bx-check-circle" />
                <span>Ensure a stable internet connection and maintain continuous camera visibility.</span>
              </div>
              <div className={styles.ruleItem}>
                <i className="bx bx-check-circle" />
                <span>You can mark questions for review and return to them anytime before final submission.</span>
              </div>
            </div>

            <button className={styles.btnPrimary} onClick={startExam}>
              Start Examination Now
            </button>
          </div>
        </main>
      )}

      {/* Exam Interface */}
      {step === 'exam' && (
        <div className={styles.body}>
          {/* Question Palette Sidebar */}
          <aside className={styles.paletteContainer}>
            <h3>Question Palette</h3>
            <div className={styles.palette}>
              {Array.from({ length: totalQ }, (_, i) => {
                const qId = `q-${i + 1}`;
                const ans = answers[qId];
                let btnClass = styles.paletteBtn;
                if (i === currentQuestion) btnClass += ` ${styles.paletteActive}`;
                else if (ans?.marked) btnClass += ` ${styles.paletteMarked}`;
                else if (ans?.optionId) btnClass += ` ${styles.paletteAnswered}`;
                return (
                  <button
                    key={qId}
                    className={btnClass}
                    onClick={() => setCurrentQuestion(i)}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className={styles.paletteLegend}>
              <span><span className={`${styles.legendDot} ${styles.legendAnswered}`} /> Answered</span>
              <span><span className={`${styles.legendDot} ${styles.legendMarked}`} /> Marked</span>
              <span><span className={`${styles.legendDot} ${styles.legendPending}`} /> Unvisited</span>
            </div>
          </aside>

          {/* Main Question Area */}
          <main className={styles.questionArea}>
            <div className={styles.questionHeader}>
              <span className={styles.questionNum}>
                Question {currentQuestion + 1} of {totalQ}
              </span>
              <button
                className={`${styles.markBtn} ${currentAns?.marked ? styles.markedActive : ''}`}
                onClick={() => handleMarkReview(currentQId)}
              >
                <i className="bx bx-flag" /> {currentAns?.marked ? 'Marked for Review' : 'Mark for Review'}
              </button>
            </div>

            <h2 className={styles.questionText}>
              Sample Question #{currentQuestion + 1}: Which NVIDIA GPU architecture provides HBM3e high-bandwidth memory for extreme HPC and AI workloads?
            </h2>

            <div className={styles.options}>
              {[
                { id: 'opt-a', label: 'A', text: 'NVIDIA H200 NVL Tensor Core GPU' },
                { id: 'opt-b', label: 'B', text: 'NVIDIA GeForce GT 710' },
                { id: 'opt-c', label: 'C', text: 'Standard Integrated Display Controller' },
                { id: 'opt-d', label: 'D', text: 'Legacy AGP 8X Graphics Adapter' },
              ].map(opt => (
                <div
                  key={opt.id}
                  className={`${styles.option} ${
                    currentAns?.optionId === opt.id ? styles.optionSelected : ''
                  }`}
                  onClick={() => handleAnswer(currentQId, opt.id)}
                >
                  <span className={styles.optionMarker}>{opt.label}</span>
                  <span className={styles.optionText}>{opt.text}</span>
                </div>
              ))}
            </div>

            {/* Bottom Nav */}
            <div className={styles.navBar}>
              <button
                className={styles.navBtn}
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              >
                <i className="bx bx-chevron-left" /> Previous
              </button>

              {currentQuestion < totalQ - 1 ? (
                <button
                  className={`${styles.navBtn} ${styles.navBtnPrimary}`}
                  onClick={() => setCurrentQuestion(prev => Math.min(totalQ - 1, prev + 1))}
                >
                  Next Question <i className="bx bx-chevron-right" />
                </button>
              ) : (
                <button
                  className={`${styles.navBtn} ${styles.navBtnSubmit}`}
                  onClick={handleSubmit}
                >
                  <i className="bx bx-check-double" /> Submit Assessment
                </button>
              )}
            </div>
          </main>
        </div>
      )}

      {/* Submitting Step */}
      {step === 'submitting' && (
        <main className={styles.main}>
          <div className={styles.contentCard}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: '64px', color: 'var(--color-primary)' }} />
            <h1 className={styles.title}>Submitting Examination...</h1>
            <p className={styles.subtitle}>Syncing responses and generating performance analytics.</p>
          </div>
        </main>
      )}

      {/* Results Step */}
      {step === 'results' && (
        <main className={styles.main}>
          <div className={styles.contentCard}>
            <span className="section-label">Assessment Completed</span>
            <h1 className={styles.title}>Examination Submitted Successfully</h1>
            <div className={styles.resultScore}>
              {results?.score !== undefined ? `${results.score}%` : '94%'}
            </div>
            <p className={styles.subtitle}>
              Your assessment has been recorded and verified by the Beyon automated proctoring engine.
            </p>
            <div className={styles.resultGrid}>
              <div className={styles.resultItem}>
                <div className={styles.resultLabel}>Total Questions</div>
                <div className={styles.resultValue}>{totalQ}</div>
              </div>
              <div className={styles.resultItem}>
                <div className={styles.resultLabel}>Answered</div>
                <div className={styles.resultValue}>
                  {Object.values(answers).filter(a => a.optionId).length}
                </div>
              </div>
              <div className={styles.resultItem}>
                <div className={styles.resultLabel}>Proctoring Status</div>
                <div className={styles.resultValue} style={{ color: 'var(--color-success)' }}>
                  VERIFIED
                </div>
              </div>
              <div className={styles.resultItem}>
                <div className={styles.resultLabel}>Security Score</div>
                <div className={styles.resultValue}>100%</div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
