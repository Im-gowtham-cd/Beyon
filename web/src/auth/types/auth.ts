export type UserRole =
  | 'PLATFORM_ADMIN' | 'VERIFICATION_ADMIN' | 'CONTENT_ADMIN' | 'QUESTION_SETTER' | 'MODERATION_ADMIN' | 'ANALYTICS_ADMIN' | 'SUPER_ADMIN' | 'ADMIN'
  | 'INSTITUTION_ADMIN' | 'INSTITUTION_PLACEMENT_OFFICER' | 'INSTITUTION_FACULTY' | 'INSTITUTION_COORDINATOR' | 'INSTITUTION_VIEWER' | 'INSTITUTION'
  | 'COMPANY_ADMIN' | 'COMPANY_RECRUITER' | 'COMPANY_HR' | 'COMPANY_HIRING_MANAGER' | 'COMPANY_INTERVIEWER' | 'COMPANY_LEARNING_MANAGER' | 'COMPANY'
  | 'STUDENT';

export type RoleTier = 'SUPER_ADMIN' | 'INSTITUTION' | 'COMPANY' | 'STUDENT';

export type OnboardingRole = 'STUDENT' | 'INSTITUTION' | 'COMPANY';

export type AccountStatus = 'PENDING_VERIFICATION' | 'PENDING_SUPER_ADMIN_VERIFICATION' | 'PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'INCOMPLETE' | 'COMPLETED' | 'PENDING_INSTITUTION_VERIFICATION' | 'PENDING_COMPANY_VERIFICATION' | 'REJECTED';

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tier?: RoleTier;
  institutionId?: string;
  companyId?: string;
  departmentId?: string;
  status: AccountStatus;
  profileStatus: AccountStatus;
  emailVerified: boolean;
}

export interface AuthState {
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  authenticated: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: OnboardingRole;
}

export interface AuthResponse {
  accessToken: string;
  user: UserInfo;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

