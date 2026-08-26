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

export interface LearningProgram {
  id: string;
  title: string;
  description?: string;
  skillId?: string;
  skillName?: string;
  difficulty: string;
  durationHours: number;
  coinReward: number;
  xpReward: number;
  createdBy: string;
  creatorType: string;
  certificateProvided: boolean;
  status: string;
  moduleCount?: number;
  enrolledCount?: number;
}

export interface LearningProgramModule {
  id: string;
  programId: string;
  title: string;
  description?: string;
  sortOrder: number;
  estimatedMinutes: number;
  resourceUrl?: string;
  contentType: string;
}

export interface LearningProgramEnrollment {
  id: string;
  programId: string;
  studentId: string;
  status: string;
  progressPercent: number;
  enrolledAt: string;
  completedAt?: string;
}

export interface StudentCertificate {
  id: string;
  studentId: string;
  certificateNumber: string;
  certificateType: string;
  title: string;
  issuerName: string;
  issuerType: string;
  skillsCovered?: string;
  score?: number;
  issuedAt: string;
  expiresAt?: string;
  verificationUrl?: string;
}

export interface GrowthScore {
  overallScore: number;
  skillsScore: number;
  consistencyScore: number;
  assessmentScore: number;
  certificationScore: number;
  projectScore: number;
  careerReadinessScore: number;
  readinessLevel: string;
  strengths: { skillName: string; level: string }[];
  improvements: { skillName: string; currentLevel: string; targetLevel: string }[];
}

export interface PersonalizedFeedItem {
  id: string;
  feedType: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionUrl?: string;
  coinReward?: number;
  xpReward?: number;
  priority: number;
  createdAt: string;
}
