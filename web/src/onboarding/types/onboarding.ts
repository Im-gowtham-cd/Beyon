export type OnboardingStep = 'account' | 'role' | 'profile' | 'review' | 'complete';

export interface OnboardingState {
  step: OnboardingStep;
  role: 'STUDENT' | 'INSTITUTION' | 'COMPANY' | null;
  account: { name: string; email: string };
  completed: boolean;
}

export interface Education10th {
  schoolName: string;
  board: string;
  passingYear: string;
  percentageOrCgpa: string;
}

export interface Education12th {
  schoolOrCollegeName: string;
  board: string;
  stream: string;
  passingYear: string;
  percentageOrCgpa: string;
}

export interface EducationDiploma {
  instituteName: string;
  branch: string;
  passingYear: string;
  percentageOrCgpa: string;
}

export interface InternshipEntry {
  companyName: string;
  role: string;
  description: string;
  duration: string;
  stipend: string;
  workType: 'REMOTE' | 'ONSITE' | 'HYBRID';
  status: 'COMPLETED' | 'ONGOING';
  certificateProofUrl?: string;
}

export interface InstitutionOption {
  id: string;
  userId: string;
  name: string;
  code: string;
  type: string;
  city: string;
  state: string;
  grade?: string;
  accreditations?: string;
  affiliatedUniversity?: string;
  logoUrl?: string;
  website?: string;
}

export interface AicteInstitutionInfo {
  aicteId: string;
  instituteName: string;
  region: string;
  state: string;
  district: string;
  city: string;
  userGroup?: string;
}

export interface StudentFormData {
  institutionId: string;
  institution: string;
  aicteCode: string;
  institutionVerified: boolean;
  selectedInstitutionDetails: InstitutionOption | null;
  institutionDetails?: AicteInstitutionInfo | null;
  firstName: string;
  middleName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  state: string;
  city: string;
  registrationNumber: string;
  studentIdCardUrl: string;
  degree: string;
  department: string;
  academicYear: string;
  cgpa: string;
  education10th: Education10th;
  has12th: boolean;
  education12th: Education12th;
  hasDiploma: boolean;
  educationDiploma: EducationDiploma;
  hasInternship: boolean;
  internships: InternshipEntry[];
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
  autonomousStatus: string;
  accreditations: string[];
  accreditationGrade: string;
  nirfRank: string;
  establishedYear: string;
  totalStudents: string;
  principalName: string;
  principalEmail: string;
  principalPhone: string;
  placementOfficerName: string;
  placementOfficerEmail: string;
  placementOfficerPhone: string;
  placementCellEmail: string;
  placementCellPhone: string;
  departmentsOffered: string[];
  placementRate: string;
  averagePackage: string;
  highestPackage: string;
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
  institutionId: '',
  institution: '',
  aicteCode: '',
  institutionVerified: false,
  selectedInstitutionDetails: null,
  firstName: '',
  middleName: '',
  lastName: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  country: 'India',
  state: '',
  city: '',
  registrationNumber: '',
  studentIdCardUrl: '',
  degree: 'B.Tech',
  department: 'Computer Science and Engineering',
  academicYear: '3rd Year',
  cgpa: '',
  education10th: { schoolName: '', board: 'CBSE', passingYear: '2020', percentageOrCgpa: '' },
  has12th: true,
  education12th: { schoolOrCollegeName: '', board: 'CBSE', stream: 'Science (PCM)', passingYear: '2022', percentageOrCgpa: '' },
  hasDiploma: false,
  educationDiploma: { instituteName: '', branch: '', passingYear: '', percentageOrCgpa: '' },
  hasInternship: false,
  internships: [],
  placementPreference: 'PLACEMENT_WILLING',
  preferredJobRoles: ['Software Engineer', 'Full Stack Developer'],
  preferredIndustries: ['Information Technology', 'Software Development'],
  preferredWorkType: 'HYBRID',
  aboutMe: '',
  profilePhotoUrl: '',
  resumeUrl: '',
  skills: [],
  certifications: [],
  projects: [],
  links: [],
};

export const EMPTY_INSTITUTION_FORM: InstitutionFormData = {
  institutionName: '', institutionType: '', institutionCode: '', officialEmail: '',
  phone: '', website: '', country: '', state: '', city: '', address: '',
  postalCode: '', affiliatedUniversity: '', autonomousStatus: 'Autonomous', accreditations: [], accreditationGrade: '',
  nirfRank: '', establishedYear: '', totalStudents: '', principalName: '', principalEmail: '',
  principalPhone: '', placementOfficerName: '', placementOfficerEmail: '', placementOfficerPhone: '',
  placementCellEmail: '', placementCellPhone: '', departmentsOffered: ['Computer Science and Engineering', 'Information Technology', 'AI & Data Science'],
  placementRate: '', averagePackage: '', highestPackage: '',
  placementWillingCount: '', placementNotWillingCount: '',
  verificationDocUrl: '', logoUrl: '', placementHistory: [], representatives: [],
};

export const EMPTY_COMPANY_FORM: CompanyFormData = {
  companyName: '', logoUrl: '', companyType: '', industry: '', website: '',
  officialEmail: '', phone: '', country: '', state: '', city: '',
  headquarters: '', companySize: '', foundedYear: '', about: '', linkedin: '',
  verificationDocUrl: '', hiringTypes: [], preferredLevels: [],
  recruitmentRegions: [], skills: [], representatives: [],
};

