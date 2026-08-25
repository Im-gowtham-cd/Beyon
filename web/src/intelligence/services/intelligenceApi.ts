import { api } from '../../services/api/client';
import type { SkillIntelligence, CareerPath, MatchingScore, SkillGap, CareerReadiness, InstitutionAnalytics, CompanyAnalytics, CollaborationProgram } from '../types/intelligence';

export const intelligenceApi = {
  getMySkillProfile: async (): Promise<SkillIntelligence[]> => api.get('/student/skills'),
  evaluateSession: async (sessionId: string): Promise<any[]> => api.post(`/evaluation/session/${sessionId}/evaluate`),
  updateSkillIntelligence: async (skillId: string): Promise<void> => { await api.post('/evaluation/skill-intelligence/update', { skillId }); },

  calculateMatch: async (opportunityId: string, requiredSkills: string[], minCgpa?: number): Promise<MatchingScore> => api.post('/matching/calculate', { opportunityId, requiredSkills, minCgpa }),
  getRankedCandidates: async (opportunityId: string): Promise<MatchingScore[]> => api.get(`/matching/opportunity/${opportunityId}/ranked`),
  getCareerReadiness: async (careerPathId: string): Promise<CareerReadiness> => api.get(`/matching/career-readiness?careerPathId=${careerPathId}`),
  getSkillGaps: async (careerPathId: string): Promise<SkillGap[]> => api.get(`/matching/skill-gaps?careerPathId=${careerPathId}`),

  getAllCareerPaths: async (): Promise<CareerPath[]> => api.get('/career-paths'),
  getCareerPath: async (slug: string): Promise<CareerPath> => api.get(`/career-paths/${slug}`),
  startCareerPath: async (pathId: string): Promise<any> => api.post(`/career-paths/${pathId}/start`),
  getMyCareerPaths: async (): Promise<any[]> => api.get('/career-paths/my'),
  getCareerPathDetail: async (pathId: string): Promise<any> => api.get(`/career-paths/${pathId}/detail`),

  getInterviewRounds: async (opportunityId: string): Promise<any[]> => api.get(`/interviews/rounds/opportunity/${opportunityId}`),
  createInterviewRound: async (round: any): Promise<any> => api.post('/interviews/rounds', round),
  scheduleInterview: async (schedule: any): Promise<any> => api.post('/interviews/schedule', schedule),
  getApplicationInterviews: async (applicationId: string): Promise<any[]> => api.get(`/interviews/application/${applicationId}`),
  submitScorecard: async (scorecard: any): Promise<any> => api.post('/interviews/scorecard', scorecard),
  getInterviewSummary: async (applicationId: string): Promise<any> => api.get(`/interviews/application/${applicationId}/summary`),

  getInstitutionAnalytics: async (): Promise<InstitutionAnalytics> => api.get('/analytics/institution'),
  generateInstitutionAnalytics: async (): Promise<InstitutionAnalytics> => api.post('/analytics/institution/generate'),
  getCompanyAnalytics: async (): Promise<CompanyAnalytics> => api.get('/analytics/company'),
  generateCompanyAnalytics: async (): Promise<CompanyAnalytics> => api.post('/analytics/company/generate'),
  getSkillDemand: async (): Promise<any> => api.get('/analytics/skill-demand'),

  getPublishedPrograms: async (): Promise<CollaborationProgram[]> => api.get('/collaboration/programs'),
  createProgram: async (program: Partial<CollaborationProgram>): Promise<CollaborationProgram> => api.post('/collaboration/programs', program),
  registerForProgram: async (programId: string): Promise<any> => api.post(`/collaboration/programs/${programId}/register`),
  getMyRegistrations: async (): Promise<any[]> => api.get('/collaboration/registrations/my'),
};
