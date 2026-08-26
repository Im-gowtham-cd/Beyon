import { api } from '../../services/api/client';
import type { FeedbackReport, FeedbackAttachment, FeedbackStatusHistory, FeedbackInternalNote, FeedbackUserComment, FeedbackStats } from '../types/feedback';

export const feedbackApi = {
  submitReport: async (data: {
    reportType: string; category: string; title: string; description: string;
    userPriority?: string; applicationVersion?: string; page?: string;
    browserInfo?: string; osInfo?: string; screenSize?: string; requestId?: string;
    desktopAppVersion?: string; assessmentSessionId?: string;
  }): Promise<FeedbackReport> => api.post('/feedback', data),

  findSimilar: async (title: string): Promise<FeedbackReport[]> => api.get(`/feedback/similar?title=${encodeURIComponent(title)}`),

  getMyReports: async (): Promise<FeedbackReport[]> => api.get('/feedback/me'),

  getReport: async (id: string): Promise<FeedbackReport> => api.get(`/feedback/${id}`),

  addComment: async (id: string, content: string): Promise<void> => { await api.post(`/feedback/${id}/comments`, { content }); },

  getComments: async (id: string): Promise<FeedbackUserComment[]> => api.get(`/feedback/${id}/comments`),

  getStatusHistory: async (id: string): Promise<FeedbackStatusHistory[]> => api.get(`/feedback/${id}/history`),

  getAttachments: async (id: string): Promise<FeedbackAttachment[]> => api.get(`/feedback/${id}/attachments`),

  getStats: async (): Promise<FeedbackStats> => api.get('/feedback/stats'),

  adminGetAll: async (params: { status?: string; category?: string; severity?: string; role?: string; search?: string; page?: number; size?: number }) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.category) query.set('category', params.category);
    if (params.severity) query.set('severity', params.severity);
    if (params.role) query.set('role', params.role);
    if (params.search) query.set('search', params.search);
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 20));
    return api.get(`/feedback/admin/all?${query.toString()}`);
  },

  adminUpdate: async (id: string, data: { status?: string; severity?: string; assignedTo?: string }): Promise<FeedbackReport> => api.patch(`/feedback/${id}`, data),

  adminAddNote: async (id: string, content: string): Promise<void> => { await api.post(`/feedback/${id}/notes`, { content }); },

  adminGetNotes: async (id: string): Promise<FeedbackInternalNote[]> => api.get(`/feedback/${id}/notes`),
};
