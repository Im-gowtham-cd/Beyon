export interface FeedbackReport {
  id: string;
  reportNumber: number;
  userId: string;
  userRole: string;
  reportType: string;
  category: string;
  title: string;
  description: string;
  userPriority: string;
  systemSeverity: string;
  status: string;
  assignedTo?: string;
  applicationVersion?: string;
  page?: string;
  browserInfo?: string;
  osInfo?: string;
  screenSize?: string;
  requestId?: string;
  desktopAppVersion?: string;
  assessmentSessionId?: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface FeedbackAttachment {
  id: string;
  reportId: string;
  fileName: string;
  fileType?: string;
  fileSize: number;
  storagePath: string;
  uploadedBy: string;
  createdAt: string;
}

export interface FeedbackStatusHistory {
  id: string;
  reportId: string;
  oldStatus?: string;
  newStatus: string;
  changedBy: string;
  note?: string;
  createdAt: string;
}

export interface FeedbackInternalNote {
  id: string;
  reportId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface FeedbackUserComment {
  id: string;
  reportId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface FeedbackStats {
  total: number;
  submitted: number;
  underReview: number;
  investigating: number;
  resolved: number;
  closed: number;
  critical: number;
  major: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  byRole: Record<string, number>;
  byVersion: Record<string, number>;
}
