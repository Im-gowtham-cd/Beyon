export interface SocialPost {
  id: string;
  authorId: string;
  authorType: string;
  postType: string;
  title?: string;
  content: string;
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
