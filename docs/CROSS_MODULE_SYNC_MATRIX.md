# Beyon — Cross-Module Synchronization Matrix

**Document Version:** 1.0.0  
**Audit Date:** September 3, 2026  
**Scope:** Event-Driven Synchronization Matrix Mapping Source Events to Dependent Business Modules, Cache Invalidation, and Real-Time Notifications.

---

## 1. Domain Event Synchronization Matrix

| # | Source Event | Primary Entity Mutated | Secondary Entities Requiring Mutation | Current Propagation Status | Target Synchronization Mechanism |
|---|---|---|---|---|---|
| **1** | **`AssessmentCompletedEvent`** | `assessment_sessions` (`score`, `accuracy`, `status='SUBMITTED'`) | 1. `assessment_results` (evaluation breakdown)<br>2. `recruitment_applications` (`assessmentScore`, `status`)<br>3. `recruitment_pipeline` (`currentStage='SHORTLISTED'` or `'ASSESSED'`)<br>4. `assessment_skill_scores` (skill marks)<br>5. `student_skills` / `skill_levels` (XP recalculation)<br>6. `coin_wallets` / `coin_transactions` (+50 coins)<br>7. `student_streaks` (record activity)<br>8. `institution_rating_snapshots` (cohort average update)<br>9. `notifications` (Student, Recruiter, Institution TPO) | **100% DISCONNECTED**<br>Only `assessment_sessions` is saved. Zero downstream side-effects occur. | **`ApplicationEventPublisher`** -> Async Transactional Event Listeners: update results, application status, credit coins, recalculate skills, push SSE to recruiter & candidate. |
| **2** | **`OpportunityAppliedEvent`** | `recruitment_applications` (insert `status='APPLIED'`) | 1. `opportunity_applications` (synchronized copy)<br>2. `company_opportunities` (`applicationCount += 1`)<br>3. `coin_wallets` (`spendCoins` for application fee)<br>4. `coin_transactions` (ledger entry)<br>5. `notifications` (Recruiter & Student) | **PARTIALLY BROKEN**<br>Currently writes only to `opportunity_applications`, breaking `/my-applications` and recruiter pipeline. | Unify application transaction: deduct coins, persist `recruitment_applications`, increment counter, notify recruiter via SSE. |
| **3** | **`ApplicationStatusChangedEvent`** | `recruitment_applications` (`status` transition) | 1. `recruitment_status_history` (audit trail)<br>2. `recruitment_pipeline` (`currentStage`)<br>3. `notifications` (Student alert)<br>4. `realtime_events` (instant toast in student UI) | **PARTIAL**<br>History is recorded, but recruiter pipeline is not kept in sync with recruitment controller. | Synchronize `RecruitmentApplication` with `RecruitmentPipeline`; publish `RealtimeEvent` on status transition. |
| **4** | **`PlacementOfferGeneratedEvent`** | `placement_offers` (insert `offerStatus='SENT'`) | 1. `recruitment_pipeline` (`currentStage='OFFERED'`)<br>2. `recruitment_applications` (`status='SELECTED'`)<br>3. `notifications` (Student critical alert)<br>4. `institution_placement_records` (provisional entry) | **DISCONNECTED**<br>`PlacementOffer` created in pipeline service, but `recruitment_applications` status is not updated. | Emit `OfferGeneratedEvent`; sync application status; notify candidate and institution TPO. |
| **5** | **`PlacementOfferAcceptedEvent`** | `placement_offers` (`offerStatus='ACCEPTED'`) | 1. `recruitment_pipeline` (`currentStage='SELECTED'`)<br>2. `recruitment_applications` (`status='SELECTED'`)<br>3. `placement_records` (`status='CONFIRMED'`)<br>4. `institution_placement_stats` (placed count incremented)<br>5. `notifications` (Company, Institution, Student) | **PARTIAL**<br>Updates offer and pipeline stage, but does not update `placement_records` or institution NIRF metrics. | Transactional listener increments institution placed count and generates confirmed placement record. |
| **6** | **`StudentVerifiedEvent`** | `institution_students` (`status='VERIFIED'`) | 1. `users` (`profileStatus='COMPLETED'`)<br>2. `student_profiles` (`institutionVerified=true`)<br>3. `notifications` (Student approval notice) | **PARTIALLY BROKEN**<br>Backend endpoint exists, but frontend table double `.data` unwrapping bug prevented TPO from seeing or approving students. | Fix frontend table binding; upon approval, activate student user account and push realtime notification. |
| **7** | **`PracticeQuestionSolvedEvent`** | `student_question_attempts` (insert attempt) | 1. `coin_wallets` (+10/25 coins)<br>2. `coin_transactions`<br>3. `student_streaks` (`currentStreak` update)<br>4. `skill_levels` (+XP based on difficulty)<br>5. `student_practice_stats` (`totalSolved += 1`) | **CONNECTED**<br>Functional via direct method calls in `PracticeService`. | Maintain existing logic; add cache invalidation for user practice stats. |
| **8** | **`StreakMilestoneReachedEvent`** | `student_achievement_badges` (insert badge) | 1. `coin_wallets` (+100 or +500 coins)<br>2. `coin_transactions`<br>3. `notifications` (Badge celebration) | **BUGGED**<br>Badge is created, but coins are never awarded due to missing `coinService.earnCoins` call. | Add `coinService.earnCoins(studentId, "7_DAY_STREAK", ...)` in `StreakService.checkAchievements()`. |
| **9** | **`WeeklyTestCompletedEvent`** | `weekly_test_attempts` (insert attempt) | 1. `coin_wallets` (+100 coins)<br>2. `coin_transactions`<br>3. `skill_levels` (+250 XP)<br>4. `student_streaks`<br>5. `notifications` | **PARTIALLY BROKEN**<br>Coins awarded, but 250 XP is never credited to `SkillXpService`. | Inject `SkillXpService` and award 250 XP on weekly test submit. |

---

## 2. Cross-Module Cache Invalidation Plan

| Cache Domain | Redis Key Pattern | Trigger Event | Invalidation Method |
|---|---|---|---|
| **Opportunities** | `opportunities:all`, `opportunities:company:*` | Opportunity created, updated, or closed | `cacheService.evictPattern("opportunities:*")` |
| **Candidate Discovery** | `candidates:drive:*`, `candidates:eligible:*` | Assessment submitted, profile updated, or auto-shortlist run | `cacheService.evictPattern("candidates:*")` |
| **Leaderboards** | `leaderboard:global`, `leaderboard:weekly:*` | Practice question solved, test submitted, XP earned | `cacheService.evictPattern("leaderboard:*")` |
| **Admin Overview** | `admin:dashboard:overview`, `admin:dashboard:metrics` | User registered, assessment submitted, placement confirmed | `cacheService.evict("admin:dashboard:overview")` |
| **Institution Analytics** | `institution:metrics:*`, `institution:rating:*` | Assessment completed, offer accepted, student verified | `cacheService.evictPattern("institution:*")` |

---

## 3. Realtime SSE Broadcast Matrix

| Event Type | Intended Recipients | Payload | Frontend Action |
|---|---|---|---|
| `ASSESSMENT_RESULT` | Student, Recruiter, TPO | `{ sessionId, score, accuracy, status }` | Auto-refresh candidate application card & results view |
| `APPLICATION_STATUS` | Student | `{ applicationId, status, notes }` | Show toast alert and refresh `/my-applications` |
| `OFFER_RECEIVED` | Student, TPO | `{ offerId, role, packageAmount, companyName }` | Show celebratory modal and add to offers list |
| `COIN_AWARDED` | Student | `{ amount, reason, newBalance }` | Update top navigation coin balance counter live |
| `STREAK_UPDATED` | Student | `{ currentStreak, badgeEarned }` | Show streak flame animation and update stats page |
| `STUDENT_VERIFIED` | Student | `{ institutionName, status: 'COMPLETED' }` | Route away from `/verification-pending` to `/student/home` |
