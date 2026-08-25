export interface SocialPost {
  id: string;
  authorId: string;
  authorType: string;
  postType: string;
  title?: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  visibility: string;
  isPinned: boolean;
  tags: string;
  createdAt: string;
}

export interface SocialComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  likeCount: number;
  createdAt: string;
}

export interface DiscussionThread {
  id: string;
  categoryId: string;
  authorId: string;
  title: string;
  content: string;
  replyCount: number;
  viewCount: number;
  likeCount: number;
  isPinned: boolean;
  isLocked: boolean;
  solved: boolean;
  lastReplyAt?: string;
  createdAt: string;
}

export interface DiscussionReply {
  id: string;
  threadId: string;
  authorId: string;
  content: string;
  likeCount: number;
  isAcceptedAnswer: boolean;
  createdAt: string;
}

export interface DiscussionCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  threadCount: number;
}

export interface VerifiedAchievement {
  id: string;
  studentId: string;
  achievementType: string;
  title: string;
  description?: string;
  issuingOrganization?: string;
  issueDate?: string;
  credentialUrl?: string;
  verificationStatus: string;
  createdAt: string;
}

export interface ContentResource {
  id: string;
  authorId: string;
  resourceType: string;
  title: string;
  description?: string;
  url?: string;
  difficulty?: string;
  isFree: boolean;
  viewCount: number;
  bookmarkCount: number;
  rating?: number;
  tags: string;
  status: string;
}

export interface SmartNotification {
  id: string;
  userId: string;
  notificationType: string;
  priority: string;
  title: string;
  body?: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface MessageConversation {
  id: string;
  title?: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface UserReputation {
  totalReputation: number;
  answersCount: number;
  acceptedAnswers: number;
  upvotesReceived: number;
  recentEvents: ReputationEvent[];
}

export interface ReputationEvent {
  id: string;
  eventType: string;
  points: number;
  referenceType?: string;
  referenceId?: string;
  createdAt: string;
}

export interface DashboardData {
  unreadNotifications: number;
  reputation?: { total: number; answers: number; accepted: number };
  topSkills: Array<{ skillId: string; confidenceScore: number; proficiency: string; accuracy: number; questionsSolved: number }>;
  skillGaps: Array<{ requiredSkillId: string; severity: string; requiredLevel: string; currentLevel: string }>;
  recommendedOpportunities: Array<{ opportunityId: string; totalScore: number; skillScore: number }>;
  recentDiscussions: Array<{ id: string; title: string; replyCount: number; solved: boolean }>;
  recentPosts: Array<{ id: string; content: string; likeCount: number; commentCount: number }>;
  careerProgress: Array<{ careerPathId: string; readinessScore: number; skillsAcquired: number; skillsTotal: number }>;
}

export interface ProjectVerification {
  id: string;
  projectId: string;
  studentId: string;
  verificationType: string;
  evidenceUrl?: string;
  status: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface UserFeedback {
  id: string;
  userId: string;
  feedbackType: string;
  title: string;
  description: string;
  module?: string;
  severity: string;
  status: string;
  createdAt: string;
}
