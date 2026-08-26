import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { LoginPage } from '../auth/pages/LoginPage';
import { RegisterPage } from '../auth/pages/RegisterPage';
import { VerifyEmailPage } from '../auth/pages/VerifyEmailPage';
import { ForgotPasswordPage } from '../auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../auth/pages/ResetPasswordPage';
import { UnauthorizedPage } from '../auth/pages/UnauthorizedPage';
import { VerificationPendingPage } from '../auth/pages/VerificationPendingPage';
import { AccountSuspendedPage } from '../auth/pages/AccountSuspendedPage';
import { SettingsPage } from '../auth/pages/SettingsPage';
import { PrivacySettingsPage } from '../auth/pages/PrivacySettingsPage';
import { SessionSettingsPage } from '../auth/pages/SessionSettingsPage';
import { RealtimeNotificationsPage } from '../notification/pages/RealtimeNotificationsPage';
import { ProtectedRoute } from '../auth/guards/ProtectedRoute';
import { RoleGuard } from '../auth/guards/RoleGuard';
import { StudentHome } from '../pages/student/StudentHome';
import { StudentProfilePage } from '../student/pages/StudentProfilePage';
import { PublicProfilePage } from '../student/pages/PublicProfilePage';
import { SkillExplorer } from '../student/pages/SkillExplorer';
import { SkillDetail } from '../student/pages/SkillDetail';
import { TopicDetail } from '../student/pages/TopicDetail';
import { PracticePage } from '../practice/pages/PracticePage';
import { QuestionDetailPage } from '../practice/pages/QuestionDetailPage';
import { DailyChallengePage } from '../practice/pages/DailyChallengePage';
import { StatsPage } from '../practice/pages/StatsPage';
import { LeaderboardPage } from '../practice/pages/LeaderboardPage';
import { OpportunitiesPage } from '../practice/pages/OpportunitiesPage';
import { InstitutionDashboard } from '../institution/pages/InstitutionDashboard';
import { NotificationsPage } from '../notification/pages/NotificationsPage';
import { MyApplicationsPage } from '../recruitment/pages/MyApplicationsPage';
import { AssessmentPage } from '../assessment/pages/AssessmentPage';
import { CompanyAssessmentsPage } from '../assessment/pages/CompanyAssessmentsPage';
import { SkillProfilePage } from '../intelligence/pages/SkillProfilePage';
import { CareerPathsPage } from '../intelligence/pages/CareerPathsPage';
import { CollaborationHubPage } from '../intelligence/pages/CollaborationHubPage';
import { CandidateIntelligencePage } from '../intelligence/pages/CandidateIntelligencePage';
import { InterviewManagementPage } from '../intelligence/pages/InterviewManagementPage';
import { InstitutionAnalyticsPage } from '../intelligence/pages/InstitutionAnalyticsPage';
import { CompanyAnalyticsPage } from '../intelligence/pages/CompanyAnalyticsPage';
import { RecommendationsPage } from '../intelligence/pages/RecommendationsPage';
import { CareerRoadmapPage } from '../intelligence/pages/CareerRoadmapPage';
import { EntityFeedPage } from '../intelligence/pages/EntityFeedPage';
import { AssessmentBuilderPage } from '../assessment/pages/AssessmentBuilderPage';
import { PipelinePage } from '../recruitment/pages/PipelinePage';
import { SkillXpDashboard } from '../practice/pages/SkillXpDashboard';
import { AchievementsPage } from '../practice/pages/AchievementsPage';
import { WeeklyTestPage } from '../practice/pages/WeeklyTestPage';
import { LearningProgramsPage } from '../intelligence/pages/LearningProgramsPage';
import { CertificatePage } from '../intelligence/pages/CertificatePage';
import { GrowthIntelligencePage } from '../intelligence/pages/GrowthIntelligencePage';
import { PersonalizedFeedPage } from '../intelligence/pages/PersonalizedFeedPage';
import { MentorshipPage } from '../community/pages/MentorshipPage';
import { EventsPage } from '../community/pages/EventsPage';
import { ChallengesPage } from '../community/pages/ChallengesPage';
import { LiveProjectsPage } from '../community/pages/LiveProjectsPage';
import { ResearchPage } from '../community/pages/ResearchPage';
import { SocialFeedPage } from '../community/pages/SocialFeedPage';
import { DiscussionsPage } from '../community/pages/DiscussionsPage';
import { PortfolioPage } from '../community/pages/PortfolioPage';
import { ResourcesPage } from '../community/pages/ResourcesPage';
import { DashboardPage } from '../community/pages/DashboardPage';
import { MessagingPage } from '../community/pages/MessagingPage';
import { FeedbackPage } from '../community/pages/FeedbackPage';
import { AdminFeedbackPage } from '../community/pages/AdminFeedbackPage';
import { InstitutionHome } from '../pages/institution/InstitutionHome';
import { CompanyHome } from '../pages/company/CompanyHome';
import { AdminHome } from '../pages/admin/AdminHome';
import { StudentOnboarding } from '../onboarding/pages/student/StudentOnboarding';
import { InstitutionOnboarding } from '../onboarding/pages/institution/InstitutionOnboarding';
import { CompanyOnboarding } from '../onboarding/pages/company/CompanyOnboarding';
import { CompletionPage } from '../onboarding/pages/shared/CompletionPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/403" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding/student" element={<StudentOnboarding />} />
        <Route path="/onboarding/institution" element={<InstitutionOnboarding />} />
        <Route path="/onboarding/company" element={<CompanyOnboarding />} />
        <Route path="/onboarding/complete" element={<CompletionPage />} />

        <Route path="/verification-pending" element={<VerificationPendingPage />} />
        <Route path="/account-suspended" element={<AccountSuspendedPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/privacy" element={<PrivacySettingsPage />} />          <Route path="/settings/sessions" element={<SessionSettingsPage />} />
          <Route path="/realtime-notifications" element={<RealtimeNotificationsPage />} />

        <Route element={<RoleGuard allowedRoles={['STUDENT']} />}>
          <Route path="/student/home" element={<StudentHome />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/profile/edit" element={<StudentProfilePage />} />
          <Route path="/student/skills" element={<SkillExplorer />} />
          <Route path="/student/skills/:skillSlug" element={<SkillDetail />} />
          <Route path="/student/skills/:skillSlug/:topicSlug" element={<TopicDetail />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/practice/:id" element={<QuestionDetailPage />} />
          <Route path="/daily-challenge" element={<DailyChallengePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/my-applications" element={<MyApplicationsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/skill-profile" element={<SkillProfilePage />} />
          <Route path="/career-paths" element={<CareerPathsPage />} />
          <Route path="/collaboration" element={<CollaborationHubPage />} />
          <Route path="/candidate-intelligence" element={<CandidateIntelligencePage />} />
          <Route path="/interview-management" element={<InterviewManagementPage />} />
          <Route path="/institution/analytics" element={<InstitutionAnalyticsPage />} />
          <Route path="/company/analytics" element={<CompanyAnalyticsPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/career-roadmap" element={<CareerRoadmapPage />} />
          <Route path="/entity-feed" element={<EntityFeedPage />} />
          <Route path="/assessment-builder" element={<AssessmentBuilderPage />} />
          <Route path="/recruitment/pipeline" element={<PipelinePage />} />
          <Route path="/feed" element={<SocialFeedPage />} />
          <Route path="/discussions" element={<DiscussionsPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/messages" element={<MessagingPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/feedback/:id" element={<FeedbackPage />} />
          <Route path="/skill-xp" element={<SkillXpDashboard />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/weekly-tests" element={<WeeklyTestPage />} />
          <Route path="/learning-programs" element={<LearningProgramsPage />} />
          <Route path="/certificates" element={<CertificatePage />} />
          <Route path="/growth-intelligence" element={<GrowthIntelligencePage />} />
          <Route path="/personalized-feed" element={<PersonalizedFeedPage />} />
          <Route path="/mentorship" element={<MentorshipPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/live-projects" element={<LiveProjectsPage />} />
          <Route path="/research" element={<ResearchPage />} />
        </Route>
        <Route element={<RoleGuard allowedRoles={['INSTITUTION']} />}>
          <Route path="/institution/home" element={<InstitutionHome />} />
          <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
        </Route>
        <Route element={<RoleGuard allowedRoles={['COMPANY']} />}>
          <Route path="/company/home" element={<CompanyHome />} />
          <Route path="/company/assessments" element={<CompanyAssessmentsPage />} />
          <Route path="/company/assessment-builder" element={<AssessmentBuilderPage />} />
        </Route>
        <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
          <Route path="/admin/home" element={<AdminHome />} />
          <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
        </Route>
      </Route>

      <Route path="/student/u/:username" element={<PublicProfilePage />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
