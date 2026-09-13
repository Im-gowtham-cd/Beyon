export type UserRole =
  | 'PLATFORM_ADMIN' | 'VERIFICATION_ADMIN' | 'CONTENT_ADMIN' | 'QUESTION_SETTER' | 'MODERATION_ADMIN' | 'ANALYTICS_ADMIN' | 'SUPER_ADMIN' | 'ADMIN' | 'INSTITUTION_MANAGER'
  | 'INSTITUTION_ADMIN' | 'INSTITUTION_PLACEMENT_OFFICER' | 'INSTITUTION_FACULTY' | 'INSTITUTION_COORDINATOR' | 'INSTITUTION_VIEWER' | 'INSTITUTION'
  | 'PRINCIPAL' | 'PLACEMENT_COORDINATOR' | 'DEPARTMENT_PLACEMENT_INCHARGE'
  | 'COMPANY_ADMIN' | 'COMPANY_RECRUITER' | 'COMPANY_HR' | 'COMPANY_HIRING_MANAGER' | 'COMPANY_INTERVIEWER' | 'COMPANY_LEARNING_MANAGER' | 'COMPANY'
  | 'STUDENT';

export type RoleTier = 'SUPER_ADMIN' | 'INSTITUTION' | 'COMPANY' | 'STUDENT';

export function getRoleTier(role?: UserRole | string): RoleTier {
  if (!role) return 'STUDENT';
  const r = role.toUpperCase();
  if (
    r === 'SUPER_ADMIN' ||
    r === 'ADMIN' ||
    r === 'PLATFORM_ADMIN' ||
    r === 'VERIFICATION_ADMIN' ||
    r === 'CONTENT_ADMIN' ||
    r === 'QUESTION_SETTER' ||
    r === 'MODERATION_ADMIN' ||
    r === 'ANALYTICS_ADMIN' ||
    r === 'INSTITUTION_MANAGER'
  ) {
    return 'SUPER_ADMIN';
  }
  if (
    r === 'INSTITUTION' ||
    r.startsWith('INSTITUTION_') ||
    r === 'PRINCIPAL' ||
    r === 'PLACEMENT_COORDINATOR' ||
    r === 'DEPARTMENT_PLACEMENT_INCHARGE'
  ) {
    return 'INSTITUTION';
  }
  if (r === 'COMPANY' || r.startsWith('COMPANY_')) {
    return 'COMPANY';
  }
  return 'STUDENT';
}

export function getRoleDashboardPath(role?: UserRole | string, tier?: RoleTier): string {
  const r = (role || '').toUpperCase();
  if (r === 'CONTENT_ADMIN') return '/admin/questions';
  if (r === 'QUESTION_SETTER') return '/admin/questions';
  if (r === 'VERIFICATION_ADMIN') return '/admin/institutions';
  if (r === 'MODERATION_ADMIN') return '/admin/moderation';
  if (r === 'ANALYTICS_ADMIN') return '/admin/reports';
  if (r === 'INSTITUTION_MANAGER') return '/institution-manager/onboard';
  if (r === 'PRINCIPAL' || r === 'PLACEMENT_COORDINATOR' || r === 'DEPARTMENT_PLACEMENT_INCHARGE') {
    return '/institution/hierarchy';
  }

  const effectiveTier = tier || getRoleTier(role);
  switch (effectiveTier) {
    case 'SUPER_ADMIN':
      return '/admin/home';
    case 'INSTITUTION':
      return '/institution/home';
    case 'COMPANY':
      return '/company/home';
    case 'STUDENT':
    default:
      return '/student/home';
  }
}

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
  mustChangePassword?: boolean;
  hasCompletedAssessment?: boolean;
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
  cin?: string;
  aicteCode?: string;
  organizationName?: string;
  website?: string;
  representativeName?: string;
  state?: string;
  city?: string;
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

