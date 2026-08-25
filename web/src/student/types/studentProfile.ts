export interface StudentProfile {
  id: string;
  userId: string;
  username?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
  state?: string;
  city?: string;
  institution?: string;
  registrationNumber?: string;
  degree?: string;
  department?: string;
  academicYear?: string;
  graduationYear?: number;
  cgpa?: number;
  placementPreference?: string;
  preferredLocations?: string;
  aboutMe?: string;
  resumeUrl?: string;
  profilePhotoUrl?: string;
  completionPct: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentSkill {
  id: string;
  userId: string;
  skillName: string;
  category?: string;
  proficiency?: string;
  source: string;
  verified: boolean;
  createdAt: string;
}

export interface StudentProject {
  id: string;
  userId: string;
  name: string;
  description?: string;
  role?: string;
  technologies?: string;
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentCertification {
  id: string;
  userId: string;
  name: string;
  issuingOrg?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  certificateUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAchievement {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  organization?: string;
  achievementDate?: string;
  url?: string;
  proofUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentLink {
  id: string;
  userId: string;
  platform: string;
  url: string;
  createdAt: string;
}

export interface StudentLearningSkill {
  id: string;
  userId: string;
  skillId?: string;
  skillName: string;
  status: string;
  startedAt: string;
  createdAt: string;
}

export interface StudentCareerPreferences {
  id?: string;
  userId?: string;
  preferredRoles?: string;
  preferredIndustries?: string;
  preferredWorkType?: string;
  preferredLocations?: string;
  careerGoal?: string;
}

export interface SkillReference {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  active: boolean;
}

export type SkillCategory =
  | 'PROGRAMMING' | 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'CLOUD'
  | 'DEVOPS' | 'AI_ML' | 'DATA' | 'CYBERSECURITY' | 'MOBILE'
  | 'UI_UX' | 'TOOLS' | 'SOFT_SKILLS';

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  PROGRAMMING: 'Programming',
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATABASE: 'Database',
  CLOUD: 'Cloud',
  DEVOPS: 'DevOps',
  AI_ML: 'AI & ML',
  DATA: 'Data',
  CYBERSECURITY: 'Cybersecurity',
  MOBILE: 'Mobile',
  UI_UX: 'UI/UX',
  TOOLS: 'Tools',
  SOFT_SKILLS: 'Soft Skills',
};

export const ACHIEVEMENT_CATEGORIES = [
  'HACKATHON', 'ACADEMIC', 'COMPETITION', 'RESEARCH',
  'PUBLICATION', 'LEADERSHIP', 'OPEN_SOURCE', 'OTHER'
] as const;

export const LINK_PLATFORMS = [
  'GitHub', 'LinkedIn', 'Portfolio', 'LeetCode', 'HackerRank',
  'CodeChef', 'Kaggle', 'Twitter', 'Medium', 'YouTube'
] as const;

export const JOB_ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'DevOps Engineer', 'Data Scientist',
  'Machine Learning Engineer', 'Cloud Engineer', 'Mobile Developer',
  'QA Engineer', 'System Administrator', 'Product Manager',
  'UI/UX Designer', 'Data Analyst', 'Cybersecurity Analyst'
] as const;

export const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
  'Manufacturing', 'Telecommunications', 'Automotive', 'Media',
  'Consulting', 'Government', 'Non-profit'
] as const;
