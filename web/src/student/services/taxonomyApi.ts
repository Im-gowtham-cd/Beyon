import { api } from '../../services/api/client';
import type {
  SkillCategory, TaxonomySkill, SkillTopic, SkillSubtopic,
  SkillRelationship, StudentLearningTopic, StudentSkillProgress
} from '../types/taxonomy';

export const taxonomyApi = {
  getCategories: () => api.get<SkillCategory[]>('/taxonomy/categories'),
  getCategory: (slug: string) => api.get<SkillCategory>(`/taxonomy/categories/${slug}`),

  getSkills: (params?: { categoryId?: string; search?: string; limit?: number }) => {
    const queryParts: string[] = [];
    if (params?.categoryId) queryParts.push(`categoryId=${params.categoryId}`);
    if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params?.limit) queryParts.push(`limit=${params.limit}`);
    const qs = queryParts.length ? `?${queryParts.join('&')}` : '';
    return api.get<TaxonomySkill[]>(`/taxonomy/skills${qs}`);
  },
  getSkill: (slug: string) => api.get<TaxonomySkill>(`/taxonomy/skills/${slug}`),
  getTopics: (skillSlug: string) => api.get<SkillTopic[]>(`/taxonomy/skills/${skillSlug}/topics`),
  getTopic: (skillSlug: string, topicSlug: string) =>
    api.get<SkillTopic>(`/taxonomy/skills/${skillSlug}/topics/${topicSlug}`),
  getSubtopics: (skillSlug: string, topicSlug: string) =>
    api.get<SkillSubtopic[]>(`/taxonomy/skills/${skillSlug}/topics/${topicSlug}/subtopics`),
  getRelatedSkills: (slug: string) => api.get<SkillRelationship[]>(`/taxonomy/skills/${slug}/related`),
};

export const studentLearningApi = {
  getTopics: () => api.get<StudentLearningTopic[]>('/student/learning'),
  addTopic: (topicId: string) => api.post<StudentLearningTopic>('/student/learning', { topicId }),
  updateStatus: (id: string, status: string) =>
    api.put<StudentLearningTopic>(`/student/learning/${id}/status`, { status }),
  removeTopic: (id: string) => api.delete<void>(`/student/learning/${id}`),
  getProgress: () => api.get<StudentSkillProgress[]>('/student/learning/progress'),
};
