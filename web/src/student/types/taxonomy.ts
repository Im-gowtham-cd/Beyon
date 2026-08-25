export interface SkillCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  active: boolean;
}

export interface TaxonomySkill {
  id: string;
  name: string;
  slug: string;
  category?: string;
  categoryId?: string;
  description?: string;
  active: boolean;
  topicCount?: number;
}

export interface SkillTopic {
  id: string;
  skillId: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  active: boolean;
  subtopicCount?: number;
}

export interface SkillSubtopic {
  id: string;
  topicId: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  active: boolean;
}

export interface SkillRelationship {
  id: string;
  sourceSkillId: string;
  targetSkillId: string;
  relationshipType: string;
}

export interface StudentLearningTopic {
  id: string;
  studentId: string;
  topicId: string;
  subtopicId?: string;
  status: string;
  startedAt: string;
  updatedAt: string;
}

export interface StudentSkillProgress {
  id: string;
  studentId: string;
  skillId: string;
  topicId?: string;
  subtopicId?: string;
  progressPercentage: number;
  learningStage: string;
  updatedAt: string;
}

export type LearningStatus = 'NOT_STARTED' | 'LEARNING' | 'PRACTICING' | 'ASSESSMENT_READY' | 'MASTERED';

export const LEARNING_STATUS_LABELS: Record<LearningStatus, string> = {
  NOT_STARTED: 'Not Started',
  LEARNING: 'Learning',
  PRACTICING: 'Practicing',
  ASSESSMENT_READY: 'Assessment Ready',
  MASTERED: 'Mastered',
};

export const LEARNING_STATUS_ICONS: Record<LearningStatus, string> = {
  NOT_STARTED: '○',
  LEARNING: '●',
  PRACTICING: '◐',
  ASSESSMENT_READY: '✓',
  MASTERED: '★',
};
