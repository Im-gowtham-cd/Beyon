export const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@beyon.com',
  username: 'testuser',
  role: 'STUDENT',
  status: 'ACTIVE',
};

export const mockProfile = {
  userId: mockUser.id,
  username: 'testuser',
  degree: 'B.Tech',
  department: 'CSE',
  institution: 'Test University',
  aboutMe: 'Testing everything',
  graduationYear: 2026,
};

export const mockSkill = {
  id: 'skill-1',
  name: 'Java',
  slug: 'java',
  category: 'Programming',
  proficiency: 'ADVANCED',
};

export const mockOpportunity = {
  id: 'opp-1',
  title: 'Software Engineer',
  companyId: 'company-1',
  companyName: 'Test Corp',
  coinCost: 500,
  status: 'PUBLISHED',
  applicationDeadline: '2026-12-31',
};

export const mockPost = {
  id: 'post-1',
  authorId: mockUser.id,
  postType: 'TEXT',
  content: 'Hello community!',
  likeCount: 5,
  commentCount: 2,
  visibility: 'PUBLIC',
  isPinned: false,
  tags: '[]',
  createdAt: new Date().toISOString(),
};

export const mockThread = {
  id: 'thread-1',
  categoryId: 'cat-1',
  authorId: mockUser.id,
  title: 'How to prepare for Java interview?',
  content: 'I need help...',
  replyCount: 10,
  viewCount: 150,
  likeCount: 20,
  isPinned: false,
  isLocked: false,
  solved: false,
  createdAt: new Date().toISOString(),
};

export const mockDashboard = {
  unreadNotifications: 3,
  reputation: { total: 150, answers: 12, accepted: 5 },
  topSkills: [{ skillId: 'skill-1', confidenceScore: 0.85, proficiency: 'ADVANCED', accuracy: 0.87, questionsSolved: 124 }],
  skillGaps: [{ requiredSkillId: 'skill-2', severity: 'HIGH', requiredLevel: 'ADVANCED', currentLevel: 'NONE' }],
  recommendedOpportunities: [{ opportunityId: 'opp-1', totalScore: 0.92, skillScore: 0.95 }],
  recentDiscussions: [{ id: 'thread-1', title: 'Java Interview Prep', replyCount: 10, solved: true }],
  recentPosts: [{ id: 'post-1', content: 'Hello!', likeCount: 5, commentCount: 2 }],
  careerProgress: [{ careerPathId: 'cp-1', readinessScore: 0.78, skillsAcquired: 5, skillsTotal: 8 }],
};
