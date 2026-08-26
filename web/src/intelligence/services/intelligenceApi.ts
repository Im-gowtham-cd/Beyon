import { api } from '../../services/api/client';
import type { SkillIntelligence, CareerPath, MatchingScore, SkillGap, CareerReadiness, InstitutionAnalytics, CompanyAnalytics, CollaborationProgram, LearningProgram, LearningProgramModule, LearningProgramEnrollment, StudentCertificate, GrowthScore, PersonalizedFeedItem } from '../types/intelligence';

export const intelligenceApi = {
  getMySkillProfile: async (): Promise<SkillIntelligence[]> => api.get('/student/skills'),
  evaluateSession: async (sessionId: string): Promise<any[]> => api.post(`/evaluation/session/${sessionId}/evaluate`),
  updateSkillIntelligence: async (skillId: string): Promise<void> => { await api.post('/evaluation/skill-intelligence/update', { skillId }); },

  calculateOldMatch: async (opportunityId: string, requiredSkills: string[], minCgpa?: number): Promise<MatchingScore> => api.post('/matching/calculate', { opportunityId, requiredSkills, minCgpa }),
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

  getLearningPrograms: async (): Promise<LearningProgram[]> => api.get('/learning-programs'),
  getLearningProgram: async (id: string): Promise<LearningProgram> => api.get(`/learning-programs/${id}`),
  getProgramModules: async (programId: string): Promise<LearningProgramModule[]> => api.get(`/learning-programs/${programId}/modules`),
  enrollProgram: async (programId: string): Promise<LearningProgramEnrollment> => api.post(`/learning-programs/${programId}/enroll`),
  getMyEnrollments: async (): Promise<LearningProgramEnrollment[]> => api.get('/learning-programs/my-enrollments'),
  completeModule: async (moduleId: string): Promise<any> => api.post(`/learning-programs/modules/${moduleId}/complete`),

  getMyCertificates: async (): Promise<StudentCertificate[]> => api.get('/certificates/my'),
  verifyCertificate: async (certNumber: string): Promise<StudentCertificate> => api.get(`/certificates/verify/${certNumber}`),

  getGrowthScore: async (): Promise<GrowthScore> => api.get('/growth-intelligence/score'),
  getMyGrowthScore: async (): Promise<GrowthScore> => api.get('/growth-intelligence/my-score'),

  getPersonalizedFeed: async (): Promise<PersonalizedFeedItem[]> => api.get('/feed/personalized'),
  dismissFeedItem: async (itemId: string): Promise<void> => api.post(`/feed/${itemId}/dismiss`),

  // Phase 151-160: Career Intelligence
  getTaxonomyRoots: async (): Promise<any[]> => api.get('/career-intel/taxonomy/roots'),
  getTaxonomyChildren: async (nodeId: string): Promise<any[]> => api.get(`/career-intel/taxonomy/${nodeId}/children`),
  getTaxonomyBySlug: async (slug: string): Promise<any> => api.get(`/career-intel/taxonomy/slug/${slug}`),
  getTaxonomyTree: async (nodeId: string): Promise<any> => api.get(`/career-intel/taxonomy/${nodeId}/tree`),
  searchTaxonomy: async (q: string): Promise<any[]> => api.get(`/career-intel/taxonomy/search?q=${encodeURIComponent(q)}`),

  getMySkillGraph: async (): Promise<any[]> => api.get('/career-intel/skill-graph'),
  buildSkillGraph: async (): Promise<any[]> => api.get('/career-intel/skill-graph/build'),
  getSkillStrengths: async (): Promise<any> => api.get('/career-intel/skill-graph/strengths'),

  analyzeSkillGaps: async (careerPathId: string): Promise<any> => api.get(`/career-intel/skill-gaps/${careerPathId}`),
  getTopGaps: async (limit: number = 5): Promise<any> => api.get(`/career-intel/skill-gaps/weak?limit=${limit}`),

  createAdvisorSession: async (): Promise<any> => api.post('/career-intel/advisor/sessions', {}),
  getMyAdvisorSessions: async (): Promise<any[]> => api.get('/career-intel/advisor/sessions'),
  getAdvisorMessages: async (sessionId: string): Promise<any[]> => api.get(`/career-intel/advisor/sessions/${sessionId}/messages`),
  askAdvisor: async (sessionId: string, question: string): Promise<any> => api.post(`/career-intel/advisor/sessions/${sessionId}/ask`, { question }),

  getChallengeConfig: async (): Promise<any> => api.get('/career-intel/challenge-config'),
  updateChallengeConfig: async (config: any): Promise<any> => api.put('/career-intel/challenge-config', config),
  getChallengeRecommendations: async (): Promise<any> => api.get('/career-intel/challenge-recommendations'),

  getOrCreateAdaptivePath: async (careerPathId: string): Promise<any> => api.post(`/career-intel/adaptive-paths/${careerPathId}`, {}),
  completeAdaptiveStep: async (stepId: string): Promise<any> => api.post(`/career-intel/adaptive-steps/${stepId}/complete`, {}),
  getMyAdaptivePaths: async (): Promise<any[]> => api.get('/career-intel/adaptive-paths'),

  analyzePortfolio: async (): Promise<any> => api.get('/career-intel/portfolio/analyze'),

  calculateMatch: async (opportunityId: string): Promise<any> => api.get(`/career-intel/match/${opportunityId}`),
  getMyMatches: async (): Promise<any[]> => api.get('/career-intel/matches'),

  getCareerDashboard: async (): Promise<any> => api.get('/career-intel/dashboard'),
};
