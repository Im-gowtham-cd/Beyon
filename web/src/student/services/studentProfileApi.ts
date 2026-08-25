import { api } from '../../services/api/client';
import type {
  StudentProfile, StudentSkill, StudentProject, StudentCertification,
  StudentAchievement, StudentLink, StudentLearningSkill, StudentCareerPreferences,
  SkillReference
} from '../types/studentProfile';

export const studentProfileApi = {
  getProfile: () => api.get<StudentProfile>('/student/profile'),
  updateProfile: (data: Record<string, unknown>) => api.put<StudentProfile>('/student/profile', data),
  getCompletion: () => api.get<number>('/student/profile/completion'),

  getSkills: () => api.get<StudentSkill[]>('/student/skills'),
  addSkill: (data: { skillName: string; category?: string; proficiency?: string }) =>
    api.post<StudentSkill>('/student/skills', data),
  removeSkill: (id: string) => api.delete<void>(`/student/skills/${id}`),

  getProjects: () => api.get<StudentProject[]>('/student/projects'),
  addProject: (data: Record<string, unknown>) => api.post<StudentProject>('/student/projects', data),
  updateProject: (id: string, data: Record<string, unknown>) =>
    api.put<StudentProject>(`/student/projects/${id}`, data),
  removeProject: (id: string) => api.delete<void>(`/student/projects/${id}`),

  getCertifications: () => api.get<StudentCertification[]>('/student/certifications'),
  addCertification: (data: Record<string, unknown>) =>
    api.post<StudentCertification>('/student/certifications', data),
  updateCertification: (id: string, data: Record<string, unknown>) =>
    api.put<StudentCertification>(`/student/certifications/${id}`, data),
  removeCertification: (id: string) => api.delete<void>(`/student/certifications/${id}`),

  getAchievements: () => api.get<StudentAchievement[]>('/student/achievements'),
  addAchievement: (data: Record<string, unknown>) =>
    api.post<StudentAchievement>('/student/achievements', data),
  updateAchievement: (id: string, data: Record<string, unknown>) =>
    api.put<StudentAchievement>(`/student/achievements/${id}`, data),
  removeAchievement: (id: string) => api.delete<void>(`/student/achievements/${id}`),

  getLinks: () => api.get<StudentLink[]>('/student/links'),
  addLink: (data: { platform: string; url: string }) => api.post<StudentLink>('/student/links', data),
  removeLink: (id: string) => api.delete<void>(`/student/links/${id}`),

  getLearningSkills: () => api.get<StudentLearningSkill[]>('/student/learning'),
  addLearningSkill: (data: { skillId?: string; skillName: string }) =>
    api.post<StudentLearningSkill>('/student/learning', data),
  removeLearningSkill: (id: string) => api.delete<void>(`/student/learning/${id}`),

  getCareerPreferences: () => api.get<StudentCareerPreferences>('/student/career-preferences'),
  updateCareerPreferences: (data: Record<string, unknown>) =>
    api.put<StudentCareerPreferences>('/student/career-preferences', data),
};

export const skillsApi = {
  search: (query: string, limit = 20) =>
    api.get<SkillReference[]>(`/skills?search=${encodeURIComponent(query)}&limit=${limit}`),
  getByCategory: (category: string) =>
    api.get<SkillReference[]>(`/skills/category/${category}`),
};
