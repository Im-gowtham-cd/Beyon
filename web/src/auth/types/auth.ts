export type UserRole = 'STUDENT' | 'INSTITUTION' | 'COMPANY' | 'ADMIN';

export type AccountStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: AccountStatus;
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
  role: Exclude<UserRole, 'ADMIN'>;
}

export interface AuthResponse {
  accessToken: string;
  user: UserInfo;
}
