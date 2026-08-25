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

export type AccountStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: AccountStatus;
  emailVerified: boolean;
}
