export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  timestamp: string;
  traceId?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; message: string }>;
  };
  timestamp: string;
  traceId?: string;
}

export type UserRole = 'STUDENT' | 'COMPANY' | 'INSTITUTION' | 'ADMIN';

export type AccountStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | 'INCOMPLETE' | 'COMPLETED' | 'PENDING_INSTITUTION_VERIFICATION' | 'PENDING_COMPANY_VERIFICATION' | 'REJECTED';

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: AccountStatus;
  profileStatus: AccountStatus;
  emailVerified: boolean;
}

export type SkillProficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type PlacementPreference = 'PLACEMENT_WILLING' | 'PLACEMENT_NOT_WILLING';

export type WorkType = 'ON_SITE' | 'HYBRID' | 'REMOTE' | 'ANY';

export interface ProfileCompletion {
  percentage: number;
  completed: boolean;
}
