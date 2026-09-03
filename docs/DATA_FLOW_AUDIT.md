# Beyon — Data Flow Audit

**Document Version:** 1.0.0  
**Audit Date:** September 3, 2026  
**Auditor:** Senior Full-Stack & System Integration Engineering Team  
**Scope:** Complete End-to-End Trace of User Actions across Student, Recruiter, Institution, and Admin Modules.

---

## 1. Executive Summary

A comprehensive trace of all mutation workflows across the Beyon platform reveals that the system currently operates as a set of **isolated, siloed CRUD operations** rather than a unified distributed application. 

### The Core Problem
When a user performs an action in one module (such as submitting an assessment, applying for a job, or completing a practice test):
1. The backend mutates only the immediate table associated with that specific HTTP controller.
2. **Zero domain events** (`ApplicationEventPublisher`) are dispatched.
3. Downstream business entities (candidate recruitment pipelines, student skill profiles, wallet balances, activity streaks, institution cohort ratings, and multi-role notification feeds) are **never notified, evaluated, or updated**.
4. Caches are not invalidated, and real-time streams (SSE) are not triggered.
5. Dependent frontend pages query outdated records or empty tables and fall back to hardcoded mock data.

---

## 2. Canonical Target Architecture

To satisfy enterprise data consistency, every user mutation must follow this strict 8-step lifecycle:

```
[ USER ACTION / CLIENT TRIGGER ]
              │
              ▼
[ 1. AUTHENTICATION & VALIDATION ] (Spring Security JWT + Bean Validation)
              │
              ▼
[ 2. AUTHORITATIVE BACKEND TRANSACTION ] (Dolt/MySQL via @Transactional JPA)
              │
              ▼
[ 3. IN-TRANSACTION ENTITY MUTATIONS ] (Primary Record + Immediate Invariants)
              │
              ▼
[ 4. SPRING DOMAIN EVENT PUBLICATION ] (ApplicationEventPublisher.publishEvent())
              │
              ▼
[ 5. ASYNC / TRANSACTIONAL LISTENERS ] (@TransactionalEventListener)
     ├── Recruiter Candidate Pipeline Update
     ├── Student Skill Graph & XP Re-evaluation
     ├── Coin Ledger & Wallet Settlement
     ├── Streak Counter & Badge Evaluation
     └── Institutional Metrics & NIRF Aggregation
              │
              ▼
[ 6. CACHE INVALIDATION ] (Lettuce Redis evictions on affected cache keys)
              │
              ▼
[ 7. REALTIME PUSH & NOTIFICATIONS ] (RealtimeService SSE + Multi-Recipient DB Notifications)
              │
              ▼
[ 8. CLIENT-SIDE RE-RENDER ] (Frontend live notification reception / query invalidation)
```

---

## 3. Detailed Data Flow Analysis by Lifecycle

### A. The Assessment Lifecycle (The Critical Broken Flow)

#### Current State (Broken):
```
Candidate Submits Exam (Desktop / Web)
       │
       ▼
POST /api/v1/assessment/session/{id}/submit
       │
       ▼
AssessmentSessionService.submitAssessment()
       ├── Updates ONLY assessment_sessions table (status='SUBMITTED')
       └── Saves audit event to assessment_audit_events
       │
       ▼
HTTP 200 OK Returned
       │
       ├── ❌ assessment_results table: EMPTY (EvaluationEngineService bypassed)
       ├── ❌ assessment_skill_scores table: EMPTY (EvaluationService bypassed)
       ├── ❌ student_skills / skill_levels: NOT UPDATED
       ├── ❌ coin_wallets / coin_transactions: 0 COINS AWARDED
       ├── ❌ student_streaks / XP: 0 XP AWARDED
       ├── ❌ recruitment_applications: assessment_score remains NULL, status remains ELIGIBLE
       ├── ❌ recruitment_pipelines: stage remains APPLIED (Recruiter never sees completed test)
       ├── ❌ institution_rating_snapshots: NOT RECALCULATED
       └── ❌ notifications / realtime SSE: ZERO NOTIFICATIONS DISPATCHED
```

#### Target State (Integrated):
1. **Submission Ingestion:** Candidate submits exam. Backend `AssessmentSessionService.submitAssessment()` validates session and answers.
2. **Answer Grading:** Service cross-references `assessment_answers` against `question_bank` items or configuration keys to determine `isCorrect` and `marksAwarded`.
3. **Session Finalization:** `AssessmentSession` is updated with `score`, `accuracy`, and `status = 'SUBMITTED'`.
4. **Primary Result Generation:** `AssessmentResult` entity is created and persisted into `assessment_results` with full test breakdown.
5. **Domain Event Publication:** An `AssessmentCompletedEvent` is published via `ApplicationEventPublisher`:
   ```java
   public record AssessmentCompletedEvent(
       UUID sessionId,
       UUID studentId,
       UUID opportunityId,
       UUID applicationId,
       BigDecimal score,
       BigDecimal accuracy,
       int timeTakenSeconds
   ) {}
   ```
6. **Downstream Event Processing:**
   - **Recruitment Listener:** Locates `RecruitmentApplication` or `OpportunityApplication` via `applicationId` / `(opportunityId, studentId)`. Sets `assessmentScore = score`. If score >= passing threshold, transitions status to `ASSESSMENT_COMPLETED` (or auto-advances to `SHORTLISTED`). Synchronizes `RecruitmentPipeline.currentStage`.
   - **Gamification Listener:** Invokes `CoinService.earnCoins(studentId, "ASSESSMENT_COMPLETED", "ASSESSMENT", sessionId)`.
   - **XP & Streak Listener:** Invokes `StreakService.recordActivity(studentId)` and awards XP to the respective topic/skill.
   - **Skill Intelligence Listener:** Computes `AssessmentSkillScore` per tested skill, updates `StudentSkillIntelligence.evidenceCount`, and recalculates `SkillLevel`.
   - **Institutional Analytics Listener:** Invalidates cached cohort scores and recalculates student's institution rating snapshot.
   - **Notification & Realtime Listener:**
     - Dispatches notification to student: *"Your assessment for [Opportunity] has been evaluated. Score: [X]%"*.
     - Dispatches notification to hiring company recruiter: *"Candidate [Name] completed the technical assessment for [Opportunity]. Score: [X]%"*.
     - Pushes `RealtimeEvent` through `RealtimeService.sendEvent(userId, ...)`.

---

### B. The Recruitment & Opportunity Application Lifecycle

#### Current State (Broken):
* **Dual Incompatible Models:**
  - `CompanyOpportunityController` (`/api/v1/practice/companies` and `/api/v1/opportunities`) writes to `opportunity_applications`.
  - `RecruitmentPipelineController` (`/api/v1/pipeline`) writes to `recruitment_pipeline`.
  - `RecruitmentController` (`/api/v1/recruitment`) reads from `recruitment_applications`.
  - `recruitmentApi.ts` in the web frontend calls `/recruitment/my-applications`.
  - When a student applies via `POST /api/v1/opportunities/{id}/apply`, the application is inserted into `opportunity_applications`, but the candidate's `/my-applications` page queries `recruitment_applications` where the record does not exist!
* **Candidate Discovery Disconnection:**
  - Web `CandidateDiscoveryPage.tsx` attempts `fetch('/api/v1/recruitment/applications')` which returns 404 Not Found.
  - Recruiter pipeline page (`PipelinePage.tsx`) renders hardcoded mock candidate state.

#### Target State (Integrated):
1. **Canonical Table:** Standardize on `recruitment_applications` as the single authoritative application table, with backward-compatible synchronization to `opportunity_applications`.
2. **Application Submission:**
   - Student calls `POST /api/v1/opportunities/{id}/apply`.
   - Backend deducts application coins via `CoinService.spendCoins()`.
   - Inserts record into `recruitment_applications` with status `APPLIED` and sets `appliedAt = now()`.
   - Publishes `OpportunityAppliedEvent(studentId, opportunityId, applicationId)`.
3. **Event Listeners:**
   - Increments `CompanyOpportunity.applicationCount`.
   - Notifies company recruiter: *"New application received for [Role] from [Student Name]"*.
   - Notifies institution TPO: *"Student [Name] applied to [Company] - [Role]"*.
   - Invalidates recruiter discovery cache in Redis.

---

### C. Practice & Gamification Lifecycle

#### Current State (Partially Connected):
* Practice question submission updates `CoinWallet`, `StudentStreak`, and `SkillLevel`.
* **Gaps:**
  - Streak milestone achievement awards badges (`7_DAY_STREAK`), but never credits the 100/500 coins configured in `CoinRule`.
  - Weekly test completion displays 250 XP reward in UI, but `WeeklyTestService.submitTest` never invokes `SkillXpService.earnXp()`.
  - Practice activity never feeds into `StudentSkillProgress` or institutional readiness scores.

#### Target State (Integrated):
1. `StreakService.checkAchievements()` automatically calls `CoinService.earnCoins()` upon unlocking streak badges.
2. `WeeklyTestService.submitTest()` awards both coins and XP, and updates activity streaks.
3. Every practice activity emits `PracticeActivityEvent` to update student competency profiles.

---

### D. Notification & Real-Time Stream Lifecycle

#### Current State (Broken):
* Two separate notification tables exist: `notifications` and `smart_notifications`.
* Notification creation saves to database but does not broadcast over SSE or WebSocket.
* Realtime SSE controller has an object-identity bug in `unsubscribe()` that leaks memory on every client disconnect.
* Web frontend polls `/api/v1/notifications` infrequently and never connects to live stream.

#### Target State (Integrated):
1. **Single Notification Dispatcher:** All backend services route notification creation through unified `NotificationService.send(...)`.
2. **Dual Delivery:** `NotificationService` writes to the database AND immediately dispatches to `RealtimeService.sendEvent(userId, event)`.
3. **Leak-Free SSE:** `RealtimeController` captures the subscriber callback reference so `onCompletion` and `onTimeout` reliably clean up the active listener.
4. **Client Event Invalidation:** Frontend listens to SSE or uses predictable polling to automatically refresh open tables when notifications arrive.

---

## 4. Architectural Summary

| Workflow Area | Current Primary Deficiency | Required Architectural Fix |
|---|---|---|
| **Assessment Submit** | No downstream updates to score, results, skills, pipeline, or coins | Trigger atomic `AssessmentCompletedEvent` and wire all 7 downstream handlers |
| **Recruitment Apply** | 3 divergent tables (`opportunity_applications`, `recruitment_applications`, `recruitment_pipeline`) | Unify on `recruitment_applications` and sync cross-module DTOs |
| **Recruiter Pipeline** | Completely powered by static mock candidates in UI | Wire to real `/api/v1/recruitment/opportunity/{id}/applications` and live statuses |
| **Institution Analytics** | Hardcoded `3.0` skill ratings in backend; mock data in UI | Aggregate real student assessment scores by institution ID |
| **Gamification** | Streak coin awards and weekly test XP awards are skipped | Complete reward calls in `StreakService` and `WeeklyTestService` |
| **Realtime Notifications** | SSE memory leak and unlinked notification persistence | Fix callback reference cleanup and connect notification saves to SSE emitter |
