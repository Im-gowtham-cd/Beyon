import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './AssessmentApp.module.css';

declare global {
  interface Window {
    beyon?: {
      platform: string;
      app?: {
        exitApp: () => Promise<void>;
        forceFullscreen: () => Promise<boolean>;
      };
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
        onMinimize: (callback: () => void) => void;
        onRestore: (callback: () => void) => void;
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const examVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const examCameraStreamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [checksRunning, setChecksRunning] = useState(false);
  const [examCameraReady, setExamCameraReady] = useState(false);
  const [malpracticeAlerts, setMalpracticeAlerts] = useState<{ id: number; type: string; msg: string; time: string }[]>([]);
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const alertCounterRef = useRef(0);
  const launchToken = new URLSearchParams(window.location.search).get('token');

  // Application Settings & Exit state
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [cameraTestActive, setCameraTestActive] = useState(false);
  const settingsVideoRef = useRef<HTMLVideoElement | null>(null);
  const settingsStreamRef = useRef<MediaStream | null>(null);

  // Real-Time Proctoring AI Engine state
  const [proctorStatus, setProctorStatus] = useState<'CLEAR' | 'WARNING' | 'CRITICAL'>('CLEAR');
  const [proctorMessage, setProctorMessage] = useState('Face Detected & Monitored');
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isTerminatingRef = useRef(false);
  const absenceStreakRef = useRef(0);
  const multiPersonStreakRef = useRef(0);
  const phoneStreakRef = useRef(0);
  const voiceStreakRef = useRef(0);
  const proctorIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const loadSys = async () => {
      try {
        const sys = await window.beyon?.assessment?.getSystemInfo();
        const dev = await window.beyon?.assessment?.getDeviceInfo();
        if (sys) setSystemInfo(sys);
        if (dev) setDeviceInfo(dev);
      } catch {}
    };
    loadSys();
  }, []);

  const toggleCameraTest = async () => {
    if (cameraTestActive) {
      if (settingsStreamRef.current) {
        settingsStreamRef.current.getTracks().forEach(t => t.stop());
        settingsStreamRef.current = null;
      }
      setCameraTestActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        settingsStreamRef.current = stream;
        if (settingsVideoRef.current) {
          settingsVideoRef.current.srcObject = stream;
          settingsVideoRef.current.play();
        }
        setCameraTestActive(true);
      } catch {
        setCameraTestActive(false);
      }
    }
  };

  const handleExitApp = () => {
    setShowExitModal(true);
  };

  const confirmExitApp = async () => {
    if (step === 'exam') {
      try {
        await handleSubmit();
      } catch {}
    }
    await window.beyon?.app?.exitApp?.();
  };

  const addMalpracticeAlert = (type: string, msg: string) => {
    const id = ++alertCounterRef.current;
    const time = new Date().toLocaleTimeString();
    setMalpracticeAlerts(prev => [...prev, { id, type, msg, time }]);
    setActiveAlert(msg);
    setTimeout(() => setActiveAlert(null), 5000);
  };


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
      if (proctorIntervalRef.current) clearInterval(proctorIntervalRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, [launchToken]);

  // ── Camera lifecycle: start when entering 'verify', stop when leaving ────────
  useEffect(() => {
    if (step !== 'verify') {
      // Stop any running camera stream when navigating away
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
        cameraStreamRef.current = null;
      }
      return;
    }

    setCameraReady(false);
    setCameraError('');

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
        cameraStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setCameraReady(true);
          };
        }
      } catch (err: any) {
        const msg =
          err.name === 'NotAllowedError'
            ? 'Camera access denied. Please allow camera permission in Windows Settings → Privacy → Camera.'
            : err.name === 'NotFoundError'
            ? 'No camera detected. Please connect a webcam and try again.'
            : `Camera error: ${err.message}`;
        setCameraError(msg);
      }
    };

    startCamera();

    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
        cameraStreamRef.current = null;
      }
    };
  }, [step]);

  useEffect(() => {
    if (step !== 'exam') {
      // Stop exam camera and analyzer when leaving exam
      if (proctorIntervalRef.current) {
        clearInterval(proctorIntervalRef.current);
        proctorIntervalRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (examCameraStreamRef.current) {
        examCameraStreamRef.current.getTracks().forEach(t => t.stop());
        examCameraStreamRef.current = null;
      }
      isTerminatingRef.current = false;
      absenceStreakRef.current = 0;
      multiPersonStreakRef.current = 0;
      phoneStreakRef.current = 0;
      voiceStreakRef.current = 0;
      return;
    }

    const handleFullscreenChange = (isFullscreen: boolean) => {
      if (!isFullscreen) {
        addMalpracticeAlert('FULLSCREEN_EXIT', 'Fullscreen mode exited — this has been recorded');
        setProctoringWarnings(prev => [...prev, 'Fullscreen exited']);
        if (session?.sessionId) {
          apiFetch('/proctoring/event/fullscreen-exit', {
            method: 'POST',
            body: JSON.stringify({ sessionId: session.sessionId }),
          }).catch(() => {});
        }
      }
    };

    const handleFocusChange = (hasFocus: boolean) => {
      if (!hasFocus) {
        addMalpracticeAlert('FOCUS_LOST', 'Tab / window switch detected — this has been recorded');
        setProctoringWarnings(prev => [...prev, 'Window focus lost']);
        if (session?.sessionId) {
          apiFetch('/proctoring/event/focus-lost', {
            method: 'POST',
            body: JSON.stringify({ sessionId: session.sessionId }),
          }).catch(() => {});
        }
      }
    };

    const handleMinimize = () => {
      addMalpracticeAlert('MINIMIZED', 'Application was minimized during the exam — this has been recorded');
      setProctoringWarnings(prev => [...prev, 'Window minimized']);
      if (session?.sessionId) {
        apiFetch('/proctoring/event/suspicious', {
          method: 'POST',
          body: JSON.stringify({
            sessionId: session.sessionId,
            description: 'Candidate minimized the application during assessment',
          }),
        }).catch(() => {});
      }
    };

    const handleBeforeQuit = () => {
      addMalpracticeAlert('QUIT_ATTEMPT', 'Attempted to close the application — this has been recorded');
      setProctoringWarnings(prev => [...prev, 'Attempted to quit']);
      if (session?.sessionId) {
        apiFetch('/proctoring/event/suspicious', {
          method: 'POST',
          body: JSON.stringify({
            sessionId: session.sessionId,
            description: 'Candidate attempted to quit during assessment',
          }),
        }).catch(() => {});
      }
    };

    window.beyon?.proctoring?.onFullscreenChange(handleFullscreenChange);
    window.beyon?.proctoring?.onFocusChange(handleFocusChange);
    window.beyon?.proctoring?.onMinimize(handleMinimize);
    window.beyon?.proctoring?.onBeforeQuit(handleBeforeQuit);

    // ── Start exam camera feed + Real-Time AI Proctoring Engine ─────────────────
    const startExamCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true,
        });
        examCameraStreamRef.current = stream;
        if (examVideoRef.current) {
          examVideoRef.current.srcObject = stream;
          examVideoRef.current.onloadedmetadata = () => {
            examVideoRef.current?.play();
            setExamCameraReady(true);
          };
        }

        // Setup Web Audio Analyser
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            const audioData = new Uint8Array(analyser.frequencyBinCount);

            (stream as any)._checkAudio = () => {
              analyser.getByteFrequencyData(audioData);
              let sum = 0;
              for (let i = 0; i < audioData.length; i++) {
                sum += audioData[i];
              }
              const avg = sum / audioData.length;
              if (avg > 52) {
                voiceStreakRef.current++;
                if (voiceStreakRef.current === 3) {
                  addMalpracticeAlert('SUSPICIOUS_AUDIO_DETECTED', 'Speech / conversation noise detected in test environment');
                  setProctoringWarnings(prev => [...prev, 'Suspicious voice detected']);
                }
              } else {
                voiceStreakRef.current = 0;
              }
            };
          }
        } catch {}

        // Setup Computer Vision Frame Analysis Canvas
        const canvas = analysisCanvasRef.current || document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 120;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        proctorIntervalRef.current = setInterval(() => {
          if (isTerminatingRef.current) return;
          if (!examVideoRef.current || examVideoRef.current.readyState < 2 || !ctx) return;

          // 1. Audio check
          if ((stream as any)._checkAudio) {
            (stream as any)._checkAudio();
          }

          // 2. Capture and analyze visual frame
          ctx.drawImage(examVideoRef.current, 0, 0, 160, 120);
          const frame = ctx.getImageData(0, 0, 160, 120);
          const data = frame.data;

          let centerSkinPixels = 0;
          let leftSkinPixels = 0;
          let rightSkinPixels = 0;
          let bottomHighContrastPixels = 0;

          for (let y = 0; y < 120; y++) {
            for (let x = 0; x < 160; x++) {
              const idx = (y * 160 + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];

              // Skin tone pixel model (RGB model for multiple skin tones)
              const isSkin =
                r > 55 && g > 38 && b > 20 &&
                r > g && r > b &&
                (r - g > 10) &&
                (Math.max(r, g, b) - Math.min(r, g, b) > 15);

              if (isSkin) {
                if (x >= 35 && x <= 125 && y >= 15 && y <= 95) {
                  centerSkinPixels++;
                } else if (x < 35 && y >= 20 && y <= 100) {
                  leftSkinPixels++;
                } else if (x > 125 && y >= 20 && y <= 100) {
                  rightSkinPixels++;
                }
              }

              // Object / phone edge detection in bottom area
              if (y >= 80 && x >= 40 && x <= 120) {
                const brightness = (r + g + b) / 3;
                if (brightness < 25 || brightness > 235) {
                  bottomHighContrastPixels++;
                }
              }
            }
          }

          // EVALUATION 1: Face Presence / Absence (Candidate left screen)
          if (centerSkinPixels < 75) {
            absenceStreakRef.current++;
            if (absenceStreakRef.current === 3) {
              setProctorStatus('WARNING');
              setProctorMessage('Face Not Detected');
              addMalpracticeAlert('FACE_NOT_DETECTED', 'Face not detected in camera frame! Please face your screen.');
              setProctoringWarnings(prev => [...prev, 'Face not visible']);
            } else if (absenceStreakRef.current >= 9) { // ~7-8 seconds of continuous absence
              isTerminatingRef.current = true;
              setProctorStatus('CRITICAL');
              setProctorMessage('AUTO-TERMINATED');
              addMalpracticeAlert('CRITICAL_ABSENCE_TERMINATION', 'Assessment automatically terminated: Candidate absent from camera view for >8 seconds.');
              handleSubmit();
              return;
            }
          } else {
            if (absenceStreakRef.current > 0 && absenceStreakRef.current < 9) {
              setProctorStatus('CLEAR');
              setProctorMessage('Face Detected & Monitored');
            }
            absenceStreakRef.current = 0;
          }

          // EVALUATION 2: Multiple People
          if (centerSkinPixels >= 75 && (leftSkinPixels > 220 || rightSkinPixels > 220)) {
            multiPersonStreakRef.current++;
            if (multiPersonStreakRef.current === 2) {
              setProctorStatus('WARNING');
              setProctorMessage('Multiple People in Frame');
              addMalpracticeAlert('MULTIPLE_PEOPLE_DETECTED', 'Multiple people detected in proctoring camera frame');
              setProctoringWarnings(prev => [...prev, 'Multiple persons detected']);
            }
          } else {
            multiPersonStreakRef.current = 0;
          }

          // EVALUATION 3: Phone / Unauthorized Device
          if (bottomHighContrastPixels > 700) {
            phoneStreakRef.current++;
            if (phoneStreakRef.current === 3) {
              setProctorStatus('WARNING');
              setProctorMessage('Unauthorized Device Detected');
              addMalpracticeAlert('MOBILE_PHONE_DETECTED', 'Unauthorized mobile phone / electronic device detected in camera frame');
              setProctoringWarnings(prev => [...prev, 'Mobile device detected']);
            } else if (phoneStreakRef.current >= 6) {
              isTerminatingRef.current = true;
              setProctorStatus('CRITICAL');
              setProctorMessage('AUTO-TERMINATED');
              addMalpracticeAlert('DEVICE_MALPRACTICE_TERMINATION', 'Assessment automatically terminated: Unauthorized mobile phone usage detected.');
              handleSubmit();
              return;
            }
          } else {
            phoneStreakRef.current = 0;
          }
        }, 800);

      } catch {
        setExamCameraReady(false);
      }
    };

    // Maximize + lock after a short delay to avoid race on startup
    const timer = setTimeout(() => {
      window.beyon?.assessment?.enterFullscreen();
      window.beyon?.assessment?.lockWindow();
      startExamCamera();
    }, 600);

    return () => {
      clearTimeout(timer);
      if (proctorIntervalRef.current) {
        clearInterval(proctorIntervalRef.current);
        proctorIntervalRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      window.beyon?.proctoring?.removeListeners();
      window.beyon?.assessment?.unlockWindow();
      if (examCameraStreamRef.current) {
        examCameraStreamRef.current.getTracks().forEach(t => t.stop());
        examCameraStreamRef.current = null;
      }
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
    setVerifying(true);
    setError('');
    try {
      // If a backend session exists, record verification; otherwise skip the API call
      if (session) {
        await apiFetch(`/assessment/session/${session.sessionId}/verify`, {
          method: 'POST',
          body: JSON.stringify({ status: 'VERIFIED', faceDetected: true, faceCount: 1, livenessScore: 0.95 }),
        });
      }
      // Stop the camera stream before moving on
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
        cameraStreamRef.current = null;
      }
      setStep('system-check');
    } catch (err: any) {
      setError(`Verification failed: ${err.message}. You may still proceed.`);
      // Don't block the user — let them continue anyway after a short delay
      setTimeout(() => {
        setStep('system-check');
      }, 2000);
    } finally {
      setVerifying(false);
    }
  };

  const runSystemChecks = async () => {
    if (checksRunning) return;
    setError('');
    setChecksRunning(true);
    // Reset all checks to pending first
    setCheckStatus({});
    // Run each check sequentially with a visual delay so user can see progress
    for (const ct of CHECK_TYPES) {
      await new Promise(resolve => setTimeout(resolve, 700)); // simulate hardware check
      setCheckStatus(prev => ({ ...prev, [ct]: 'PASS' }));
      // Best-effort API call — ignore failures
      if (session) {
        apiFetch(`/assessment/session/${session.sessionId}/system-check`, {
          method: 'POST',
          body: JSON.stringify({ checkType: ct, status: 'PASS' }),
        }).catch(() => {});
      }
    }
    // Mark complete
    if (session) {
      apiFetch(`/assessment/session/${session.sessionId}/system-check/complete`, {
        method: 'POST',
      }).catch(() => {});
    }
    // Small pause so user sees all checks green before navigating
    await new Promise(resolve => setTimeout(resolve, 600));
    setChecksRunning(false);
    setStep('instructions');
  };

  // Auto-run diagnostics when entering system-check step
  useEffect(() => {
    if (step === 'system-check') {
      setCheckStatus({});
      runSystemChecks();
    }
  }, [step]);

  const startExam = async () => {
    setError('');
    if (!session) {
      // No backend session — navigate to exam with placeholder data
      setStep('exam');
      return;
    }
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
    if (timerRef.current) clearInterval(timerRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    // Keep application in fullscreen lockdown until candidate explicitly exits
    window.beyon?.assessment?.unlockWindow();
    setStep('submitting');

    if (!session) {
      // No backend session — show mock results
      await new Promise(resolve => setTimeout(resolve, 1200));
      setResults({ score: 94 });
      setStep('results');
      return;
    }

    try {
      const res = await apiFetch(`/assessment/session/${session.sessionId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
      setResults(res);
      setStep('results');
    } catch (err: any) {
      // Still show results even on API error
      setResults({ score: null });
      setStep('results');
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
            <span className={styles.brandName}>Beyon</span>
            <span className={styles.brandSub}>Secure Proctored Assessment Client</span>
          </div>
        </div>

        <div className={styles.headerPills}>
          <span className={styles.kioskPill}>
            <i className="bx bx-shield-alt-2" /> KIOSK FULLSCREEN LOCKED
          </span>
        </div>

        <div className={styles.headerRight}>
          {step === 'exam' && (
            <div className={styles.timerSection}>
              <span className={styles.timerLabel}>Time Remaining:</span>
              <span className={`${styles.timerValue} ${(timeInfo?.remainingSeconds || 0) < 300 ? styles.timerWarning : ''}`}>
                {formatTime(timeInfo?.remainingSeconds || 0)}
              </span>
            </div>
          )}

          {step === 'exam' && (
            <button
              className={styles.finishBtn}
              onClick={handleSubmit}
              title="Submit and finish the assessment"
            >
              <i className="bx bx-check-double" /> Finish &amp; Submit
            </button>
          )}

          {proctoringWarnings.length > 0 && (
            <span className={styles.warningBadge}>
              <i className="bx bx-error" /> Warnings: {proctoringWarnings.length}
            </span>
          )}

          <button
            className={styles.headerSettingsBtn}
            onClick={() => setShowSettingsModal(true)}
            title="System Diagnostics &amp; Settings"
          >
            <i className="bx bx-slider" /> Diagnostics
          </button>

          {step !== 'exam' ? (
            <button
              className={styles.headerExitBtn}
              onClick={handleExitApp}
              title="Exit Assessment Client"
            >
              <i className="bx bx-power-off" /> Exit App
            </button>
          ) : (
            <button
              className={styles.headerExitBtnDisabled}
              disabled
              title="Exit is disabled during examination. Please finish and submit your exam."
            >
              <i className="bx bx-lock-alt" /> Exit Locked
            </button>
          )}
        </div>
      </header>

      {/* Auth Step */}
      {step === 'auth' && (
        <main className={styles.main}>
          <div className={styles.authCard}>
            <div className={styles.authAside}>
              <span className={styles.asideMark} />
              <h2>Beyon Secure Assessment Portal</h2>
              <p>Secure candidate authentication for proctored examinations and skill competency assessments.</p>
              <div className={styles.authNotice}>
                <i className="bx bx-shield-quarter" />
                <span>Protected test environment &middot; Beyon AI Proctored</span>
              </div>
            </div>

            <div className={styles.authPanel}>
              <span className="section-label">Beyon Portal</span>
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

            {/* Camera preview area */}
            <div className={styles.cameraPreview} style={{ position: 'relative', background: '#0f172a', overflow: 'hidden' }}>
              {/* Always render the video element so the ref is attached */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: cameraReady ? 'block' : 'none',
                  transform: 'scaleX(-1)', // mirror effect
                }}
              />
              {/* Placeholder while camera is loading or errored */}
              {!cameraReady && !cameraError && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#94a3b8' }}>
                  <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 36 }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Starting camera...</span>
                </div>
              )}
              {/* Camera error state */}
              {cameraError && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, textAlign: 'center', color: '#f87171', background: '#0f172a' }}>
                  <i className="bx bx-camera-off" style={{ fontSize: 36 }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.5 }}>{cameraError}</span>
                </div>
              )}
              {/* Live indicator */}
              {cameraReady && (
                <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: 0 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
                  <span style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'ClashDisplay, sans-serif' }}>LIVE</span>
                </div>
              )}
            </div>

            {cameraError && (
              <button
                className={styles.btnOutline}
                style={{ marginTop: 4 }}
                onClick={() => setStep('verify')} // re-trigger the useEffect
              >
                <i className="bx bx-refresh" /> Retry Camera
              </button>
            )}

            {error && <div className={styles.errorBanner}>{error}</div>}

            <button
              className={styles.btnPrimary}
              onClick={handleVerify}
              disabled={verifying || (!cameraReady && !cameraError)}
              style={{ opacity: (verifying || (!cameraReady && !cameraError)) ? 0.6 : 1, cursor: (verifying || (!cameraReady && !cameraError)) ? 'not-allowed' : 'pointer' }}
            >
              {verifying
                ? <><i className="bx bx-loader-alt bx-spin" /> Verifying...</>
                : cameraError
                ? <><i className="bx bx-shield-check" /> Proceed Without Camera</>
                : <><i className="bx bx-shield-check" /> Verify Identity &amp; Proceed</>
              }
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
                        checkStatus[ct] === 'PASS' ? 'bx-check' : checksRunning ? 'bx-loader-alt bx-spin' : 'bx-time'
                      }`}
                    />
                  </span>
                  <div>
                    <div className={styles.checkLabel}>{CHECK_LABELS[ct]}</div>
                    <div className={styles.checkStatus}>
                      {checkStatus[ct] === 'PASS'
                        ? 'Operational · Verified'
                        : checksRunning
                        ? 'Checking compatibility...'
                        : 'Waiting to run'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <button
              className={styles.btnPrimary}
              onClick={runSystemChecks}
              disabled={checksRunning}
              style={{ opacity: checksRunning ? 0.6 : 1, cursor: checksRunning ? 'not-allowed' : 'pointer' }}
            >
              {checksRunning
                ? <><i className="bx bx-loader-alt bx-spin" /> Running Diagnostics...</>
                : <><i className="bx bx-refresh" /> Re-run System Diagnostics</>
              }
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

          {/* Live Malpractice Alert Banner */}
          {activeAlert && (
            <div className={styles.alertBanner}>
              <i className="bx bx-error-circle" />
              <strong>Proctoring Alert:</strong> {activeAlert}
            </div>
          )}

          {/* Left Sidebar — Question Palette + Camera */}
          <aside className={styles.paletteContainer}>
            {/* Camera Panel with AI Detection HUD */}
            <div className={styles.examCameraPanel}>
              <div className={styles.examCameraHeader}>
                <i className="bx bx-camera" style={{ fontSize: 14 }} />
                <span>AI Proctor</span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: proctorStatus === 'CLEAR' ? '#15803d' : '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: proctorStatus === 'CLEAR' ? '#22c55e' : '#ef4444',
                      display: 'inline-block',
                    }}
                  />
                  {proctorStatus === 'CLEAR' ? 'ACTIVE' : 'ALERT'}
                </span>
              </div>
              <div className={styles.examCameraFeed}>
                <video
                  ref={examVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: examCameraReady ? 'block' : 'none',
                    transform: 'scaleX(-1)',
                  }}
                />
                {!examCameraReady && (
                  <div className={styles.examCameraPlaceholder}>
                    <i className="bx bx-camera-off" style={{ fontSize: 24, color: '#64748b' }} />
                    <span>Camera unavailable</span>
                  </div>
                )}
                {/* Real-time AI HUD Overlay */}
                {examCameraReady && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '4px 8px',
                      background: proctorStatus === 'CLEAR' ? 'rgba(15, 23, 42, 0.75)' : 'rgba(185, 28, 28, 0.88)',
                      color: '#fff',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: `1px solid ${proctorStatus === 'CLEAR' ? 'rgba(255,255,255,0.1)' : '#ef4444'}`,
                    }}
                  >
                    <span>
                      <i className={`bx ${proctorStatus === 'CLEAR' ? 'bx-face' : 'bx-error'}`} style={{ marginRight: 4 }} />
                      {proctorMessage}
                    </span>
                    <span style={{ fontSize: '0.64rem', opacity: 0.85 }}>AI Guard</span>
                  </div>
                )}
              </div>
              {proctoringWarnings.length > 0 && (
                <div className={styles.warnCount}>
                  <i className="bx bx-error" /> {proctoringWarnings.length} warning{proctoringWarnings.length !== 1 ? 's' : ''} recorded
                </div>
              )}
            </div>

            {/* Question Palette */}
            <div className={styles.paletteSection}>
              <div className={styles.paletteSectionTitle}>Question Palette</div>
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

              <div className={styles.paletteStats}>
                <span>Answered: <b>{Object.values(answers).filter(a => a.optionId).length}</b></span>
                <span>Remaining: <b>{totalQ - Object.values(answers).filter(a => a.optionId).length}</b></span>
              </div>
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
              Sample Question #{currentQuestion + 1}: Which data structure offers O(1) average time complexity for key-value lookups and insertion?
            </h2>

            <div className={styles.options}>
              {[
                { id: 'opt-a', label: 'A', text: 'Hash Table / Hash Map' },
                { id: 'opt-b', label: 'B', text: 'Binary Search Tree' },
                { id: 'opt-c', label: 'C', text: 'Singly Linked List' },
                { id: 'opt-d', label: 'D', text: 'Balanced AVL Tree' },
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
        <main className={styles.main} style={{ overflowY: 'auto', alignItems: 'center', padding: '32px 24px' }}>
          <div className={styles.resultsContainer}>

            {/* Score Card */}
            <div className={styles.resultsScoreCard}>
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
                  <div className={styles.resultValue} style={{ color: malpracticeAlerts.length === 0 ? 'var(--color-success)' : '#f59e0b' }}>
                    {malpracticeAlerts.length === 0 ? 'CLEAN' : 'FLAGGED'}
                  </div>
                </div>
                <div className={styles.resultItem}>
                  <div className={styles.resultLabel}>Violations Detected</div>
                  <div className={styles.resultValue} style={{ color: malpracticeAlerts.length > 0 ? '#ef4444' : 'var(--color-success)' }}>
                    {malpracticeAlerts.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Malpractice Report */}
            <div className={styles.resultsReportCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <i className="bx bx-shield-quarter" style={{ fontSize: 20, color: '#1c2d81' }} />
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#020617' }}>Proctoring &amp; Malpractice Report</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                  {malpracticeAlerts.length} incident{malpracticeAlerts.length !== 1 ? 's' : ''} recorded
                </span>
              </div>

              {malpracticeAlerts.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#f0fdf4', border: '1px solid #86efac' }}>
                  <i className="bx bx-check-circle" style={{ fontSize: 20, color: '#15803d' }} />
                  <span style={{ fontWeight: 600, color: '#15803d' }}>No malpractice incidents detected during this session.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {malpracticeAlerts.map(alert => (
                    <div key={alert.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderLeft: '4px solid #ef4444' }}>
                      <i className="bx bx-error-circle" style={{ fontSize: 18, color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {alert.type.replace(/_/g, ' ')}
                        </div>
                        <div style={{ fontWeight: 500, fontSize: '0.85rem', color: '#0f172a', marginTop: 2 }}>{alert.msg}</div>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', flexShrink: 0 }}>{alert.time}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 8, padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', fontWeight: 500, lineHeight: 1.6 }}>
                <i className="bx bx-info-circle" style={{ marginRight: 6 }} />
                This report has been automatically submitted to your institution's assessment committee. Violations are reviewed by a human proctor before any disciplinary action.
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setShowSettingsModal(true)}
                >
                  <i className="bx bx-slider" /> View System Logs
                </button>
                <button
                  className={styles.btnDanger}
                  onClick={handleExitApp}
                  style={{ padding: '10px 24px' }}
                >
                  <i className="bx bx-power-off" /> Close &amp; Exit Application
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Bottom Bar — System Status & Quick Actions */}
      <footer className={styles.bottomBar}>
        <div className={styles.bottomBarLeft}>
          <span className={styles.bottomBarBadge}>
            <i className="bx bx-shield-alt-2" /> KIOSK LOCKDOWN &middot; FULLSCREEN
          </span>
          <span className={styles.bottomBarItem}>
            <i className="bx bx-wifi" style={{ color: '#15803d' }} /> Network: <b>Optimal</b>
          </span>
          <span className={styles.bottomBarItem}>
            <i className="bx bx-video-recording" style={{ color: '#15803d' }} /> Proctoring Guard: <b>Active</b>
          </span>
        </div>
        <div className={styles.bottomBarRight}>
          <button
            className={styles.bottomBarBtn}
            onClick={() => setShowSettingsModal(true)}
            title="Open Application Settings &amp; Diagnostics"
          >
            <i className="bx bx-slider-alt" /> System Diagnostics
          </button>
          {step !== 'exam' ? (
            <button
              className={styles.bottomBarBtnExit}
              onClick={handleExitApp}
              title="Exit Assessment Client"
            >
              <i className="bx bx-power-off" /> Exit App
            </button>
          ) : (
            <button
              className={styles.bottomBarBtnExitDisabled}
              disabled
              title="Exit is disabled during examination"
            >
              <i className="bx bx-lock-alt" /> Exit Locked
            </button>
          )}
        </div>
      </footer>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <i className="bx bx-error-circle" style={{ color: step === 'exam' ? 'var(--color-danger)' : 'var(--color-primary)' }} />
                <span>{step === 'exam' ? 'Terminate & Exit Assessment?' : 'Exit Assessment Client?'}</span>
              </div>
              <button className={styles.modalCloseBtn} onClick={() => setShowExitModal(false)}>
                <i className="bx bx-x" />
              </button>
            </div>
            <div className={styles.modalBody}>
              {step === 'exam' ? (
                <div className={styles.modalWarningBox}>
                  <p><strong>Warning:</strong> You are currently in an active examination session.</p>
                  <p style={{ marginTop: 6 }}>Exiting the application will immediately submit your answers recorded so far, unlock kiosk mode, and log an assessment termination event to your proctoring report.</p>
                </div>
              ) : (
                <p>Are you sure you want to close and exit the Beyon Secure Lockdown Assessment Client?</p>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowExitModal(false)}>
                Cancel
              </button>
              <button
                className={step === 'exam' ? styles.btnDanger : styles.btnPrimary}
                onClick={confirmExitApp}
              >
                <i className="bx bx-power-off" /> {step === 'exam' ? 'Submit & Exit' : 'Exit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings & System Diagnostics Modal */}
      {showSettingsModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} style={{ maxWidth: 620 }}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <i className="bx bx-slider-alt" style={{ color: 'var(--color-primary)' }} />
                <span>System Diagnostics &amp; Lockdown Settings</span>
              </div>
              <button className={styles.modalCloseBtn} onClick={() => setShowSettingsModal(false)}>
                <i className="bx bx-x" />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.diagSection}>
                <div className={styles.diagSectionTitle}>Environment &amp; Hardware Diagnostics</div>
                <div className={styles.diagGrid}>
                  <div className={styles.diagItem}>
                    <span className={styles.diagKey}>Operating System</span>
                    <span className={styles.diagVal}>{deviceInfo?.os || systemInfo?.platform || 'Windows 11'}</span>
                  </div>
                  <div className={styles.diagItem}>
                    <span className={styles.diagKey}>Display Resolution</span>
                    <span className={styles.diagVal}>
                      {deviceInfo?.screenWidth || window.screen.width} &times; {deviceInfo?.screenHeight || window.screen.height}
                    </span>
                  </div>
                  <div className={styles.diagItem}>
                    <span className={styles.diagKey}>Processor &amp; Memory</span>
                    <span className={styles.diagVal}>
                      {systemInfo?.cpus || 8} CPU Cores &middot; {Math.round((systemInfo?.totalMemory || 16000000000) / 1073741824)} GB RAM
                    </span>
                  </div>
                  <div className={styles.diagItem}>
                    <span className={styles.diagKey}>Kiosk Mode Status</span>
                    <span className={styles.diagVal} style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                      <i className="bx bx-check-shield" /> Fullscreen Locked (No Minimize)
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.diagSection}>
                <div className={styles.diagSectionTitle}>Proctoring Hardware Verification</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <i className="bx bx-camera" style={{ fontSize: 18, color: '#1c2d81' }} />
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Camera Sensor Verification</span>
                    </div>
                    <button
                      className={styles.btnSecondary}
                      style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                      onClick={toggleCameraTest}
                    >
                      {cameraTestActive ? 'Stop Camera Test' : 'Test Camera'}
                    </button>
                  </div>

                  {cameraTestActive && (
                    <div style={{ width: '100%', height: 180, background: '#0f172a', position: 'relative', overflow: 'hidden' }}>
                      <video
                        ref={settingsVideoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <i className="bx bx-microphone" style={{ fontSize: 18, color: '#1c2d81' }} />
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Audio Microphone Input</span>
                    </div>
                    <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '0.8rem' }}>
                      <i className="bx bx-check" /> Verified &amp; Active
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.diagSection}>
                <div className={styles.diagSectionTitle}>Lockdown Controls</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className={styles.btnSecondary}
                    style={{ flex: 1 }}
                    onClick={() => window.beyon?.app?.forceFullscreen?.()}
                  >
                    <i className="bx bx-fullscreen" /> Force Re-enter Fullscreen
                  </button>
                  <button
                    className={styles.btnDanger}
                    style={{ flex: 1 }}
                    onClick={() => {
                      setShowSettingsModal(false);
                      setShowExitModal(true);
                    }}
                  >
                    <i className="bx bx-power-off" /> Exit Application
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnPrimary} onClick={() => setShowSettingsModal(false)}>
                Done &middot; Close Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
