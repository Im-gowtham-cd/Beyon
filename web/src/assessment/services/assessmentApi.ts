import { api } from '../../services/api/client';
import type {
  AssessmentSession,
  AssessmentPolicy,
  ProctoringEvent,
  ProctoringReport,
  AssessmentResult,
  RemainingTime,
  SystemCheckResult,
} from '../types/assessment';

export const assessmentApi = {
  createSession: async (applicationId: string, opportunityId: string, questionCount = 40, durationMinutes = 60): Promise<AssessmentSession> => {
    return api.post<AssessmentSession>('/assessment/session', { applicationId, opportunityId, questionCount, durationMinutes });
  },

  generateLaunchToken: async (sessionId: string): Promise<{ launchToken: string }> => {
    return api.post<{ launchToken: string }>(`/assessment/session/${sessionId}/launch-token`);
  },

  launchSession: async (launchToken: string, deviceFingerprint: string, deviceInfo: string): Promise<AssessmentSession> => {
    return api.post<AssessmentSession>('/assessment/launch', { launchToken, deviceFingerprint, deviceInfo });
  },

  verifyIdentity: async (sessionId: string, status: string, captureUrl?: string, faceDetected?: boolean, faceCount?: number, livenessScore?: number): Promise<{ sessionId: string; status: string }> => {
    return api.post<{ sessionId: string; status: string }>(`/assessment/session/${sessionId}/verify`, { status, captureUrl, faceDetected, faceCount, livenessScore });
  },

  recordSystemCheck: async (sessionId: string, checkType: string, status: string, details?: string): Promise<SystemCheckResult> => {
    return api.post<SystemCheckResult>(`/assessment/session/${sessionId}/system-check`, { checkType, status, details });
  },

  completeSystemCheck: async (sessionId: string): Promise<{ sessionId: string; status: string }> => {
    return api.post<{ sessionId: string; status: string }>(`/assessment/session/${sessionId}/system-check/complete`);
  },

  startAssessment: async (sessionId: string, questionIds: string[]): Promise<{ sessionId: string; status: string; startedAt: string; expiresAt: string }> => {
    return api.post<{ sessionId: string; status: string; startedAt: string; expiresAt: string }>(`/assessment/session/${sessionId}/start`, { questionIds });
  },

  submitAnswer: async (sessionId: string, questionId: string, selectedOptionId?: string, answerText?: string, codeAnswer?: string, timeSpentSeconds = 0, markedForReview = false): Promise<{ answerId: string; updatedAt: string }> => {
    return api.post<{ answerId: string; updatedAt: string }>(`/assessment/session/${sessionId}/answer`, { questionId, selectedOptionId, answerText, codeAnswer, timeSpentSeconds, markedForReview });
  },

  getRemainingTime: async (sessionId: string): Promise<RemainingTime> => {
    return api.get<RemainingTime>(`/assessment/session/${sessionId}/time`);
  },

  sendHeartbeat: async (sessionId: string): Promise<void> => {
    await api.post(`/assessment/session/${sessionId}/heartbeat`);
  },

  submitAssessment: async (sessionId: string): Promise<AssessmentResult> => {
    return api.post<AssessmentResult>(`/assessment/session/${sessionId}/submit`);
  },

  getResults: async (sessionId: string): Promise<AssessmentResult> => {
    return api.get<AssessmentResult>(`/assessment/session/${sessionId}/results`);
  },

  getCompanyResults: async (sessionId: string): Promise<AssessmentResult> => {
    return api.get<AssessmentResult>(`/assessment/session/${sessionId}/results/company`);
  },

  terminateSession: async (sessionId: string, reason: string): Promise<{ sessionId: string; status: string }> => {
    return api.post<{ sessionId: string; status: string }>(`/assessment/session/${sessionId}/terminate`, { reason });
  },

  reportProctoringEvent: async (sessionId: string, eventType: string, severity: string, title: string, description?: string, metadata?: string, confidence?: number): Promise<ProctoringEvent> => {
    return api.post<ProctoringEvent>('/proctoring/event', { sessionId, eventType, severity, title, description, metadata, confidence });
  },

  reportFocusLost: async (sessionId: string): Promise<void> => {
    await api.post('/proctoring/event/focus-lost', { sessionId });
  },

  reportFullscreenExit: async (sessionId: string): Promise<void> => {
    await api.post('/proctoring/event/fullscreen-exit', { sessionId });
  },

  reportFaceNotDetected: async (sessionId: string): Promise<void> => {
    await api.post('/proctoring/event/face-not-detected', { sessionId });
  },

  reportMultipleFaces: async (sessionId: string, faceCount: number): Promise<void> => {
    await api.post('/proctoring/event/multiple-faces', { sessionId, faceCount });
  },

  reportCameraDisconnected: async (sessionId: string): Promise<void> => {
    await api.post('/proctoring/event/camera-disconnected', { sessionId });
  },

  reportScreenCaptureStopped: async (sessionId: string): Promise<void> => {
    await api.post('/proctoring/event/screen-capture-stopped', { sessionId });
  },

  reportSuspiciousActivity: async (sessionId: string, description: string): Promise<void> => {
    await api.post('/proctoring/event/suspicious', { sessionId, description });
  },

  reportConnectionLost: async (sessionId: string): Promise<void> => {
    await api.post('/proctoring/event/connection-lost', { sessionId });
  },

  getProctoringEvents: async (sessionId: string): Promise<ProctoringEvent[]> => {
    return api.get<ProctoringEvent[]>(`/proctoring/session/${sessionId}/events`);
  },

  getProctoringReport: async (sessionId: string): Promise<ProctoringReport> => {
    return api.get<ProctoringReport>(`/proctoring/session/${sessionId}/report`);
  },

  getMySessions: async (): Promise<AssessmentSession[]> => {
    return api.get<AssessmentSession[]>('/assessment/my-sessions');
  },

  createPolicy: async (policy: Partial<AssessmentPolicy>): Promise<AssessmentPolicy> => {
    return api.post<AssessmentPolicy>('/assessment-policies', policy);
  },

  updatePolicy: async (id: string, updates: Partial<AssessmentPolicy>): Promise<AssessmentPolicy> => {
    return api.put<AssessmentPolicy>(`/assessment-policies/${id}`, updates);
  },

  getMyPolicies: async (): Promise<AssessmentPolicy[]> => {
    return api.get<AssessmentPolicy[]>('/assessment-policies');
  },
};
