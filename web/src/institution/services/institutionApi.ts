import { api } from '../../services/api/client';
import type { InstitutionStudent, InstitutionRating, PlacementDrive, RecruitmentApplication, NotificationItem } from '../types/institution';

export const institutionApi = {
  getStudents: (status?: string) => {
    const q = status ? `?status=${status}` : '';
    return api.get<InstitutionStudent[]>(`/institution/students${q}`);
  },
  addStudent: (studentId: string, department?: string, batch?: string) =>
    api.post<InstitutionStudent>('/institution/students', { studentId, department, batch }),
  updatePlacementStatus: (studentId: string, status: string) =>
    api.put<InstitutionStudent>(`/institution/students/${studentId}/status`, { status }),
  getMetrics: () => api.get<Record<string, unknown>>('/institution/metrics'),
  calculateRating: () => api.post<InstitutionRating>('/institution/rating/calculate'),
  getRating: () => api.get<InstitutionRating>('/institution/rating'),
  getDrives: () => api.get<PlacementDrive[]>('/institution/drives'),
  approveDrive: (driveId: string) => api.post<PlacementDrive>(`/institution/drives/${driveId}/approve`),
};

export const followApi = {
  follow: (targetId: string, type: string) => api.post('/follows', { targetId, type }),
  unfollow: (targetId: string, type: string) => api.delete('/follows', { body: JSON.stringify({ targetId, type }) }),
  getFollowing: () => api.get('/follows/following'),
  getFollowers: () => api.get('/follows/followers'),
  checkFollow: (targetId: string, type: string) => api.get<boolean>(`/follows/check?targetId=${targetId}&type=${type}`),
};

export const notificationApi = {
  getNotifications: () => api.get<NotificationItem[]>('/notifications'),
  getUnread: () => api.get<NotificationItem[]>('/notifications/unread'),
  getUnreadCount: () => api.get<number>('/notifications/unread/count'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const recruitmentApi = {
  getMyApplications: () => api.get<RecruitmentApplication[]>('/recruitment/my-applications'),
  getApplications: (opportunityId: string) => api.get<RecruitmentApplication[]>(`/recruitment/opportunity/${opportunityId}/applications`),
  updateStatus: (applicationId: string, status: string, notes?: string) =>
    api.put(`/recruitment/${applicationId}/status`, { status, notes }),
  withdraw: (applicationId: string) => api.post(`/recruitment/${applicationId}/withdraw`),
  getPipeline: (opportunityId: string) => api.get<Record<string, number>>(`/recruitment/opportunity/${opportunityId}/pipeline`),
};
