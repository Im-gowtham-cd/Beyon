import { api } from '../../services/api/client';
import type { RecruitmentApplication, StatusHistory } from '../../institution/types/institution';

export const recruitmentApi = {
  getMyApplications: () => api.get<RecruitmentApplication[]>('/recruitment/my-applications'),
  getApplications: (opportunityId: string) =>
    api.get<RecruitmentApplication[]>(`/recruitment/opportunity/${opportunityId}/applications`),
  updateStatus: (applicationId: string, status: string, notes?: string) =>
    api.put(`/recruitment/${applicationId}/status`, { status, notes }),
  withdraw: (applicationId: string) =>
    api.post(`/recruitment/${applicationId}/withdraw`),
  getPipeline: (opportunityId: string) =>
    api.get<Record<string, number>>(`/recruitment/opportunity/${opportunityId}/pipeline`),
  getHistory: (applicationId: string) =>
    api.get<StatusHistory[]>(`/recruitment/${applicationId}/history`),
};
