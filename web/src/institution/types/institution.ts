export interface InstitutionStudent {
  id: string;
  institutionId: string;
  studentId: string;
  department?: string;
  batch?: string;
  graduationYear?: number;
  placementStatus: string;
  verified: boolean;
}

export interface PlacementRecord {
  id: string;
  studentId: string;
  companyName: string;
  companyTier?: string;
  roleTitle?: string;
  packageLpa?: number;
  placementDate?: string;
  placementType?: string;
  status: string;
}

export interface InstitutionRating {
  overallRating?: number;
  academicScore?: number;
  placementScore?: number;
  salaryScore?: number;
  industryScore?: number;
  skillScore?: number;
  totalStudents?: number;
  studentsPlaced?: number;
  placementPercentage?: number;
  averagePackage?: number;
  highestPackage?: number;
  tier1Count?: number;
  tier2Count?: number;
  companiesVisited?: number;
}

export interface PlacementDrive {
  id: string;
  opportunityId: string;
  institutionId: string;
  companyUserId: string;
  title: string;
  description?: string;
  status: string;
  eligibleStudentCount: number;
  appliedCount: number;
  assessedCount: number;
  shortlistedCount: number;
  selectedCount: number;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  followType: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  notificationType: string;
  referenceType?: string;
  referenceId?: string;
  read: boolean;
  channel: string;
  createdAt: string;
}

export interface RecruitmentApplication {
  id: string;
  studentId: string;
  opportunityId: string;
  status: string;
  assessmentScore?: number;
  coinsSpent: number;
  appliedAt?: string;
}

export interface StatusHistory {
  id: string;
  applicationId: string;
  fromStatus?: string;
  toStatus: string;
  notes?: string;
  createdAt: string;
}
