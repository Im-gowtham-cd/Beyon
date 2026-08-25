import { api } from '../../services/api/client';
import type {
  Question, QuestionOption, StudentQuestionAttempt, PracticeStats,
  DailyChallenge, CoinWallet, CoinTransaction, StudentStreak, AchievementBadge,
  LeaderboardEntry, CompanyOpportunity, OpportunityApplication
} from '../types/practice';

export const questionApi = {
  getQuestions: (params?: { skillId?: string; topicId?: string; difficulty?: string; page?: number; size?: number }) => {
    const q = new URLSearchParams();
    if (params?.skillId) q.set('skillId', params.skillId);
    if (params?.topicId) q.set('topicId', params.topicId);
    if (params?.difficulty) q.set('difficulty', params.difficulty);
    if (params?.page !== undefined) q.set('page', String(params.page));
    if (params?.size) q.set('size', String(params.size));
    return api.get<Question[]>(`/questions?${q.toString()}`);
  },
  getQuestion: (id: string) => api.get<Question>(`/questions/${id}`),
  getOptions: (id: string) => api.get<QuestionOption[]>(`/questions/${id}/options`),
  getStats: () => api.get<Record<string, number>>('/questions/stats'),
};

export const practiceApi = {
  getQuestions: (params?: { skillId?: string; topicId?: string; difficulty?: string }) => {
    const q = new URLSearchParams();
    if (params?.skillId) q.set('skillId', params.skillId);
    if (params?.topicId) q.set('topicId', params.topicId);
    if (params?.difficulty) q.set('difficulty', params.difficulty);
    return api.get<Question[]>(`/practice/questions?${q.toString()}`);
  },
  getQuestion: (id: string) => api.get<Question>(`/practice/questions/${id}`),
  submit: (questionId: string, answer: string, timeSpentSeconds?: number) =>
    api.post<StudentQuestionAttempt>('/practice/submit', { questionId, answer, timeSpentSeconds }),
  getStats: () => api.get<PracticeStats>('/practice/stats'),
  getHistory: () => api.get<StudentQuestionAttempt[]>('/practice/history'),
};

export const dailyChallengeApi = {
  getToday: () => api.get<DailyChallenge>('/daily-challenge/today'),
  start: (id: string) => api.post<DailyChallenge>(`/daily-challenge/${id}/start`),
  complete: (id: string, correct: boolean, timeSpentSeconds?: number) =>
    api.post<DailyChallenge>(`/daily-challenge/${id}/complete`, { correct, timeSpentSeconds }),
  getHistory: () => api.get<DailyChallenge[]>('/daily-challenge/history'),
};

export const coinApi = {
  getWallet: () => api.get<CoinWallet>('/coins/wallet'),
  getBalance: () => api.get<number>('/coins/balance'),
  getTransactions: () => api.get<CoinTransaction[]>('/coins/transactions'),
};

export const gamificationApi = {
  getStreak: () => api.get<StudentStreak>('/gamification/streak'),
  getBadges: () => api.get<AchievementBadge[]>('/gamification/badges'),
  getLeaderboard: (limit = 50) => api.get<LeaderboardEntry[]>(`/gamification/leaderboard?limit=${limit}`),
  getMyRank: () => api.get<LeaderboardEntry>('/gamification/leaderboard/me'),
};

export const opportunityApi = {
  getOpportunities: () => api.get<CompanyOpportunity[]>('/opportunities'),
  getOpportunity: (id: string) => api.get<CompanyOpportunity>(`/opportunities/${id}`),
  checkEligibility: (id: string) => api.get<{ eligible: boolean; reasons: string[]; coinBalance: number; requiredCoins: number }>(`/opportunities/${id}/eligibility`),
  apply: (id: string) => api.post<OpportunityApplication>(`/opportunities/${id}/apply`),
  getMyApplications: () => api.get<OpportunityApplication[]>('/opportunities/my-applications'),
};
