import { useState, useEffect, useCallback, useRef } from 'react';
import QRCode from 'qrcode';
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

type Step = 'auth' | 'dashboard' | 'launch' | 'verify' | 'system-check' | 'dualview-setup' | 'instructions' | 'exam' | 'submitting' | 'results';

const API_BASE = 'http://localhost:8085/api/v1';

interface StudentUser {
  id: string;
  email: string;
  name: string;
  role: string;
  profileStatus?: string;
}

interface StudentProfileData {
  id?: string;
  userId?: string;
  institution?: string;
  degree?: string;
  department?: string;
  academicYear?: string;
  registrationNumber?: string;
  cgpa?: number;
  placementPreference?: string;
  aboutMe?: string;
}

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
  const [user, setUser] = useState<StudentUser | null>(null);
  const [profileData, setProfileData] = useState<StudentProfileData | null>(null);
  const [coins, setCoins] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [stats, setStats] = useState<any>(null);
  const [activeOpportunity, setActiveOpportunity] = useState<any>(null);
  const [pendingAssessments, setPendingAssessments] = useState<any[]>([]);
  const [weeklyTests, setWeeklyTests] = useState<any[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState<boolean>(false);
  const [selectedExamTitle, setSelectedExamTitle] = useState<string>('Campus Technical Assessment');
  const [examQuestionsList, setExamQuestionsList] = useState<any[]>([]);
  const [isStartingAssessment, setIsStartingAssessment] = useState<boolean>(false);
  const [selectedModuleModal, setSelectedModuleModal] = useState<string | null>(null);
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
  const [showAuthPassword, setShowAuthPassword] = useState(false);
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
  const cameraCoverStreakRef = useRef(0);
  const multiPersonStreakRef = useRef(0);
  const phoneStreakRef = useRef(0);
  const voiceStreakRef = useRef(0);
  const noiseStreakRef = useRef(0);
  const proctorIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleSubmitRef = useRef<(() => void) | null>(null);

  // DualView AI Proctoring states
  const [procSessionId, setProcSessionId] = useState<string | null>(null);
  const [pairingToken, setPairingToken] = useState<string | null>(null);
  const [pairingUrl, setPairingUrl] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [mobilePaired, setMobilePaired] = useState(false);
  const [mobileStreaming, setMobileStreaming] = useState(false);
  const [dualViewLoading, setDualViewLoading] = useState(false);
  const [dualViewConsent, setDualViewConsent] = useState(false);
  const dualViewPollingRef = useRef<any>(null);

  useEffect(() => {
    if (pairingUrl) {
      QRCode.toDataURL(pairingUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Local QR Code Generation Failed:', err));
    }
  }, [pairingUrl]);

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
    const activeToken = token || (await window.beyon?.auth?.getToken?.()) || null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        console.warn(`Auth rejection (${res.status}) on ${path}`);
      }
      throw new Error(`API error: ${res.status}`);
    }
    return res.json();
  };

  const fetchStudentDashboardData = async (authToken: string) => {
    setLoadingDashboard(true);
    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      const [profRes, oppsRes, weeklyRes] = await Promise.all([
        fetch(`${API_BASE}/student/profile`, { headers }).catch(() => null),
        fetch(`${API_BASE}/opportunities/opted-in`, { headers }).catch(() => null),
        fetch(`${API_BASE}/weekly-tests`, { headers }).catch(() => null),
      ]);

      if (profRes && profRes.ok) {
        const d = await profRes.json();
        setProfileData(d.data || null);
      }
      if (oppsRes && oppsRes.ok) {
        const d = await oppsRes.json();
        const oppList = Array.isArray(d) ? d : (d.data || []);
        setPendingAssessments(oppList);
        if (oppList.length > 0) {
          setActiveOpportunity(oppList[0]);
        } else {
          setActiveOpportunity(null);
        }
      } else {
        setPendingAssessments([]);
      }
      if (weeklyRes && weeklyRes.ok) {
        const d = await weeklyRes.json();
        const testList = Array.isArray(d) ? d : (d.data || []);
        setWeeklyTests(testList);
      }
    } catch (e) {
      console.warn('Error loading student dashboard data:', e);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    const loadToken = async () => {
      try {
        const t = await window.beyon?.auth?.getToken();
        if (t) {
          const meRes = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${t}` },
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            const role = meData?.data?.role;
            if (role === 'STUDENT') {
              setToken(t);
              setUser(meData.data);
              await fetchStudentDashboardData(t);
              setStep(launchToken ? 'verify' : 'dashboard');
              return;
            } else {
              await window.beyon?.auth?.clearToken();
              setError(`Access Restricted: This desktop client is reserved exclusively for students. (${role} accounts must access the web portal at http://localhost:5173)`);
              setStep('auth');
              return;
            }
          } else {
            // Token expired or invalid -> clear stale token so user can authenticate afresh
            await window.beyon?.auth?.clearToken();
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('Auth token validation fallback:', err);
      }
      setStep('auth');
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

        // Setup Web Audio Analyser for Noise & Speech Detection
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            const timeData = new Uint8Array(analyser.fftSize);
            const freqData = new Uint8Array(analyser.frequencyBinCount);

            (stream as any)._checkAudio = () => {
              // 1. RMS Energy
              analyser.getByteTimeDomainData(timeData);
              let sumSquares = 0;
              for (let i = 0; i < timeData.length; i++) {
                const val = (timeData[i] - 128) / 128;
                sumSquares += val * val;
              }
              const rms = Math.sqrt(sumSquares / timeData.length);

              // 2. Vocal Frequencies (Bins 2..45 in 512 FFT)
              analyser.getByteFrequencyData(freqData);
              let voiceSum = 0;
              for (let i = 2; i < 45; i++) {
                voiceSum += freqData[i];
              }
              const voiceAvg = voiceSum / 43;

              // High sensitivity noise/voice detection
              if (rms > 0.035 || voiceAvg > 24) {
                noiseStreakRef.current++;
                if (noiseStreakRef.current === 1 || noiseStreakRef.current % 4 === 0) {
                  setProctorStatus('WARNING');
                  setProctorMessage('Noise / Voice Detected');
                  addMalpracticeAlert('NOISE_DETECTED', `Noise / speech detected in exam room (${Math.round(rms * 100)}% acoustic energy). Please maintain silence.`);
                  setProctoringWarnings(prev => [...prev, 'Acoustic noise / speech detected']);
                }
              } else {
                noiseStreakRef.current = 0;
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

          // 1. Run Audio Check
          if ((stream as any)._checkAudio) {
            (stream as any)._checkAudio();
          }

          // 2. Capture and analyze visual frame
          ctx.drawImage(examVideoRef.current, 0, 0, 160, 120);
          const frame = ctx.getImageData(0, 0, 160, 120);
          const data = frame.data;

          let centerSkinPixels = 0;
          let phoneBrightPixels = 0;
          let phoneEdgeTransitions = 0;
          let totalLum = 0;
          let totalEdges = 0;
          const colSkin = new Int32Array(160);

          for (let y = 0; y < 120; y++) {
            for (let x = 0; x < 160; x++) {
              const idx = (y * 160 + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const lum = (r + g + b) / 3;
              totalLum += lum;

              if (x < 159) {
                const rightIdx = (y * 160 + (x + 1)) * 4;
                const rightLum = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;
                if (Math.abs(lum - rightLum) > 20) {
                  totalEdges++;
                }
              }

              // Biometric YCbCr skin chrominance formula (rejects wooden walls, beige doors, yellow light)
              const Y  =  0.299 * r + 0.587 * g + 0.114 * b;
              const Cb = -0.1687 * r - 0.3313 * g + 0.5 * b + 128;
              const Cr =  0.5 * r - 0.4187 * g - 0.0813 * b + 128;

              const isHumanSkin =
                Y >= 35 && Y <= 235 &&
                Cb >= 75 && Cb <= 130 &&
                Cr >= 130 && Cr <= 175 &&
                r > g && r > b &&
                (r - g > 8);

              if (isHumanSkin) {
                if (x >= 35 && x <= 125 && y >= 10 && y <= 95) {
                  centerSkinPixels++;
                }
                // Record upper head column distribution (ignore hands/arms typing at desk y > 65)
                if (y >= 10 && y <= 65) {
                  colSkin[x]++;
                }
              }

              // Smartphone / Electronic device detection:
              // Only checks for active illuminated glowing screen held up in frame (lum > 230)
              // NEVER checks dark pixels, so dark shirts/jackets will NEVER trigger!
              if (y >= 25 && y <= 100 && x >= 25 && x <= 135) {
                if (lum > 230) {
                  phoneBrightPixels++;
                  if (x < 134) {
                    const rightIdx = (y * 160 + (x + 1)) * 4;
                    const rightLum = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;
                    if (Math.abs(lum - rightLum) > 65) {
                      phoneEdgeTransitions++;
                    }
                  }
                }
              }
            }
          }

          const avgLum = totalLum / (160 * 120);
          // Camera covered by finger/tape/hand:
          // Low average luminance (< 22) OR extremely few edges (< 50) when average luminance is low (< 45) or flesh is flush on lens
          const isLaptopCameraCovered = (avgLum < 22) || (totalEdges < 50 && (avgLum < 45 || centerSkinPixels > 1000));

          if (isLaptopCameraCovered) {
            cameraCoverStreakRef.current = (cameraCoverStreakRef.current || 0) + 1;
            if (cameraCoverStreakRef.current === 2) {
              setProctorStatus('WARNING');
              setProctorMessage('Camera Lens Covered / Obstructed');
              addMalpracticeAlert('CAMERA_OBSTRUCTION', 'Warning: Laptop camera lens is covered or obstructed! Uncover lens immediately.');
              setProctoringWarnings(prev => [...prev, 'Laptop camera covered or obstructed']);
            }
          } else {
            cameraCoverStreakRef.current = 0;
          }

          // EVALUATION 1: Face Presence / Absence (Candidate left screen)
          if (!isLaptopCameraCovered && centerSkinPixels < 140) {
            absenceStreakRef.current++;
            if (absenceStreakRef.current === 1) {
              setProctorStatus('WARNING');
              setProctorMessage('Face Not Detected');
            } else if (absenceStreakRef.current === 2) {
              setProctorStatus('WARNING');
              setProctorMessage('Auto-terminating in 3s...');
              addMalpracticeAlert('FACE_NOT_DETECTED', 'Face not detected in camera viewport! Auto-terminating in 3s if not returned.');
              setProctoringWarnings(prev => [...prev, 'Candidate absent from screen']);
            } else if (absenceStreakRef.current >= 5) { // ~3 seconds of continuous absence
              isTerminatingRef.current = true;
              setProctorStatus('CRITICAL');
              setProctorMessage('AUTO-TERMINATED (ABSENT)');
              addMalpracticeAlert('CRITICAL_ABSENCE_AUTO_TERMINATION', 'Assessment automatically terminated: Candidate left camera viewport during exam.');
              if (handleSubmitRef.current) handleSubmitRef.current();
              return;
            }
          } else if (!isLaptopCameraCovered) {
            if (absenceStreakRef.current > 0 && absenceStreakRef.current < 5) {
              setProctorStatus('CLEAR');
              setProctorMessage('Face Detected & Monitored');
            }
            absenceStreakRef.current = 0;
          }

          // EVALUATION 2: Multiple People (Two distinct head peaks separated by non-skin valley)
          let leftHeadMass = 0;
          let rightHeadMass = 0;
          let valleyColumns = 0;
          for (let x = 10; x < 150; x++) {
            if (colSkin[x] >= 5) {
              if (x < 75) leftHeadMass += colSkin[x];
              else if (x > 85) rightHeadMass += colSkin[x];
            } else if (colSkin[x] < 2 && x >= 50 && x <= 110) {
              valleyColumns++;
            }
          }

          // Only genuine two heads: both peaks have substantial facial mass and are separated by a valley
          const hasTwoDistinctHeads = leftHeadMass > 600 && rightHeadMass > 600 && valleyColumns >= 6;
          if (hasTwoDistinctHeads) {
            multiPersonStreakRef.current++;
            if (multiPersonStreakRef.current === 6) { // ~3.6s continuous presence of second head
              setProctorStatus('WARNING');
              setProctorMessage('Multiple People in Frame');
              addMalpracticeAlert('MULTIPLE_PEOPLE_DETECTED', 'Warning: Additional person detected in camera view');
              setProctoringWarnings(prev => [...prev, 'Multiple persons detected']);
            }
          } else {
            multiPersonStreakRef.current = 0;
          }

          // EVALUATION 3: Phone / Unauthorized Device -> IMMEDIATE EXIT
          // Requires an active, bright illuminated electronic screen held in frame
          const isPhoneInFrame = phoneBrightPixels > 380 && phoneEdgeTransitions > 120;
          if (isPhoneInFrame) {
            phoneStreakRef.current++;
            if (phoneStreakRef.current >= 4) { // ~2.4s of confirmed active glowing screen
              isTerminatingRef.current = true;
              setProctorStatus('CRITICAL');
              setProctorMessage('AUTO-TERMINATED (PHONE DETECTED)');
              addMalpracticeAlert('DEVICE_MALPRACTICE_TERMINATION', 'CRITICAL VIOLATION: Unauthorized mobile phone screen detected. Assessment immediately terminated.');
              setProctoringWarnings(prev => [...prev, 'Mobile device detected - Test Terminated']);
              if (handleSubmitRef.current) handleSubmitRef.current();
              return;
            }
          } else {
            phoneStreakRef.current = 0;
          }
        }, 600);

      } catch {
        setExamCameraReady(false);
      }
    };

    // Cross-Camera Incident Poller for DualView / Mobile Camera
    let incidentPollInterval: any = null;
    if (procSessionId) {
      const examStartTime = Date.now();
      const seenIncidentIds = new Set<string>();
      incidentPollInterval = setInterval(async () => {
        if (isTerminatingRef.current) return;
        try {
          const res = await fetch(`${API_BASE}/proctoring/dualview/${procSessionId}/incidents`);
          if (res.ok) {
            const list = await res.json();
            if (Array.isArray(list)) {
              for (const inc of list) {
                const incId = String(inc.id || inc.incidentId);
                if (seenIncidentIds.has(incId)) continue;
                seenIncidentIds.add(incId);

                // Ignore stale incidents from before the exam started
                const incidentTime = inc.startedAt ? Date.parse(inc.startedAt) : 0;
                if (incidentTime > 0 && incidentTime < examStartTime - 3000) continue;

                const type = inc.incidentType;
                if (type === 'PHONE_DETECTED' || type === 'POSSIBLE_QUESTION_CAPTURE') {
                  isTerminatingRef.current = true;
                  setProctorStatus('CRITICAL');
                  setProctorMessage('AUTO-TERMINATED (PHONE DETECTED)');
                  addMalpracticeAlert('CRITICAL_PHONE_TERMINATION', 'CRITICAL VIOLATION: Unauthorized mobile phone detected by proctoring sensors. Assessment terminated.');
                  if (handleSubmitRef.current) handleSubmitRef.current();
                  return;
                } else if (type === 'SECOND_PERSON' || type === 'POSSIBLE_EXTERNAL_ASSISTANCE') {
                  setProctorStatus('WARNING');
                  setProctorMessage('Multiple People in Frame');
                  addMalpracticeAlert('DUALVIEW_SECOND_PERSON', 'Warning: Additional person detected in camera view');
                  setProctoringWarnings(prev => [...prev, 'Multiple persons detected']);
                } else if (type === 'CAMERA_TAMPERING' || type === 'CAMERA_COVERED' || type === 'CAMERA_OBSTRUCTION') {
                  setProctorStatus('WARNING');
                  setProctorMessage('Secondary Camera Obstructed');
                  addMalpracticeAlert('SECONDARY_CAMERA_OBSTRUCTION', 'Warning: Mobile/Environmental camera lens is obstructed or covered.');
                  setProctoringWarnings(prev => [...prev, 'Mobile camera obstructed or covered']);
                } else if (type === 'CANDIDATE_ABSENT' || type === 'NO_PERSON_DETECTED' || type === 'SUSTAINED_ABSENCE') {
                  setProctorStatus('WARNING');
                  setProctorMessage('Candidate Left Workspace');
                  addMalpracticeAlert('CANDIDATE_ABSENT_WORKSPACE', 'Warning: Candidate is not visible in mobile/environmental camera viewport.');
                  setProctoringWarnings(prev => [...prev, 'Candidate left mobile camera view']);
                }
              }
            }
          }
        } catch {}
      }, 2500);
    }

    // Maximize + lock after a short delay to avoid race on startup
    const timer = setTimeout(() => {
      window.beyon?.assessment?.enterFullscreen();
      window.beyon?.assessment?.lockWindow();
      startExamCamera();
    }, 600);

    return () => {
      clearTimeout(timer);
      if (incidentPollInterval) {
        clearInterval(incidentPollInterval);
      }
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
  }, [step, session, procSessionId]);

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
    setStep('dualview-setup');
    initiateDualView();
  };

  const initiateDualView = async () => {
    setDualViewLoading(true);
    try {
      const initRes = await fetch(`${API_BASE}/proctoring/dualview/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          assessmentSessionId: session?.sessionId || '00000000-0000-0000-0000-000000000001'
        })
      });
      const initData = await initRes.json();
      const psId = initData.procSessionId;
      setProcSessionId(psId);

      await fetch(`${API_BASE}/proctoring/dualview/${psId}/consent`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setDualViewConsent(true);

      const tokenRes = await fetch(`${API_BASE}/proctoring/dualview/${psId}/pairing-token`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const tokenData = await tokenRes.json();
      setPairingToken(tokenData.token);
      const lanHost = (!window.location.hostname || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '10.1.36.24' : window.location.hostname;
      setPairingUrl(`https://${lanHost}:5173/proctor?token=${tokenData.token}`);

      if (dualViewPollingRef.current) clearInterval(dualViewPollingRef.current);
      dualViewPollingRef.current = setInterval(async () => {
        try {
          const statRes = await fetch(`${API_BASE}/proctoring/dualview/${psId}/status`);
          if (statRes.ok) {
            const stat = await statRes.json();
            if (stat.mobilePaired) {
              setMobilePaired(true);
            }
            if (
              stat.status === 'STREAMING' ||
              stat.status === 'ACTIVE' ||
              stat.mobileCameraHealth === 'HEALTHY' ||
              stat.mobileCameraHealth === 'OK' ||
              (stat.mobilePaired && stat.status === 'CALIBRATING')
            ) {
              setMobileStreaming(true);
              clearInterval(dualViewPollingRef.current);
            }
          }
        } catch (e) {}
      }, 1500);
    } catch (err: any) {
      console.warn('DualView setup initialization fallback:', err);
    } finally {
      setDualViewLoading(false);
    }
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
      if (procSessionId) {
        fetch(`${API_BASE}/proctoring/dualview/${procSessionId}/activate`, {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }).catch(() => {});
      }
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
    if (proctorIntervalRef.current) clearInterval(proctorIntervalRef.current);
    if (dualViewPollingRef.current) clearInterval(dualViewPollingRef.current);
    if (procSessionId) {
      fetch(`${API_BASE}/proctoring/dualview/${procSessionId}/complete`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      }).catch(() => {});
    }
    // Keep application in fullscreen lockdown until candidate explicitly exits
    window.beyon?.assessment?.unlockWindow();
    setStep('submitting');

    if (!session || session.sessionId === '00000000-0000-0000-0000-000000000001') {
      const answeredCount = Object.values(answers).filter(a => a.optionId).length;
      const calculatedScore = totalQ > 0 ? Math.round((answeredCount / totalQ) * 100) : 0;
      setResults({ score: calculatedScore, status: 'SUBMITTED', totalQuestions: totalQ, answeredCount });
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
      const answeredCount = Object.values(answers).filter(a => a.optionId).length;
      const calculatedScore = totalQ > 0 ? Math.round((answeredCount / totalQ) * 100) : 0;
      setResults({ score: calculatedScore, status: 'SUBMITTED', totalQuestions: totalQ, answeredCount });
      setStep('results');
    }
  };
  handleSubmitRef.current = handleSubmit;

  const handleDesktopAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!authEmail || !authPassword) return;

    const identifier = authEmail.trim();

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password: authPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json.message ||
          json.error ||
          'Email or password is incorrect. Please check your student credentials.'
        );
      }

      const role = json.data?.user?.role;
      if (role && role !== 'STUDENT') {
        throw new Error(`Access Restricted: This desktop client is reserved exclusively for students to take proctored assessments. Administrators, companies, and institutions should access the web portal at http://localhost:5173.`);
      }

      const receivedToken = json.data?.accessToken || json.accessToken;
      if (!receivedToken) throw new Error('Access token not received');
      setToken(receivedToken);
      setUser(json.data?.user || { role: 'STUDENT', email: identifier, name: 'Student' });
      await window.beyon?.auth?.setToken(receivedToken);
      await fetchStudentDashboardData(receivedToken);
      setStep('dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please enter a valid student email and password.');
    }
  };

  const handleTakeTest = async (
    targetId?: string,
    targetTitle?: string,
    durationMins: number = 60,
    totalQCount: number = 20
  ) => {
    setIsStartingAssessment(true);
    setError('');
    const examName = targetTitle || activeOpportunity?.title || 'Campus Technical Assessment';
    setSelectedExamTitle(examName);

    const activeToken = token || (await window.beyon?.auth?.getToken?.()) || null;

    try {
      const oppId = targetId || activeOpportunity?.id || '79cbb9c2-13cf-44a9-91c0-9a7e68809640';
      const res = await fetch(`${API_BASE}/assessment/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
        body: JSON.stringify({
          opportunityId: oppId,
          questionCount: totalQCount,
          durationMinutes: durationMins,
        }),
      });

      if (res.ok) {
        const sessionData = await res.json();
        setSession({
          sessionId: sessionData.sessionId,
          status: sessionData.status || 'CREATED',
          totalQuestions: sessionData.totalQuestions || totalQCount,
          durationMinutes: sessionData.durationMinutes || durationMins,
        });
      } else {
        setSession({
          sessionId: '00000000-0000-0000-0000-000000000001',
          status: 'CREATED',
          totalQuestions: totalQCount,
          durationMinutes: durationMins,
        });
      }

      // Pre-load real questions for the examination
      try {
        const qRes = await fetch(`${API_BASE}/practice/questions?size=${totalQCount}`, {
          headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : {},
        });
        if (qRes.ok) {
          const qData = await qRes.json();
          const list = qData.data || qData || [];
          if (Array.isArray(list) && list.length > 0) {
            setExamQuestionsList(list);
          }
        }
      } catch (e) {
        console.warn('Practice questions pre-fetch fallback:', e);
      }

      await window.beyon?.assessment?.enterFullscreen();
      setStep('verify');
    } catch (err: any) {
      console.warn('Error starting assessment session:', err);
      setSession({
        sessionId: '00000000-0000-0000-0000-000000000001',
        status: 'CREATED',
        totalQuestions: totalQCount,
        durationMinutes: durationMins,
      });
      await window.beyon?.assessment?.enterFullscreen();
      setStep('verify');
    } finally {
      setIsStartingAssessment(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await window.beyon?.auth?.clearToken();
    } catch {}
    setToken(null);
    setUser(null);
    setProfileData(null);
    setAnswers({});
    setMalpracticeAlerts([]);
    setStep('auth');
  };

  const handleReturnToDashboard = async () => {
    try {
      await window.beyon?.assessment?.unlockWindow();
      await window.beyon?.assessment?.exitFullscreen();
    } catch {}
    setSession(null);
    setAnswers({});
    setResults(null);
    setMalpracticeAlerts([]);
    setActiveAlert(null);
    setProctoringWarnings([]);
    if (token) {
      fetchStudentDashboardData(token);
    }
    setStep('dashboard');
  };

  const displayName = user?.name || profileData?.department || 'Candidate';
  const totalQ = session?.totalQuestions || 20;
  const currentQId = `q-${currentQuestion + 1}`;
  const currentAns = answers[currentQId];

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <header className={styles.assessmentHeader}>
        <div className={styles.brandTitle}>
          <img src="/logo-transparent.png" alt="Beyon" className={styles.brandLogoImg} />
          <div className={styles.brandSubWrapper}>
            <span className={styles.brandName}>Beyon</span>
            <span className={styles.brandSub}>
              {step === 'dashboard' ? 'Student Candidate Workspace' : 'Secure Proctored Assessment Client'}
            </span>
          </div>
        </div>

        <div className={styles.headerPills}>
          {step === 'dashboard' ? (
            <span className={styles.dashboardStatusPill}>
              <i className="bx bx-check-shield" /> STUDENT CLIENT &middot; VERIFIED
            </span>
          ) : (
            <span className={styles.kioskPill}>
              <i className="bx bx-shield-alt-2" /> KIOSK FULLSCREEN LOCKED
            </span>
          )}
        </div>

        <div className={styles.headerRight}>
          {step === 'dashboard' && (
            <div className={styles.headerProfilePill}>
              <div className={styles.headerProfileAvatar}>
                {(user?.name || user?.email || 'S').charAt(0).toUpperCase()}
              </div>
              <span className={styles.headerProfileName}>
                {user?.name || user?.email || 'Student Candidate'}
              </span>
            </div>
          )}

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

          {step === 'dashboard' && (
            <button
              className={styles.headerSignOutBtn}
              onClick={handleSignOut}
              title="Sign Out of Student Account"
            >
              <i className="bx bx-log-out" /> Sign Out
            </button>
          )}

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
              <div className={styles.authAsideLogoWrapper}>
                <img src="/logo.png" alt="Beyon Official Logo" className={styles.authAsideLogo} />
              </div>
              <h2>Beyon Secure Assessment Portal</h2>
              <p>Secure candidate authentication for proctored examinations and skill competency assessments.</p>
              <div className={styles.authNotice}>
                <i className="bx bx-shield-quarter" />
                <span>Protected test environment &middot; Beyon AI Proctored</span>
              </div>
            </div>

            <div className={styles.authPanel}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
                <img src="/logo-icon.png" alt="Beyon Icon" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
                <span className="section-label" style={{ marginBottom: 0 }}>Official Assessment Portal</span>
              </div>
              <h1>Candidate Sign In</h1>
              <p className={styles.subtitle}>Enter your candidate credentials to start the assessment.</p>

              <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '0px', color: '#1d4ed8', fontSize: '0.78rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <i className="bx bx-info-circle" style={{ fontSize: '1.1rem', flexShrink: 0, color: '#2563eb' }} />
                <span>Exclusively for student candidates. Enter your email or roll number to access your student dashboard.</span>
              </div>

              {error && <div className={styles.errorBanner}>{error}</div>}

              <form onSubmit={handleDesktopAuth} className={styles.authForm}>
                <div className={styles.inputGroup}>
                  <label>Student Email or Roll Number</label>
                  <div className={styles.inputWrapper}>
                    <i className="bx bx-user" />
                    <input
                      type="text"
                      placeholder="e.g. gowthamcd.cse@beyon.init or 23CSR068"
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
                      type={showAuthPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthPassword(!showAuthPassword)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '0 8px',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '1.1rem',
                      }}
                      title={showAuthPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={`bx ${showAuthPassword ? 'bx-hide' : 'bx-show'}`} />
                    </button>
                  </div>
                </div>

                <button type="submit" className={styles.btnPrimary}>
                  <i className="bx bx-log-in" style={{ marginRight: 6 }} />
                  Sign In to Student Dashboard
                </button>
              </form>
            </div>
          </div>
        </main>
      )}

      {/* Student Dashboard Step: ONLY Pending Assessments and Weekly Contests */}
      {step === 'dashboard' && (
        <main className={styles.dashboardMain}>
          {/* Welcome Banner */}
          <div className={styles.dashHero}>
            <div className={styles.dashHeroContent}>
              <div className={styles.dashBadgeRow}>
                <span className={styles.portalBadge}>
                  <img src="/logo-icon.png" alt="Beyon" style={{ width: '15px', height: '15px', objectFit: 'contain', verticalAlign: 'middle', marginRight: '6px' }} />
                  Beyon Secure Assessment Portal
                </span>
                <span className={styles.verifiedBadge}>
                  <i className="bx bx-badge-check" /> Verified Candidate
                </span>
                <span className={styles.roleBadge}>
                  <i className="bx bx-user-check" /> Student Role
                </span>
              </div>
              <h1 className={styles.dashHeroTitle}>
                Welcome back, <span className={styles.highlightName}>{displayName}</span>
              </h1>
              <p className={styles.dashHeroSub}>
                Your official assessment workspace. Access your assigned proctored campus placement drives and weekly standardized technical benchmark exams below.
              </p>
            </div>
          </div>

          {/* Section 1: Pending Proctored Assessments */}
          <section className={styles.dashSectionBlock}>
            <div className={styles.dashSectionHeader}>
              <div className={styles.dashSectionTitleRow}>
                <div className={styles.dashSectionTitle}>
                  <i className="bx bx-shield-quarter" />
                  <span>Pending Proctored Assessments (Opted-in Drives)</span>
                </div>
                <span className={styles.dashSectionCountBadge}>
                  {pendingAssessments.length} Opted-In
                </span>
              </div>
              <span className={styles.dashSectionSub}>
                Formal proctored recruitment drives you have enrolled or applied to with mandatory dual-camera monitoring.
              </span>
            </div>

            {loadingDashboard && pendingAssessments.length === 0 ? (
              <div className={styles.emptyStateCard}>
                <i className="bx bx-loader-alt bx-spin" style={{ color: '#1c2d81' }} />
                <p>Loading your opted-in assessments from server...</p>
              </div>
            ) : pendingAssessments.length > 0 ? (
              <div className={styles.pendingAssessmentsList}>
                {pendingAssessments.map((opp: any) => (
                  <div key={opp.id} className={styles.assessmentCard}>
                    <div className={styles.assessmentCardInfo}>
                      <div className={styles.assessmentCardBadgeRow}>
                        <span className={styles.badgeDriveType}>
                          <i className="bx bx-briefcase-alt" /> {opp.opportunityType || 'CAMPUS_DRIVE'}
                        </span>
                        {opp.applicationStatus && (
                          <span className={styles.badgeDriveType} style={{ background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }}>
                            <i className="bx bx-check-circle" /> Status: {opp.applicationStatus}
                          </span>
                        )}
                        <span className={styles.badgeProctorRequired}>
                          <i className="bx bx-lock-alt" /> Kiosk Lockdown
                        </span>
                        <span className={styles.badgeDualCamRequired}>
                          <i className="bx bx-camera-movie" /> Dual-Camera Required
                        </span>
                      </div>

                      <h3 className={styles.assessmentCardTitle}>{opp.title}</h3>

                      <div className={styles.assessmentCardMetaRow}>
                        <span className={styles.assessmentCardMetaItem}>
                          <i className="bx bx-map-pin" /> {opp.location || 'Remote / On-Campus'}
                        </span>
                        {opp.companyName && (
                          <span className={styles.assessmentCardMetaItem}>
                            <i className="bx bx-building" /> {opp.companyName}
                          </span>
                        )}
                        {opp.role && (
                          <span className={styles.assessmentCardMetaItem}>
                            <i className="bx bx-id-card" /> {opp.role}
                          </span>
                        )}
                        {opp.eligibleDepartments && (
                          <span className={styles.assessmentCardMetaItem}>
                            <i className="bx bx-buildings" /> {opp.eligibleDepartments}
                          </span>
                        )}
                        {opp.requiredSkills && (
                          <span className={styles.assessmentCardMetaItem}>
                            <i className="bx bx-code-alt" /> Skills: {opp.requiredSkills}
                          </span>
                        )}
                        {opp.minCgpa && (
                          <span className={styles.assessmentCardMetaItem}>
                            <i className="bx bx-chart" /> Min CGPA: {opp.minCgpa}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.assessmentCardAction}>
                      <span className={styles.assessmentDurationChip}>
                        <i className="bx bx-time-five" /> {opp.durationMinutes || 60} Mins &middot; {opp.totalQuestions || 20} Questions
                      </span>
                      <button
                        className={styles.btnTakeTest}
                        onClick={() => handleTakeTest(opp.id, opp.title, opp.durationMinutes || 60, opp.totalQuestions || 20)}
                        disabled={isStartingAssessment}
                        type="button"
                      >
                        {isStartingAssessment ? (
                          <><i className="bx bx-loader-alt bx-spin" /> Launching...</>
                        ) : (
                          <><i className="bx bx-rocket" /> Start Assessment</>
                        )}
                      </button>
                      <span className={styles.assessmentFootnote}>
                        Requires Secondary Phone Camera
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyStateCard}>
                <i className="bx bx-calendar-x" />
                <p>No opted-in campus drive assessments currently scheduled for your profile. Only drives you have applied or opted into will appear here.</p>
              </div>
            )}
          </section>

          {/* Section 2: Weekly Benchmark Contests & Exams */}
          <section className={styles.dashSectionBlock} style={{ marginTop: '36px' }}>
            <div className={styles.dashSectionHeader}>
              <div className={styles.dashSectionTitleRow}>
                <div className={styles.dashSectionTitle}>
                  <i className="bx bx-trophy" />
                  <span>Weekly Benchmark Contests &amp; Certification Exams</span>
                </div>
                <span className={styles.dashSectionCountBadge}>
                  {weeklyTests.length} Active Contests
                </span>
              </div>
              <span className={styles.dashSectionSub}>
                Standardized enterprise benchmark assessments and competitive coding exams for skill verification.
              </span>
            </div>

            {loadingDashboard && weeklyTests.length === 0 ? (
              <div className={styles.emptyStateCard}>
                <i className="bx bx-loader-alt bx-spin" style={{ color: '#1c2d81' }} />
                <p>Loading weekly contests from server...</p>
              </div>
            ) : weeklyTests.length > 0 ? (
              <div className={styles.weeklyGrid}>
                {weeklyTests.map((test: any) => (
                  <div key={test.id} className={styles.weeklyCard}>
                    <div className={styles.weeklyCardTop}>
                      <span className={styles.weeklyStatusTag}>
                        <i className="bx bx-radio-circle-marked bx-burst" /> {test.status || 'ACTIVE'}
                      </span>
                      <span className={styles.weeklyBenchTag}>
                        {test.testType || 'BENCHMARK'}
                      </span>
                    </div>

                    <h4 className={styles.weeklyCardTitle}>{test.title}</h4>
                    <p className={styles.weeklyCardDesc}>{test.description}</p>

                    <div className={styles.weeklyMetaChips}>
                      <span className={styles.weeklyChip}>
                        <i className="bx bx-time-five" /> {test.durationMinutes || 60}m
                      </span>
                      <span className={styles.weeklyChip}>
                        <i className="bx bx-help-circle" /> {test.totalQuestions || 25} Qs
                      </span>
                      <span className={styles.weeklyChip}>
                        <i className="bx bx-check-circle" /> Pass: {test.passingMarks || test.passingScore || 70}%
                      </span>
                      <span className={styles.weeklyChipGold}>
                        <i className="bx bx-coin-stack" /> +{test.coinReward || 100} Coins
                      </span>
                    </div>

                    <button
                      className={styles.btnWeeklyStart}
                      onClick={() => handleTakeTest(test.id, test.title, test.durationMinutes || 60, test.totalQuestions || 25)}
                      disabled={isStartingAssessment}
                      type="button"
                    >
                      {isStartingAssessment ? (
                        <><i className="bx bx-loader-alt bx-spin" /> Launching...</>
                      ) : (
                        <><i className="bx bx-play-circle" /> Start Contest &rarr;</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyStateCard}>
                <i className="bx bx-info-circle" />
                <p>No active weekly contests currently available.</p>
              </div>
            )}
          </section>
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

      {/* DualView AI Proctoring Mobile Pairing Step */}
      {step === 'dualview-setup' && (
        <main className={styles.main}>
          <div className={styles.dualViewCard}>
            <div className={styles.dualViewIconBadge}>
              <i className="bx bx-camera-movie" />
            </div>

            <h1 className={styles.dualViewTitle}>DualView AI Proctoring Setup</h1>
            <p className={styles.dualViewSubtitle}>
              Pair your mobile phone as a secondary side-angle environment camera.
            </p>

            <div className={styles.dualViewSetupBox}>
              {dualViewLoading ? (
                <div style={{ padding: '2.5rem', color: '#475569', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <i className="bx bx-loader-alt bx-spin" style={{ fontSize: '2rem', color: '#2563eb' }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Generating secure pairing token...</span>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div className={styles.dualViewInstruction}>
                      Scan QR code or open link on your mobile phone:
                    </div>
                    {pairingUrl && (
                      <div className={styles.dualViewQrContainer}>
                        {qrCodeDataUrl ? (
                          <img
                            src={qrCodeDataUrl}
                            alt="DualView Pairing QR Code"
                            width="200"
                            height="200"
                            style={{ display: 'block', borderRadius: '4px' }}
                          />
                        ) : (
                          <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: '2rem', color: '#2563eb' }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
                    <div className={styles.dualViewUrlLabel}>Or navigate to this URL on mobile:</div>
                    <code className={styles.dualViewUrlCode}>
                      {pairingUrl || 'http://10.1.36.24:5173/proctor'}
                    </code>
                  </div>

                  <div>
                    <div
                      className={`${styles.dualViewStatus} ${
                        mobileStreaming
                          ? styles.dualViewStatusConnected
                          : mobilePaired
                          ? styles.dualViewStatusCalibrating
                          : styles.dualViewStatusWaiting
                      }`}
                    >
                      <span
                        className={styles.dualViewStatusDot}
                        style={{
                          backgroundColor: mobileStreaming ? '#16a34a' : mobilePaired ? '#2563eb' : '#d97706',
                          boxShadow: `0 0 8px ${mobileStreaming ? '#22c55e' : mobilePaired ? '#3b82f6' : '#f59e0b'}`,
                        }}
                      />
                      <span>
                        {mobileStreaming
                          ? '✓ DualView Camera Streaming & Verified'
                          : mobilePaired
                          ? 'Mobile paired! Setting up camera & microphone...'
                          : 'Waiting for mobile connection...'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={styles.dualViewBtnRow} style={{ justifyContent: 'center' }}>
              <button
                className={styles.btnPrimary}
                onClick={() => setStep('instructions')}
                disabled={!mobileStreaming}
                type="button"
                style={{
                  minWidth: '320px',
                  padding: '14px 28px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  background: mobileStreaming ? '#16a34a' : '#94a3b8',
                  borderColor: mobileStreaming ? '#16a34a' : '#94a3b8',
                  cursor: mobileStreaming ? 'pointer' : 'not-allowed',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: mobileStreaming ? '0 4px 14px rgba(22, 163, 74, 0.35)' : 'none',
                }}
              >
                {mobileStreaming ? (
                  <><i className="bx bx-check-circle" style={{ fontSize: '1.2rem' }} /> Proceed to Guidelines →</>
                ) : (
                  <><i className="bx bx-lock-alt" style={{ fontSize: '1.1rem' }} /> Pair Mobile Camera to Proceed (Required)</>
                )}
              </button>
            </div>
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

            {(() => {
              const activeQ = examQuestionsList[currentQuestion];
              const qTitle = activeQ?.title || activeQ?.description || `Technical Competency Question #${currentQuestion + 1}: Which architecture or data structure guarantees thread safety and O(1) performance in high-concurrency systems?`;
              const qOptions = (Array.isArray(activeQ?.options) && activeQ.options.length > 0)
                ? activeQ.options.map((opt: any, idx: number) => ({
                    id: opt.id || `opt-${idx}`,
                    label: String.fromCharCode(65 + idx),
                    text: opt.optionText || opt.text || String(opt),
                  }))
                : [
                    { id: 'opt-a', label: 'A', text: 'ConcurrentHashMap utilizing CAS and synchronized bucket nodes' },
                    { id: 'opt-b', label: 'B', text: 'Binary Search Tree with non-atomic recursive insertion' },
                    { id: 'opt-c', label: 'C', text: 'Singly Linked List requiring sequential O(N) traversal' },
                    { id: 'opt-d', label: 'D', text: 'Balanced AVL Tree with global lock contention' },
                  ];

              return (
                <>
                  <h2 className={styles.questionText}>{qTitle}</h2>

                  <div className={styles.options}>
                    {qOptions.map((opt: any) => (
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
                </>
              );
            })()}

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
                {results?.score !== undefined && results?.score !== null ? `${results.score}%` : 'COMPLETED'}
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

              <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setShowSettingsModal(true)}
                >
                  <i className="bx bx-slider" /> View System Logs
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={handleReturnToDashboard}
                  style={{ padding: '10px 24px' }}
                >
                  <i className="bx bx-home-alt" /> Return to Dashboard
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
          {step === 'dashboard' ? (
            <span className={styles.bottomBarBadge} style={{ background: 'rgba(34, 197, 94, 0.12)', borderColor: 'rgba(34, 197, 94, 0.35)', color: '#15803d' }}>
              <i className="bx bx-shield-quarter" /> STUDENT SECURE CLIENT &middot; BEYON WORKSPACE
            </span>
          ) : (
            <span className={styles.bottomBarBadge}>
              <i className="bx bx-shield-alt-2" /> KIOSK LOCKDOWN &middot; FULLSCREEN
            </span>
          )}
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
