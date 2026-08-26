export interface AssessmentPolicy {
  id: string;
  companyUserId: string;
  opportunityId?: string;
  name: string;
  maxWarningsBeforeFlag: number;
  maxWarningsBeforeTerminate: number;
  criticalViolationTerminate: boolean;
  allowCameraToggle: boolean;
  allowFullscreenExit: boolean;
  maxFullscreenExits: number;
  maxSessionInterruptions: number;
  timeExtensionAllowed: boolean;
  autoSubmitOnExpire: boolean;
  recordScreen: boolean;
  recordCamera: boolean;
  recordAudio: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentSession {
  sessionId: string;
  sessionToken?: string;
  launchToken?: string;
  status: string;
  totalQuestions: number;
  durationMinutes: number;
  startedAt?: string;
  submittedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  score?: number;
  accuracy?: number;
  questionsAttempted: number;
  questionsCorrect: number;
  timeUsedSeconds: number;
  integrityStatus: string;
  warningCount: number;
  criticalEventCount: number;
}

export interface AssessmentAnswer {
  answerId: string;
  sessionId: string;
  questionId: string;
  selectedOptionId?: string;
  answerText?: string;
  codeAnswer?: string;
  timeSpentSeconds: number;
  markedForReview: boolean;
  updatedAt: string;
}

export interface ProctoringEvent {
  eventId?: string;
  id?: string;
  eventType: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description?: string;
  timestamp?: string;
  confidence?: number;
  metadata?: string;
}

export interface ProctoringReport {
  sessionId: string;
  integrityStatus: string;
  warningCount: number;
  criticalEventCount: number;
  fullscreenExitCount: number;
  windowFocusLostCount: number;
  connectionLostCount: number;
  eventBreakdown: Record<string, number>;
  events: ProctoringEvent[];
  recommendation: string;
}

export interface AssessmentResult {
  sessionId: string;
  score: number;
  accuracy: number;
  questionsAttempted: number;
  questionsCorrect: number;
  timeUsedSeconds: number;
  integrityStatus: string;
  warningCount: number;
  criticalEventCount: number;
  status: string;
  completedAt: string;
  proctoringEvents?: ProctoringEvent[];
  eventBreakdown?: Record<string, number>;
  skillPerformance?: string;
  topicPerformance?: string;
}

export interface SystemCheckResult {
  checkType: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details?: string;
}

export interface RemainingTime {
  remainingSeconds: number;
  expired: boolean;
  serverTime: string;
}
