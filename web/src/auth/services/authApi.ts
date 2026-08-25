import { api } from '../../services/api/client';
import type { UserInfo, LoginPayload, RegisterPayload } from '../types/auth';

export const authApi = {
  login: (data: LoginPayload) =>
    api.post<{ accessToken: string; user: UserInfo }>('/auth/login', data),

  register: (data: RegisterPayload) =>
    api.post<UserInfo>('/auth/register', data),

  getMe: () =>
    api.get<UserInfo>('/auth/me'),

  verifyEmail: (token: string) =>
    api.post<void>('/auth/verify-email', { token }),

  resendVerification: (email: string) =>
    api.post<void>('/auth/resend-verification', { email }),

  forgotPassword: (email: string) =>
    api.post<void>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string, confirmPassword: string) =>
    api.post<void>('/auth/reset-password', { token, password, confirmPassword }),
};
