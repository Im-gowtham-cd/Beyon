export interface SkillIntelligence {
  id: string;
  studentId: string;
  skillId: string;
  skillName?: string;
  proficiencyLevel: string;
  confidenceScore: number;
  evidenceCount: number;
  totalQuestionsSolved: number;
  accuracy: number;
  assessmentCount: number;
  certificationCount: number;
  projectCount: number;
  practiceCount: number;
  improvementTrend: string;
  verified: boolean;
}

export interface CareerPath {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  requiredSkills: string;
  optionalSkills?: string;
  typicalEducation?: string;
  salaryRange?: string;
  growthOutlook?: string;
}

export interface CareerPathSkill {
  skillId: string;
  skillName: string;
  required: boolean;
  requiredLevel: string;
  currentLevel: string;
  acquired: boolean;
}

export interface MatchingScore {
  studentId: string;
  totalScore: number;
  skillScore: number;
  academicScore: number;
  assessmentScore: number;
  experienceScore: number;
  matchFactors: string;
}

export interface SkillGap {
  skillId: string;
  requiredLevel: string;
  currentLevel: string;
  gapSeverity: string;
  estimatedEffortHours: number;
}

export interface CareerReadiness {
  readinessScore: number;
  skillsAcquired: number;
  skillsTotal: number;
  strengths: { skillId: string; level: string }[];
  gaps: { skillId: string; currentLevel: string; requiredLevel: string }[];
}

export interface InterviewRound {
  id: string;
  opportunityId: string;
  name: string;
  roundType: string;
  sortOrder: number;
  durationMinutes: number;
  maxScore: number;
  description?: string;
  isEliminative: boolean;
}

export interface InstitutionAnalytics {
  institutionId: string;
  totalStudents: number;
  placementSeeking: number;
  placed: number;
  placementRate: number;
  averagePackage: number;
  highestPackage: number;
  tier1Count: number;
  tier2Count: number;
  companiesVisited: number;
  departmentStats?: string;
  skillDemand?: string;
}

export interface CompanyAnalytics {
  totalApplications: number;
  totalAssessments: number;
  totalShortlisted: number;
  totalInterviews: number;
  totalSelected: number;
  conversionRate: number;
  avgAssessmentScore: number;
  avgTimeToHireDays: number;
}

export interface CollaborationProgram {
  id: string;
  hostUserId: string;
  hostType: string;
  programType: string;
  title: string;
  description?: string;
  topic?: string;
  startDate?: string;
  endDate?: string;
  maxParticipants?: number;
  currentParticipants: number;
  status: string;
  location?: string;
  certificateProvided: boolean;
}
