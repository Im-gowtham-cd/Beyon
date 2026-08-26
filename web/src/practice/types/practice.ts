export interface Question {
  id: string;
  skillId?: string;
  topicId?: string;
  title: string;
  description: string;
  questionType: string;
  difficulty: string;
  evaluationMethod: string;
  expectedOutput?: string;
  codeTemplate?: string;
  solution?: string;
  explanation?: string;
  timeLimitSeconds?: number;
  tags?: string;
  status: string;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  correct: boolean;
  displayOrder: number;
  explanation?: string;
}

export interface QuestionTestCase {
  id: string;
  questionId: string;
  inputData: string;
  expectedOutput: string;
  sample: boolean;
}

export interface StudentQuestionAttempt {
  id: string;
  studentId: string;
  questionId: string;
  attemptNumber: number;
  userAnswer?: string;
  correct?: boolean;
  timeSpentSeconds?: number;
  score?: number;
  feedback?: string;
  status: string;
  createdAt: string;
}

export interface PracticeStats {
  totalAttempted: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate?: string;
  totalTimeSeconds: number;
}

export interface DailyChallenge {
  id: string;
  studentId: string;
  challengeDate: string;
  questionId: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  timeSpentSeconds?: number;
  correct?: boolean;
}

export interface CoinWallet {
  id: string;
  studentId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

export interface CoinTransaction {
  id: string;
  amount: number;
  type: string;
  reason: string;
  balanceAfter: number;
  createdAt: string;
}

export interface StudentStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
}

export interface AchievementBadge {
  id: string;
  achievementKey: string;
  achievementName: string;
  description?: string;
  badgeIcon?: string;
  earnedAt: string;
}

export interface LeaderboardEntry {
  studentId: string;
  score: number;
  rankPosition?: number;
}

export interface CompanyOpportunity {
  id: string;
  companyUserId: string;
  title: string;
  description?: string;
  opportunityType: string;
  location?: string;
  remote?: boolean;
  minCgpa?: number;
  requiredSkills?: string;
  minBeyonCoins: number;
  applicationCount: number;
  status: string;
}

export interface OpportunityApplication {
  id: string;
  opportunityId: string;
  studentId: string;
  status: string;
  coinsSpent: number;
  appliedAt?: string;
}

export interface SkillXpTransaction {
  id: string;
  studentId: string;
  skillId: string;
  skillName: string;
  xpAmount: number;
  source: string;
  sourceId?: string;
  description?: string;
  createdAt: string;
}

export interface SkillLevel {
  id: string;
  studentId: string;
  skillId: string;
  skillName: string;
  totalXp: number;
  currentLevel: number;
  levelName: string;
  xpForNextLevel: number;
  updatedAt: string;
}

export interface WeeklyTest {
  id: string;
  title: string;
  description?: string;
  testDate: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  coinReward: number;
  xpReward: number;
  status: string;
}

export interface WeeklyTestAttempt {
  id: string;
  testId: string;
  studentId: string;
  score: number;
  correctAnswers: number;
  totalAnswered: number;
  timeTakenSeconds: number;
  status: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Achievement {
  id: string;
  studentId: string;
  achievementKey: string;
  achievementName: string;
  description?: string;
  badgeIcon?: string;
  category: string;
  rarity: string;
  earnedAt: string;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  streakFreezesAvailable: number;
}
