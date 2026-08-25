export type OnboardingStep = 'account' | 'role' | 'profile' | 'review' | 'complete';

export interface OnboardingState {
  step: OnboardingStep;
  role: 'STUDENT' | 'INSTITUTION' | 'COMPANY' | null;
  account: { name: string; email: string };
  completed: boolean;
}

export interface StudentFormData {
  phone: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  state: string;
  city: string;
  institution: string;
  registrationNumber: string;
  degree: string;
  department: string;
  academicYear: string;
  cgpa: string;
  placementPreference: 'PLACEMENT_WILLING' | 'PLACEMENT_NOT_WILLING' | '';
  preferredJobRoles: string[];
  preferredIndustries: string[];
  preferredWorkType: 'ON_SITE' | 'HYBRID' | 'REMOTE' | 'ANY' | '';
  aboutMe: string;
  profilePhotoUrl: string;
  resumeUrl: string;
  skills: SkillEntry[];
  certifications: CertificationEntry[];
  projects: ProjectEntry[];
  links: LinkEntry[];
}

export interface SkillEntry {
  skillName: string;
  category: string;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}

export interface CertificationEntry {
  name: string;
  issuingOrg: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  role: string;
  technologies: string;
  githubUrl: string;
  liveUrl: string;
  startDate: string;
  endDate: string;
}

export interface LinkEntry {
  platform: string;
  url: string;
}

export interface InstitutionFormData {
  institutionName: string;
  institutionType: string;
  institutionCode: string;
  officialEmail: string;
  phone: string;
  website: string;
  country: string;
  state: string;
  city: string;
  address: string;
  postalCode: string;
  affiliatedUniversity: string;
  accreditations: string[];
  accreditationGrade: string;
  establishedYear: string;
  placementRate: string;
  averagePackage: string;
  highestPackage: string;
  totalStudents: string;
  placementWillingCount: string;
  placementNotWillingCount: string;
  verificationDocUrl: string;
  logoUrl: string;
  placementHistory: PlacementHistoryEntry[];
  representatives: InstitutionRepresentativeEntry[];
}

export interface PlacementHistoryEntry {
  academicYear: string;
  studentsPlaced: string;
  placementPercentage: string;
  averagePackage: string;
  highestPackage: string;
}

export interface InstitutionRepresentativeEntry {
  name: string;
  designation: string;
  email: string;
  phone: string;
  department: string;
}

export interface CompanyFormData {
  companyName: string;
  logoUrl: string;
  companyType: string;
  industry: string;
  website: string;
  officialEmail: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  headquarters: string;
  companySize: string;
  foundedYear: string;
  about: string;
  linkedin: string;
  verificationDocUrl: string;
  hiringTypes: string[];
  preferredLevels: string[];
  recruitmentRegions: string[];
  skills: string[];
  representatives: CompanyRepresentativeEntry[];
}

export interface CompanyRepresentativeEntry {
  name: string;
  designation: string;
  email: string;
  phone: string;
}

export const EMPTY_STUDENT_FORM: StudentFormData = {
  phone: '', dateOfBirth: '', gender: '', country: '', state: '', city: '',
  institution: '', registrationNumber: '', degree: '', department: '',
  academicYear: '', cgpa: '', placementPreference: '', preferredJobRoles: [],
  preferredIndustries: [], preferredWorkType: '', aboutMe: '', profilePhotoUrl: '',
  resumeUrl: '', skills: [], certifications: [], projects: [], links: [],
};

export const EMPTY_INSTITUTION_FORM: InstitutionFormData = {
  institutionName: '', institutionType: '', institutionCode: '', officialEmail: '',
  phone: '', website: '', country: '', state: '', city: '', address: '',
  postalCode: '', affiliatedUniversity: '', accreditations: [], accreditationGrade: '',
  establishedYear: '', placementRate: '', averagePackage: '', highestPackage: '',
  totalStudents: '', placementWillingCount: '', placementNotWillingCount: '',
  verificationDocUrl: '', logoUrl: '', placementHistory: [], representatives: [],
};

export const EMPTY_COMPANY_FORM: CompanyFormData = {
  companyName: '', logoUrl: '', companyType: '', industry: '', website: '',
  officialEmail: '', phone: '', country: '', state: '', city: '',
  headquarters: '', companySize: '', foundedYear: '', about: '', linkedin: '',
  verificationDocUrl: '', hiringTypes: [], preferredLevels: [],
  recruitmentRegions: [], skills: [], representatives: [],
};
