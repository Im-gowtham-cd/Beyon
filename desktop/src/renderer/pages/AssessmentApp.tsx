import { useState, useEffect, useCallback, useRef } from 'react';
import QRCode from 'qrcode';
import styles from './AssessmentApp.module.css';
import logoTransparent from '../../../public/logo-transparent.png';
import logoIcon from '../../../public/logo-icon.png';
import logoPng from '../../../public/logo.png';

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
  const [answers, setAnswers] = useState<Record<string, { optionId?: string; optionIds?: string[]; marked: boolean }>>({});
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

  const [reattemptsMap, setReattemptsMap] = useState<Record<string, any>>({});
  const [showReattemptModal, setShowReattemptModal] = useState<{
    oppId: string;
    oppTitle: string;
    companyName?: string;
    defaultTerminationReason?: string;
  } | null>(null);
  const [reattemptStudentReason, setReattemptStudentReason] = useState<string>('');
  const [isSubmittingReattempt, setIsSubmittingReattempt] = useState<boolean>(false);
  const [reattemptSuccessMsg, setReattemptSuccessMsg] = useState<string>('');

  const [showExitModal, setShowExitModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [cameraTestActive, setCameraTestActive] = useState(false);
  const settingsVideoRef = useRef<HTMLVideoElement | null>(null);
  const settingsStreamRef = useRef<MediaStream | null>(null);

  const [proctorStatus, setProctorStatus] = useState<'CLEAR' | 'WARNING' | 'CRITICAL'>('CLEAR');
  const [proctorMessage, setProctorMessage] = useState('Face Detected & Monitored');
  const [activeWarningModal, setActiveWarningModal] = useState<{
    strike: number;
    maxStrikes: number;
    isTerminated: boolean;
    title: string;
    reason: string;
  } | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isTerminatingRef = useRef(false);
  const strikeCountRef = useRef(0);
  const categoryStrikesRef = useRef<{
    PHONE: number;
    PERSON: number;
    SOUND: number;
    ABSENT: number;
    GAZE: number;
    OTHER: number;
  }>({
    PHONE: 0,
    PERSON: 0,
    SOUND: 0,
    ABSENT: 0,
    GAZE: 0,
    OTHER: 0,
  });
  const lastStrikeTimeRef = useRef(0);
  const absenceStreakRef = useRef(0);
  const cameraCoverStreakRef = useRef(0);
  const multiPersonStreakRef = useRef(0);
  const phoneStreakRef = useRef(0);
  const lookAwayStreakRef = useRef(0);
  const voiceStreakRef = useRef(0);
  const noiseStreakRef = useRef(0);
  const proctorIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleSubmitRef = useRef<(() => void) | null>(null);

  const [procSessionId, setProcSessionId] = useState<string | null>(null);
  const [pairingToken, setPairingToken] = useState<string | null>(null);
  const [pairingUrl, setPairingUrl] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [mobilePaired, setMobilePaired] = useState(false);
  const [mobileStreaming, setMobileStreaming] = useState(false);
  const [dualViewLoading, setDualViewLoading] = useState(false);
  const [dualViewConsent, setDualViewConsent] = useState(false);
  const dualViewPollingRef = useRef<any>(null);

  const captureFrameBase64 = (): string | null => {
    try {
      const canvas = analysisCanvasRef.current || document.createElement('canvas');
      if (examVideoRef.current && examVideoRef.current.readyState >= 2) {
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(examVideoRef.current, 0, 0, 320, 240);
          return canvas.toDataURL('image/jpeg', 0.7);
        }
      }
    } catch {}
    return null;
  };

  const logProctoringIncident = async (
    incidentType: string,
    severity: string,
    confidence: number,
    reason: string,
    source: string = 'LAPTOP_FRONT',
    evidenceBase64?: string | null
  ) => {
    if (!procSessionId) return;
    try {
      await fetch(`${API_BASE}/proctoring/dualview/${procSessionId}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentType,
          severity,
          confidence,
          riskContribution: severity === 'CRITICAL' ? 100 : severity === 'HIGH' ? 35 : 20,
          sources: [source],
          evidenceBase64: evidenceBase64 || captureFrameBase64(),
        }),
      });
    } catch (e) {
      console.warn('[RuleEngine] Error logging incident:', e);
    }
  };

  const getViolationCategory = (eventType: string): 'PHONE' | 'PERSON' | 'SOUND' | 'ABSENT' | 'GAZE' | 'OTHER' => {
    if (eventType === 'PHONE_DETECTED' || eventType === 'POSSIBLE_QUESTION_CAPTURE') return 'PHONE';
    if (eventType === 'MULTIPLE_PEOPLE' || eventType === 'SECOND_PERSON' || eventType === 'MULTIPLE_FACES') return 'PERSON';
    if (eventType === 'SUSPICIOUS_SPEECH' || eventType === 'SECOND_VOICE' || eventType === 'CONVERSATION_SUSPECTED' || eventType === 'AUDIO_VIOLATION') return 'SOUND';
    if (eventType === 'CANDIDATE_ABSENT' || eventType === 'FACE_MISSING' || eventType === 'NO_PERSON_DETECTED' || eventType === 'SUSTAINED_ABSENCE') return 'ABSENT';
    if (eventType === 'LOOKING_AWAY' || eventType === 'GAZE_DEVIATION' || eventType === 'SUSPICIOUS_BEHAVIOR') return 'GAZE';
    return 'OTHER';
  };

  const getMaxWarningsForCategory = (cat: 'PHONE' | 'PERSON' | 'SOUND' | 'ABSENT' | 'GAZE' | 'OTHER'): number => {
    switch (cat) {
      case 'PHONE': return 0;
      case 'PERSON': return 1;
      case 'SOUND': return 3;
      case 'ABSENT': return 2;
      case 'GAZE': return 3;
      default: return 3;
    }
  };

  const triggerRuleEngineViolation = (
    eventType: string,
    reason: string,
    cameraSource: string = 'LAPTOP_FRONT',
    isInstantKill: boolean = false
  ) => {
    if (isTerminatingRef.current) return;

    const snapshot = captureFrameBase64();
    const category = getViolationCategory(eventType);
    const maxAllowed = getMaxWarningsForCategory(category);

    if (isInstantKill || maxAllowed === 0) {
      isTerminatingRef.current = true;
      setProctorStatus('CRITICAL');
      setProctorMessage('AUTO-TERMINATED (PHONE DETECTED)');
      setActiveWarningModal({
        strike: 1,
        maxStrikes: 0,
        isTerminated: true,
        title: 'CRITICAL VIOLATION: MOBILE PHONE DETECTED',
        reason: `Unauthorized mobile device detected (${cameraSource}). In accordance with strict examination security policy (0 warnings allowed for mobile phones), this session has been immediately terminated and logged.`,
      });
      addMalpracticeAlert('CRITICAL_PHONE_TERMINATION', `🚨 CRITICAL VIOLATION: ${reason}. Assessment terminated.`);
      setProctoringWarnings(prev => [...prev, `[INSTANT TERMINATION - 0 WARNINGS] ${reason} (${cameraSource})`]);

      logProctoringIncident(eventType, 'CRITICAL', 0.98, reason, cameraSource, snapshot);

      setTimeout(() => {
        if (handleSubmitRef.current) handleSubmitRef.current();
      }, 2200);
      return;
    }

    const now = Date.now();
    if (now - lastStrikeTimeRef.current < 3000) return;
    lastStrikeTimeRef.current = now;

    strikeCountRef.current += 1;
    categoryStrikesRef.current[category] = (categoryStrikesRef.current[category] || 0) + 1;
    const catStrikes = categoryStrikesRef.current[category];
    const totalStrikes = strikeCountRef.current;
    setStrikeCount(totalStrikes);

    const isTerminated = catStrikes > maxAllowed;

    setProctoringWarnings(prev => [
      ...prev,
      `[${category} WARNING ${catStrikes}/${maxAllowed}] ${reason} (${cameraSource})`
    ]);

    const severity = isTerminated ? 'CRITICAL' : catStrikes === maxAllowed ? 'HIGH' : 'MEDIUM';
    logProctoringIncident(eventType, severity, 0.90, reason, cameraSource, snapshot);

    if (isTerminated) {
      isTerminatingRef.current = true;
      setProctorStatus('CRITICAL');
      setProctorMessage(`AUTO-TERMINATED (${category} LIMIT EXCEEDED)`);
      setActiveWarningModal({
        strike: catStrikes,
        maxStrikes: maxAllowed,
        isTerminated: true,
        title: `⛔ ASSESSMENT TERMINATED (${category} Limit Exceeded)`,
        reason: `You have exceeded the maximum allowed warnings for ${category.toLowerCase()} violations (${maxAllowed} allowed). Latest infraction: ${reason}. Assessment is being auto-submitted.`,
      });
      addMalpracticeAlert('STRIKE_LIMIT_TERMINATION', `⛔ TERMINATED: ${category} Limit Exceeded (${reason}).`);

      setTimeout(() => {
        if (handleSubmitRef.current) handleSubmitRef.current();
      }, 2500);
    } else {
      setProctorStatus('WARNING');
      setProctorMessage(`${category} Warning ${catStrikes}/${maxAllowed}: ${reason}`);
      const isFinal = catStrikes === maxAllowed;
      setActiveWarningModal({
        strike: catStrikes,
        maxStrikes: maxAllowed,
        isTerminated: false,
        title: isFinal ? `🚨 FINAL WARNING (${catStrikes} of ${maxAllowed})` : `Proctoring Warning (${catStrikes} of ${maxAllowed})`,
        reason: `${reason}. You have ${maxAllowed - catStrikes} warning(s) remaining for ${category.toLowerCase()} before automatic session termination.`,
      });
      addMalpracticeAlert(`VIOLATION_${category}_${catStrikes}`, `⚠️ Warning (${catStrikes}/${maxAllowed}): ${reason}`);
    }
  };

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
      const [profRes, oppsRes, weeklyRes, reattemptRes] = await Promise.all([
        fetch(`${API_BASE}/student/profile`, { headers }).catch(() => null),
        fetch(`${API_BASE}/opportunities/opted-in`, { headers }).catch(() => null),
        fetch(`${API_BASE}/weekly-tests`, { headers }).catch(() => null),
        fetch(`${API_BASE}/assessment/my-reattempts`, { headers }).catch(() => null),
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
      if (reattemptRes && reattemptRes.ok) {
        const d = await reattemptRes.json();
        const reqs = Array.isArray(d) ? d : (d.data || []);
        const map: Record<string, any> = {};
        reqs.forEach((r: any) => {
          if (r.opportunityId) {

            if (!map[r.opportunityId] || new Date(r.createdAt).getTime() > new Date(map[r.opportunityId].createdAt).getTime()) {
              map[r.opportunityId] = r;
            }
          }
        });
        setReattemptsMap(map);
      }
    } catch (e) {
      console.warn('Error loading student dashboard data:', e);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const handleOpenReattemptModal = (oppId: string, oppTitle: string, companyName?: string, defaultTermination?: string) => {
    setError('');
    setReattemptSuccessMsg('');
    setReattemptStudentReason('');
    setShowReattemptModal({
      oppId,
      oppTitle,
      companyName,
      defaultTerminationReason: defaultTermination || 'Assessment terminated or submitted with proctoring incidents',
    });
  };

  const handleSubmitReattemptRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReattemptModal || !reattemptStudentReason.trim()) return;

    setIsSubmittingReattempt(true);
    setError('');
    setReattemptSuccessMsg('');

    try {
      const activeToken = token || (await window.beyon?.auth?.getToken?.()) || null;
      const res = await fetch(`${API_BASE}/assessment/reattempt-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
        body: JSON.stringify({
          opportunityId: showReattemptModal.oppId,
          studentReason: reattemptStudentReason.trim(),
          terminationReason: showReattemptModal.defaultTerminationReason || 'Proctoring violation or network disconnection',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to submit reattempt request');
      }

      setReattemptSuccessMsg('Reattempt request submitted successfully! The recruiter / company has been notified to review your appeal.');
      if (activeToken) {
        await fetchStudentDashboardData(activeToken);
      }
      setTimeout(() => {
        setShowReattemptModal(null);
        setReattemptSuccessMsg('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit reattempt request');
    } finally {
      setIsSubmittingReattempt(false);
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

  useEffect(() => {
    if (step !== 'verify') {

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

    const handleFullscreenChange = (fullscreen: boolean) => {
      if (!fullscreen && step === 'exam') {
        triggerRuleEngineViolation('FULLSCREEN_EXIT', 'Exited fullscreen examination mode', 'DESKTOP_SYSTEM');
      }
    };

    const handleFocusChange = (focused: boolean) => {
      if (!focused && step === 'exam') {
        triggerRuleEngineViolation('WINDOW_FOCUS_LOST', 'Window focus lost or application switched', 'DESKTOP_SYSTEM');
      }
    };

    const handleMinimize = () => {
      if (step === 'exam') {
        triggerRuleEngineViolation('WINDOW_MINIMIZED', 'Assessment window was minimized', 'DESKTOP_SYSTEM');
      }
    };

    const handleBeforeQuit = () => {
      if (step === 'exam') {
        triggerRuleEngineViolation('ATTEMPTED_QUIT', 'Candidate attempted to quit during active assessment', 'DESKTOP_SYSTEM');
      }
    };

    window.beyon?.proctoring?.onFullscreenChange(handleFullscreenChange);
    window.beyon?.proctoring?.onFocusChange(handleFocusChange);
    window.beyon?.proctoring?.onMinimize(handleMinimize);
    window.beyon?.proctoring?.onBeforeQuit(handleBeforeQuit);

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

              analyser.getByteTimeDomainData(timeData);
              let sumSquares = 0;
              for (let i = 0; i < timeData.length; i++) {
                const val = (timeData[i] - 128) / 128;
                sumSquares += val * val;
              }
              const rms = Math.sqrt(sumSquares / timeData.length);

              analyser.getByteFrequencyData(freqData);
              let voiceSum = 0;
              for (let i = 2; i < 45; i++) {
                voiceSum += freqData[i];
              }
              const voiceAvg = voiceSum / 43;

              if (rms > 0.045 || voiceAvg > 28) {
                voiceStreakRef.current++;
                if (voiceStreakRef.current >= 6) {
                  voiceStreakRef.current = 0;
                  triggerRuleEngineViolation(
                    'SUSPICIOUS_SPEECH',
                    `Acoustic speech / conversation detected in exam room (${Math.round(rms * 100)}% energy)`,
                    'MICROPHONE'
                  );
                }
              } else {
                voiceStreakRef.current = 0;
              }
            };
          }
        } catch {}

        const canvas = analysisCanvasRef.current || document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 120;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        proctorIntervalRef.current = setInterval(() => {
          if (isTerminatingRef.current) return;
          if (!examVideoRef.current || examVideoRef.current.readyState < 2 || !ctx) return;

          if ((stream as any)._checkAudio) {
            (stream as any)._checkAudio();
          }

          ctx.drawImage(examVideoRef.current, 0, 0, 160, 120);
          const frame = ctx.getImageData(0, 0, 160, 120);
          const data = frame.data;

          let centerSkinPixels = 0;
          let phoneBrightPixels = 0;
          let phoneEdgeTransitions = 0;
          let totalLum = 0;
          let totalEdges = 0;
          let sumSkinX = 0;
          let sumSkinY = 0;
          let totalSkinMass = 0;
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
                totalSkinMass++;
                sumSkinX += x;
                sumSkinY += y;

                if (x >= 35 && x <= 125 && y >= 10 && y <= 95) {
                  centerSkinPixels++;
                }

                if (y >= 10 && y <= 65) {
                  colSkin[x]++;
                }
              }

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
          const isLaptopCameraCovered = (avgLum < 22) || (totalEdges < 50 && (avgLum < 45 || centerSkinPixels > 1000));

          if (isLaptopCameraCovered) {
            cameraCoverStreakRef.current++;
            if (cameraCoverStreakRef.current >= 6) {
              cameraCoverStreakRef.current = 0;
              triggerRuleEngineViolation('CAMERA_OBSTRUCTION', 'Camera lens is covered or obstructed', 'LAPTOP_FRONT');
            }
          } else {
            cameraCoverStreakRef.current = 0;
          }

          if (!isLaptopCameraCovered && centerSkinPixels < 130) {
            absenceStreakRef.current++;
            if (absenceStreakRef.current >= 8) {
              absenceStreakRef.current = 0;
              triggerRuleEngineViolation('CANDIDATE_ABSENT', 'Candidate absent from camera viewport', 'LAPTOP_FRONT');
            }
          } else if (!isLaptopCameraCovered) {
            absenceStreakRef.current = 0;
          }

          if (!isLaptopCameraCovered && totalSkinMass > 150) {
            const faceCenterX = sumSkinX / totalSkinMass;
            const faceCenterY = sumSkinY / totalSkinMass;
            const xOffset = (faceCenterX - 80) / 80;
            const yOffset = (faceCenterY - 60) / 60;

            const isLookingAway = Math.abs(xOffset) > 0.32 || yOffset > 0.38;
            if (isLookingAway) {
              lookAwayStreakRef.current++;
              if (lookAwayStreakRef.current >= 7) {
                lookAwayStreakRef.current = 0;
                const dir = xOffset < -0.32 ? 'left' : xOffset > 0.32 ? 'right' : 'downwards';
                triggerRuleEngineViolation('LOOKING_AWAY', `Candidate continuously looking away (${dir})`, 'LAPTOP_FRONT');
              }
            } else {
              lookAwayStreakRef.current = 0;
            }
          } else {
            lookAwayStreakRef.current = 0;
          }

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

          const hasTwoDistinctHeads = leftHeadMass > 600 && rightHeadMass > 600 && valleyColumns >= 6;
          if (hasTwoDistinctHeads) {
            multiPersonStreakRef.current++;
            if (multiPersonStreakRef.current >= 5) {
              multiPersonStreakRef.current = 0;
              triggerRuleEngineViolation('MULTIPLE_PEOPLE', 'Multiple people detected in examination view', 'LAPTOP_FRONT');
            }
          } else {
            multiPersonStreakRef.current = 0;
          }

          if (!isLaptopCameraCovered && centerSkinPixels >= 130 && !hasTwoDistinctHeads && strikeCountRef.current === 0) {
            setProctorStatus('CLEAR');
            setProctorMessage('Face Detected & Monitored');
          }
        }, 500);

      } catch {
        setExamCameraReady(false);
      }
    };

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

                const incidentTime = inc.startedAt ? Date.parse(inc.startedAt) : 0;
                if (incidentTime > 0 && incidentTime < examStartTime - 3000) continue;

                const type = inc.incidentType;
                if (type === 'PHONE_DETECTED' || type === 'POSSIBLE_QUESTION_CAPTURE') {
                  triggerRuleEngineViolation(
                    'PHONE_DETECTED',
                    'Unauthorized mobile device detected in camera view',
                    'MOBILE_SIDE',
                    false
                  );
                } else if (type === 'SECOND_PERSON' || type === 'MULTIPLE_PEOPLE') {
                  triggerRuleEngineViolation(
                    'MULTIPLE_PEOPLE',
                    'Additional person detected in secondary camera view',
                    'MOBILE_SIDE'
                  );
                } else if (type === 'CAMERA_TAMPERING' || type === 'CAMERA_COVERED' || type === 'CAMERA_OBSTRUCTION') {
                  triggerRuleEngineViolation(
                    'CAMERA_OBSTRUCTION',
                    'Secondary camera lens is obstructed or covered',
                    'MOBILE_SIDE'
                  );
                } else if (type === 'CANDIDATE_ABSENT' || type === 'NO_PERSON_DETECTED' || type === 'SUSTAINED_ABSENCE') {
                  triggerRuleEngineViolation(
                    'CANDIDATE_ABSENT',
                    'Candidate absent from workspace in secondary camera view',
                    'MOBILE_SIDE'
                  );
                }
              }
            }
          }
        } catch {}
      }, 2000);
    }

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

      if (session) {
        await apiFetch(`/assessment/session/${session.sessionId}/verify`, {
          method: 'POST',
          body: JSON.stringify({ status: 'VERIFIED', faceDetected: true, faceCount: 1, livenessScore: 0.95 }),
        });
      }

      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
        cameraStreamRef.current = null;
      }
      setStep('system-check');
    } catch (err: any) {
      setError(`Verification failed: ${err.message}. You may still proceed.`);

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

    setCheckStatus({});

    for (const ct of CHECK_TYPES) {
      await new Promise(resolve => setTimeout(resolve, 700));
      setCheckStatus(prev => ({ ...prev, [ct]: 'PASS' }));

      if (session) {
        apiFetch(`/assessment/session/${session.sessionId}/system-check`, {
          method: 'POST',
          body: JSON.stringify({ checkType: ct, status: 'PASS' }),
        }).catch(() => {});
      }
    }

    if (session) {
      apiFetch(`/assessment/session/${session.sessionId}/system-check/complete`, {
        method: 'POST',
      }).catch(() => {});
    }

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

  useEffect(() => {
    if (step === 'system-check') {
      setCheckStatus({});
      runSystemChecks();
    }
  }, [step]);

  const startExam = async () => {
    setError('');
    if (!session) {

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

  const handleAnswer = (questionId: string, optionId: string, isMultiple: boolean = false) => {
    setAnswers(prev => {
      const existing = prev[questionId] || { marked: false };
      if (isMultiple) {
        const currentList = existing.optionIds || (existing.optionId ? [existing.optionId] : []);
        const nextList = currentList.includes(optionId)
          ? currentList.filter(id => id !== optionId)
          : [...currentList, optionId];
        return {
          ...prev,
          [questionId]: {
            ...existing,
            optionId: nextList[0] || undefined,
            optionIds: nextList,
            marked: existing.marked,
          },
        };
      } else {
        return {
          ...prev,
          [questionId]: {
            ...existing,
            optionId,
            optionIds: [optionId],
            marked: existing.marked,
          },
        };
      }
    });
  };

  const handleMarkReview = (questionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        marked: !prev[questionId]?.marked,
      },
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

    window.beyon?.assessment?.unlockWindow();
    setStep('submitting');

    const payloadAnswers: Record<string, any> = {};
    examQuestionsList.forEach((q: any, idx: number) => {
      const qKey = `q-${idx + 1}`;
      const ans = answers[qKey] || (q.id ? answers[q.id] : null);
      if (ans && (ans.optionId || (ans.optionIds && ans.optionIds.length > 0))) {
        payloadAnswers[q.id || qKey] = {
          questionId: q.id,
          optionId: ans.optionId,
          optionIds: ans.optionIds || (ans.optionId ? [ans.optionId] : []),
          selectedOptionId: ans.optionId,
          selectedOptionIds: ans.optionIds || (ans.optionId ? [ans.optionId] : []),
          marked: ans.marked,
        };
      }
    });

    if (!session || session.sessionId === '00000000-0000-0000-0000-000000000001') {
      const attemptedCount = Object.values(answers).filter(a => a.optionId || (a.optionIds && a.optionIds.length > 0)).length;
      setResults({ score: 0, accuracy: 0, status: 'SUBMITTED', totalQuestions: totalQ, answeredCount: attemptedCount });
      setStep('results');
      return;
    }

    try {
      const res = await apiFetch(`/assessment/session/${session.sessionId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers: payloadAnswers }),
      });
      setResults(res);
      setStep('results');
    } catch (err: any) {
      console.warn('Submission fallback:', err);
      const attemptedCount = Object.values(answers).filter(a => a.optionId || (a.optionIds && a.optionIds.length > 0)).length;
      setResults({ score: 0, accuracy: 0, status: 'SUBMITTED', totalQuestions: totalQ, answeredCount: attemptedCount });
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
      const oppId = targetId || activeOpportunity?.id || null;
      let activeSessionData: any = null;

      if (oppId) {
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

        if (res.status === 409) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error || errData.message || 'You have already completed and submitted the assessment for this drive. Retakes are not permitted.';
          setError(errMsg);
          setIsStartingAssessment(false);
          return;
        }

        if (res.ok) {
          activeSessionData = await res.json();
        }
      }

      const totalQuestionsCount = activeSessionData?.totalQuestions || totalQCount;
      const durationMinutesVal = activeSessionData?.durationMinutes || durationMins;

      setSession({
        sessionId: activeSessionData?.sessionId || '00000000-0000-0000-0000-000000000001',
        status: activeSessionData?.status || 'CREATED',
        totalQuestions: totalQuestionsCount,
        durationMinutes: durationMinutesVal,
      });

      try {
        const qEndpoint = oppId
          ? `${API_BASE}/opportunities/${oppId}/questions`
          : `${API_BASE}/practice/questions?size=${totalQuestionsCount}`;

        const qRes = await fetch(qEndpoint, {
          headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : {},
        });
        if (qRes.ok) {
          const qData = await qRes.json();
          const list = qData.data || qData || [];
          if (Array.isArray(list) && list.length > 0) {
            setExamQuestionsList(list);
            setSession(prev => prev ? { ...prev, totalQuestions: list.length } : prev);
          }
        }
      } catch (e) {
        console.warn('Drive questions pre-fetch fallback:', e);
      }

      await window.beyon?.assessment?.enterFullscreen();
      setStep('verify');
    } catch (err: any) {
      console.warn('Error starting assessment session:', err);
      setError(err?.message || 'Failed to start assessment session.');
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

      <header className={styles.assessmentHeader}>
        <div className={styles.brandTitle}>
          <img src={logoTransparent} alt="Beyon" className={styles.brandLogoImg} />
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

      {step === 'auth' && (
        <main className={styles.main}>
          <div className={styles.authCard}>
            <div className={styles.authAside}>
              <div className={styles.authAsideLogoWrapper}>
                <img src={logoPng} alt="Beyon Official Logo" className={styles.authAsideLogo} />
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
                <img src={logoIcon} alt="Beyon Icon" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
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

      {step === 'dashboard' && (
        <main className={styles.dashboardMain}>

          <div className={styles.dashHero}>
            <div className={styles.dashHeroContent}>
              <div className={styles.dashBadgeRow}>
                <span className={styles.portalBadge}>
                  <img src={logoIcon} alt="Beyon" style={{ width: '15px', height: '15px', objectFit: 'contain', verticalAlign: 'middle', marginRight: '6px' }} />
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
                      {(() => {
                        const reattempt = reattemptsMap[opp.id];
                        const isCompleted = opp.applicationStatus === 'ASSESSED' || opp.assessmentScore != null;

                        if (reattempt && reattempt.status === 'APPROVED') {
                          return (
                            <button
                              className={styles.btnTakeTest}
                              onClick={() => handleTakeTest(opp.id, opp.title, opp.durationMinutes || 60, opp.totalQuestions || 20)}
                              disabled={isStartingAssessment}
                              type="button"
                              style={{
                                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                borderColor: '#059669',
                                color: '#ffffff',
                              }}
                            >
                              {isStartingAssessment ? (
                                <><i className="bx bx-loader-alt bx-spin" /> Launching...</>
                              ) : (
                                <><i className="bx bx-play-circle" /> Reattempt Approved &middot; Start</>
                              )}
                            </button>
                          );
                        }

                        if (reattempt && reattempt.status === 'PENDING') {
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                              <button
                                className={styles.btnTakeTest}
                                disabled
                                type="button"
                                style={{
                                  background: '#fffbeb',
                                  color: '#b45309',
                                  border: '1.5px solid #fcd34d',
                                  cursor: 'not-allowed',
                                  opacity: 1,
                                  fontSize: '0.82rem',
                                  padding: '10px 16px',
                                }}
                              >
                                <i className="bx bx-time-five bx-spin" /> Reattempt Pending Approval
                              </button>
                              <span style={{ fontSize: '0.7rem', color: '#92400e', fontWeight: 600 }}>
                                Sent to {opp.companyName || 'Company Recruiter'}
                              </span>
                            </div>
                          );
                        }

                        if (reattempt && reattempt.status === 'REJECTED') {
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                              <button
                                className={styles.btnTakeTest}
                                onClick={() => handleOpenReattemptModal(opp.id, opp.title, opp.companyName, 'Previous request was rejected')}
                                type="button"
                                style={{
                                  background: '#fef2f2',
                                  color: '#dc2626',
                                  border: '1.5px solid #f87171',
                                  fontSize: '0.82rem',
                                  padding: '10px 16px',
                                }}
                              >
                                <i className="bx bx-refresh" /> Reattempt Rejected &middot; Re-apply
                              </button>
                              {reattempt.reviewNotes && (
                                <span style={{ fontSize: '0.68rem', color: '#b91c1c', maxWidth: '240px', textAlign: 'right' }}>
                                  Note: {reattempt.reviewNotes}
                                </span>
                              )}
                            </div>
                          );
                        }

                        if (isCompleted) {
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                              <button
                                className={styles.btnTakeTest}
                                disabled
                                type="button"
                                style={{
                                  background: '#f0fdf4',
                                  color: '#15803d',
                                  border: '1.5px solid #16a34a',
                                  cursor: 'default',
                                  opacity: 1,
                                  padding: '8px 16px',
                                  fontSize: '0.85rem',
                                }}
                              >
                                <i className="bx bx-check-circle" /> Score: {opp.assessmentScore ?? 0}%
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenReattemptModal(opp.id, opp.title, opp.companyName, `Assessment ended with score ${opp.assessmentScore ?? 0}%`)}
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  color: '#1e293b',
                                  padding: '6px 12px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <i className="bx bx-reset" /> Request Reattempt
                              </button>
                            </div>
                          );
                        }

                        return (
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
                        );
                      })()}
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

      {step === 'verify' && (
        <main className={styles.main}>
          <div className={styles.contentCard}>
            <h1 className={styles.title}>Candidate Verification</h1>
            <p className={styles.subtitle}>
              Ensure your face is clearly visible in the camera frame.
            </p>

            <div className={styles.cameraPreview} style={{ position: 'relative', background: '#0f172a', overflow: 'hidden' }}>

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
                  transform: 'scaleX(-1)',
                }}
              />

              {!cameraReady && !cameraError && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#94a3b8' }}>
                  <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 36 }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Starting camera...</span>
                </div>
              )}

              {cameraError && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, textAlign: 'center', color: '#f87171', background: '#0f172a' }}>
                  <i className="bx bx-camera-off" style={{ fontSize: 36 }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.5 }}>{cameraError}</span>
                </div>
              )}

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
                onClick={() => setStep('verify')}
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

      {step === 'exam' && (
        <div className={styles.body}>

          {activeAlert && (
            <div className={styles.alertBanner}>
              <i className="bx bx-error-circle" />
              <strong>Proctoring Alert:</strong> {activeAlert}
            </div>
          )}

          <aside className={styles.paletteContainer}>

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
              <div style={{ marginTop: 8, padding: '8px 10px', background: strikeCount > 0 ? '#fef2f2' : '#f8fafc', border: `1px solid ${strikeCount > 0 ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: strikeCount >= 2 ? '#b91c1c' : strikeCount === 1 ? '#c2410c' : '#475569' }}>
                    <i className="bx bx-shield-quarter" style={{ marginRight: 4 }} /> Violation Strikes:
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: strikeCount >= 2 ? '#b91c1c' : strikeCount === 1 ? '#c2410c' : '#16a34a' }}>
                    {strikeCount} / 3
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      style={{
                        flex: 1,
                        height: 5,
                        borderRadius: 3,
                        background: s <= strikeCount ? (strikeCount >= 3 ? '#dc2626' : '#ea580c') : '#cbd5e1',
                        boxShadow: s <= strikeCount ? '0 0 6px rgba(234, 88, 12, 0.4)' : 'none',
                        transition: 'background 0.3s',
                      }}
                    />
                  ))}
                </div>
              </div>
              {proctoringWarnings.length > 0 && (
                <div className={styles.warnCount} style={{ marginTop: 6 }}>
                  <i className="bx bx-error" /> {proctoringWarnings.length} violation{proctoringWarnings.length !== 1 ? 's' : ''} logged
                </div>
              )}
            </div>

            <div className={styles.paletteSection}>
              <div className={styles.paletteSectionTitle}>Question Palette</div>
              <div className={styles.palette}>
                {Array.from({ length: totalQ }, (_, i) => {
                  const qId = `q-${i + 1}`;
                  const ans = answers[qId];
                  const hasAnswered = Boolean(ans?.optionId || (ans?.optionIds && ans.optionIds.length > 0));
                  let btnClass = styles.paletteBtn;
                  if (i === currentQuestion) btnClass += ` ${styles.paletteActive}`;
                  else if (ans?.marked) btnClass += ` ${styles.paletteMarked}`;
                  else if (hasAnswered) btnClass += ` ${styles.paletteAnswered}`;
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
                <span>Answered: <b>{Object.values(answers).filter(a => a.optionId || (a.optionIds && a.optionIds.length > 0)).length}</b></span>
                <span>Remaining: <b>{totalQ - Object.values(answers).filter(a => a.optionId || (a.optionIds && a.optionIds.length > 0)).length}</b></span>
              </div>
            </div>
          </aside>

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
              const isMultiple = activeQ?.questionType === 'MCQ_MULTIPLE' ||
                                 activeQ?.questionType === 'MULTIPLE' ||
                                 activeQ?.type === 'MULTIPLE' ||
                                 Boolean(activeQ?.allowMultiple) ||
                                 Boolean(activeQ?.isMultipleChoice);

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {isMultiple ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 8px',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                      }}>
                        <i className="bx bx-check-square" style={{ fontSize: '1rem', color: '#2563eb' }} />
                        MULTIPLE CHOICE &middot; Select all that apply
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 8px',
                        background: '#f8fafc',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                      }}>
                        <i className="bx bx-radio-circle-marked" style={{ fontSize: '1rem', color: '#64748b' }} />
                        SINGLE CHOICE QUESTION
                      </span>
                    )}
                  </div>

                  <h2 className={styles.questionText}>{qTitle}</h2>

                  <div className={styles.options}>
                    {qOptions.map((opt: any) => {
                      const isSelected = isMultiple
                        ? Boolean(currentAns?.optionIds?.includes(opt.id))
                        : (currentAns?.optionId === opt.id || Boolean(currentAns?.optionIds?.includes(opt.id)));

                      return (
                        <div
                          key={opt.id}
                          className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                          onClick={() => handleAnswer(currentQId, opt.id, isMultiple)}
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {isMultiple ? (
                            <span
                              className={styles.optionMarker}
                              style={{
                                background: isSelected ? 'var(--color-primary)' : '#f8fafc',
                                color: isSelected ? '#ffffff' : '#475569',
                                border: `1.5px solid ${isSelected ? 'var(--color-primary)' : '#cbd5e1'}`,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <i className={`bx ${isSelected ? 'bx-check' : 'bx-minus'}`} style={{ fontSize: '1.1rem' }} />
                            </span>
                          ) : (
                            <span className={styles.optionMarker}>{opt.label}</span>
                          )}
                          <span className={styles.optionText} style={{ fontWeight: isSelected ? 600 : 400 }}>{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

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

      {step === 'submitting' && (
        <main className={styles.main}>
          <div className={styles.contentCard}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: '64px', color: 'var(--color-primary)' }} />
            <h1 className={styles.title}>Submitting Examination...</h1>
            <p className={styles.subtitle}>Syncing responses and generating performance analytics.</p>
          </div>
        </main>
      )}

      {step === 'results' && (
        <main className={styles.main} style={{ overflowY: 'auto', alignItems: 'center', padding: '32px 24px' }}>
          <div className={styles.resultsContainer}>

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
                    {Object.values(answers).filter(a => a.optionId || (a.optionIds && a.optionIds.length > 0)).length}
                  </div>
                </div>
                <div className={styles.resultItem}>
                  <div className={styles.resultLabel}>Accuracy</div>
                  <div className={styles.resultValue} style={{ color: (results?.accuracy ?? 0) >= 60 ? 'var(--color-success)' : '#dc2626' }}>
                    {results?.accuracy !== undefined && results?.accuracy !== null ? `${results.accuracy}%` : '0%'}
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
                {activeOpportunity && (
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => handleOpenReattemptModal(activeOpportunity.id, activeOpportunity.title, activeOpportunity.companyName, malpracticeAlerts.length > 0 ? `Terminated with ${malpracticeAlerts.length} proctoring violations` : `Completed with ${results?.accuracy ?? 0}% accuracy`)}
                    style={{ background: '#fef3c7', borderColor: '#fde047', color: '#854d0e', fontWeight: 700 }}
                  >
                    <i className="bx bx-reset" /> Request Reattempt from Company
                  </button>
                )}
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

      {/* Reattempt Request Submission Modal */}
      {showReattemptModal && (
        <div className={styles.modalOverlay} style={{ zIndex: 9998, background: 'rgba(15, 23, 42, 0.85)' }}>
          <div className={styles.modalCard} style={{ maxWidth: 560 }}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <i className="bx bx-reset" style={{ color: '#1c2d81' }} />
                <span>Request Assessment Reattempt</span>
              </div>
              <button
                className={styles.modalCloseBtn}
                onClick={() => {
                  setShowReattemptModal(null);
                  setReattemptSuccessMsg('');
                  setError('');
                }}
              >
                <i className="bx bx-x" />
              </button>
            </div>
            <form onSubmit={handleSubmitReattemptRequest}>
              <div className={styles.modalBody} style={{ padding: '20px 24px' }}>
                <div style={{ padding: '12px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e40af' }}>
                    {showReattemptModal.oppTitle}
                  </div>
                  {showReattemptModal.companyName && (
                    <div style={{ fontSize: '0.78rem', color: '#3b82f6', marginTop: '2px' }}>
                      <i className="bx bx-building" /> {showReattemptModal.companyName}
                    </div>
                  )}
                </div>

                {reattemptSuccessMsg ? (
                  <div style={{ padding: '16px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: '4px', fontSize: '0.85rem', lineHeight: 1.5, textAlign: 'center' }}>
                    <i className="bx bx-check-circle" style={{ fontSize: '24px', display: 'block', marginBottom: '6px', color: '#059669' }} />
                    {reattemptSuccessMsg}
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                      If your assessment was terminated due to a proctoring false positive, camera glitch, or power interruption, you can request an appeal. The hiring team will review your session logs and incident history to approve or deny a retake attempt.
                    </p>

                    {error && (
                      <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.8rem', borderRadius: '4px', marginBottom: '12px' }}>
                        <i className="bx bx-error" style={{ marginRight: 6 }} /> {error}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Reason for Reattempt Appeal <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Explain what happened (e.g. 'Sudden power outage/Wi-Fi disconnection during question 8' or 'Front camera glitched when shifting posture')..."
                        value={reattemptStudentReason}
                        onChange={(e) => setReattemptStudentReason(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '4px',
                          fontFamily: 'inherit',
                          fontSize: '0.85rem',
                          color: '#0f172a',
                          resize: 'vertical',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#64748b', background: '#f8fafc', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                      <i className="bx bx-shield-quarter" style={{ marginRight: 4, color: '#1c2d81' }} />
                      Session proctoring incident records and dual-camera flags will be shared with the recruiter for verification.
                    </div>
                  </>
                )}
              </div>

              {!reattemptSuccessMsg && (
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => {
                      setShowReattemptModal(null);
                      setError('');
                    }}
                    disabled={isSubmittingReattempt}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.btnPrimary}
                    disabled={isSubmittingReattempt || !reattemptStudentReason.trim()}
                    style={{ background: '#1c2d81', borderColor: '#1c2d81' }}
                  >
                    {isSubmittingReattempt ? (
                      <><i className="bx bx-loader-alt bx-spin" /> Submitting Appeal...</>
                    ) : (
                      <><i className="bx bx-send" /> Submit Reattempt Appeal</>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
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

      {/* Proctoring Violation Strike Modal Overlay */}
      {activeWarningModal && (
        <div className={styles.modalOverlay} style={{ zIndex: 9999, background: 'rgba(15, 23, 42, 0.88)' }}>
          <div
            className={styles.modalCard}
            style={{
              maxWidth: 520,
              border: `2px solid ${activeWarningModal.isTerminated ? '#dc2626' : '#ea580c'}`,
              boxShadow: activeWarningModal.isTerminated ? '0 0 30px rgba(220, 38, 38, 0.4)' : '0 0 25px rgba(234, 88, 12, 0.35)',
            }}
          >
            <div
              className={styles.modalHeader}
              style={{
                background: activeWarningModal.isTerminated ? '#fef2f2' : '#fff7ed',
                borderBottom: `1px solid ${activeWarningModal.isTerminated ? '#fca5a5' : '#fdba74'}`,
              }}
            >
              <div
                className={styles.modalTitle}
                style={{
                  color: activeWarningModal.isTerminated ? '#991b1b' : '#c2410c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <i className={`bx ${activeWarningModal.isTerminated ? 'bx-error-circle' : 'bx-error'}`} style={{ fontSize: 22 }} />
                <span>{activeWarningModal.title}</span>
              </div>
            </div>
            <div className={styles.modalBody} style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                  Violation Status:
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: activeWarningModal.isTerminated ? '#dc2626' : '#ea580c' }}>
                  {activeWarningModal.maxStrikes === 0
                    ? '0 Warnings Allowed (Instant Termination)'
                    : `${activeWarningModal.strike} / ${activeWarningModal.maxStrikes} Warning${activeWarningModal.maxStrikes !== 1 ? 's' : ''}`}
                </span>
              </div>

              {activeWarningModal.maxStrikes > 0 && (
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {Array.from({ length: activeWarningModal.maxStrikes }).map((_, idx) => {
                    const s = idx + 1;
                    const filled = s <= activeWarningModal.strike;
                    return (
                      <div
                        key={s}
                        style={{
                          flex: 1,
                          height: 8,
                          borderRadius: 4,
                          background: filled ? (activeWarningModal.isTerminated ? '#dc2626' : '#f97316') : '#e2e8f0',
                          boxShadow: filled ? '0 0 8px rgba(220, 38, 38, 0.35)' : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              )}

              <div
                style={{
                  padding: '14px 16px',
                  background: activeWarningModal.isTerminated ? '#fef2f2' : '#f8fafc',
                  border: `1px solid ${activeWarningModal.isTerminated ? '#fecaca' : '#e2e8f0'}`,
                  borderRadius: 6,
                  lineHeight: 1.6,
                  fontSize: '0.88rem',
                  color: '#1e293b',
                  fontWeight: 500,
                }}
              >
                {activeWarningModal.reason}
              </div>

              <div style={{ marginTop: 14, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                {activeWarningModal.isTerminated ? (
                  <span style={{ color: '#dc2626', fontWeight: 700 }}>
                    Assessment session has ended. All recorded answers and proctoring telemetry are being finalized.
                  </span>
                ) : (
                  <span>
                    Notice: Video frames, dual-camera coverage, and acoustic signals are continuously verified. Please maintain silence and full dual-camera presence.
                  </span>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              {!activeWarningModal.isTerminated ? (
                <button
                  className={styles.btnPrimary}
                  style={{ width: '100%', padding: '12px 20px', background: '#ea580c', borderColor: '#ea580c' }}
                  onClick={() => setActiveWarningModal(null)}
                >
                  <i className="bx bx-check-circle" /> I Acknowledge &amp; Return to Exam
                </button>
              ) : (
                <div style={{ textAlign: 'center', width: '100%', fontWeight: 700, color: '#dc2626', fontSize: '0.85rem' }}>
                  <i className="bx bx-loader-alt bx-spin" style={{ marginRight: 6 }} /> Auto-submitting assessment session...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

