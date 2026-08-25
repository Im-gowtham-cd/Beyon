import { api } from '../../services/api/client';
import type { SocialPost, SocialComment, DiscussionThread, DiscussionReply, VerifiedAchievement, ContentResource, SmartNotification, MessageConversation, Message, UserReputation, DashboardData, ProjectVerification } from '../types/community';

export const communityApi = {
  createPost: async (content: string, title?: string, postType = 'TEXT'): Promise<SocialPost> => api.post('/social/posts', { content, title, postType }),
  getFeed: async (page = 0, size = 20): Promise<SocialPost[]> => api.get(`/social/feed?page=${page}&size=${size}`),
  deletePost: async (postId: string): Promise<void> => { await api.delete(`/social/posts/${postId}`); },
  addComment: async (postId: string, content: string): Promise<SocialComment> => api.post(`/social/posts/${postId}/comments`, { content }),
  getComments: async (postId: string): Promise<SocialComment[]> => api.get(`/social/posts/${postId}/comments`),
  toggleLike: async (targetType: string, targetId: string): Promise<{ liked: boolean; likeCount: number }> => api.post('/social/like', { targetType, targetId }),

  createThread: async (categoryId: string, title: string, content: string): Promise<DiscussionThread> => api.post('/discussions/threads', { categoryId, title, content }),
  getThreads: async (categoryId?: string): Promise<DiscussionThread[]> => api.get(`/discussions/threads${categoryId ? `?categoryId=${categoryId}` : ''}`),
  getThread: async (threadId: string): Promise<DiscussionThread> => api.get(`/discussions/threads/${threadId}`),
  addReply: async (threadId: string, content: string): Promise<DiscussionReply> => api.post(`/discussions/threads/${threadId}/replies`, { content }),
  getReplies: async (threadId: string): Promise<DiscussionReply[]> => api.get(`/discussions/threads/${threadId}/replies`),
  markSolved: async (threadId: string): Promise<void> => { await api.post(`/discussions/threads/${threadId}/solve`); },

  submitAchievement: async (achievement: Partial<VerifiedAchievement>): Promise<VerifiedAchievement> => api.post('/achievements', achievement),
  getMyAchievements: async (): Promise<VerifiedAchievement[]> => api.get('/achievements/my'),
  getPendingVerifications: async (): Promise<VerifiedAchievement[]> => api.get('/achievements/pending'),
  verifyAchievement: async (id: string, status: string): Promise<VerifiedAchievement> => api.post(`/achievements/${id}/verify`, { status }),

  getPublishedResources: async (): Promise<ContentResource[]> => api.get('/content'),
  getContentByType: async (type: string): Promise<ContentResource[]> => api.get(`/content/type/${type}`),
  createResource: async (resource: Partial<ContentResource>): Promise<ContentResource> => api.post('/content', resource),

  getDashboard: async (): Promise<DashboardData> => api.get('/dashboard'),
  getNotifications: async (): Promise<SmartNotification[]> => api.get('/dashboard/notifications'),
  getUnreadNotifications: async (): Promise<SmartNotification[]> => api.get('/dashboard/notifications/unread'),
  getUnreadCount: async (): Promise<{ count: number }> => api.get('/dashboard/notifications/unread/count'),
  markNotificationRead: async (id: string): Promise<void> => { await api.post(`/dashboard/notifications/${id}/read`); },
  markAllRead: async (): Promise<{ marked: number }> => api.post('/dashboard/notifications/read-all'),
  getReputation: async (): Promise<UserReputation> => api.get('/dashboard/reputation'),

  getConversations: async (): Promise<MessageConversation[]> => api.get('/messages/conversations'),
  startConversation: async (participantIds: string[], title?: string): Promise<MessageConversation> => api.post('/messages/conversations', { participantIds, title }),
  getMessages: async (conversationId: string): Promise<Message[]> => api.get(`/messages/conversations/${conversationId}/messages`),
  sendMessage: async (conversationId: string, content: string): Promise<Message> => api.post(`/messages/conversations/${conversationId}/messages`, { content }),

  submitProjectVerification: async (projectId: string, verificationType: string, evidenceUrl: string): Promise<ProjectVerification> => api.post('/verifications/project', { projectId, verificationType, evidenceUrl }),
  getProjectVerifications: async (projectId: string): Promise<ProjectVerification[]> => api.get(`/verifications/project/${projectId}`),

  follow: async (targetId: string, targetType: string): Promise<{ following: boolean }> => api.post('/follows', { targetId, targetType }),
  unfollow: async (targetId: string): Promise<void> => { await api.delete(`/follows/${targetId}`); },
  getFollowers: async (userId: string): Promise<string[]> => api.get(`/follows/${userId}/followers`),
  getFollowing: async (userId: string): Promise<string[]> => api.get(`/follows/${userId}/following`),
  isFollowing: async (targetId: string): Promise<{ following: boolean }> => api.get(`/follows/check/${targetId}`),
};
