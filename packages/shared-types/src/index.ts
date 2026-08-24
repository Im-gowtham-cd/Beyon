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
