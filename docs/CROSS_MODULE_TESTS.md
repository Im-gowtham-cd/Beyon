# Beyon — Cross-Module Integration Test Scenarios

**Document Version:** 1.0.0  
**Audit Date:** September 3, 2026  
**Scope:** Automated & End-to-End Verification Test Scenarios for Distributed Cross-Module Data Consistency.

---

## Scenario 1: End-to-End Assessment Completion & Synchronization

### Test Objective
Verify that submitting an assessment updates:
1. `AssessmentSession` and `AssessmentResult`
2. `RecruitmentApplication.assessmentScore` and transitions status from `APPLIED` to `ASSESSMENT_COMPLETED`
3. `RecruitmentPipeline.currentStage`
4. Candidate's `CoinWallet` (+50 coins) and creates `CoinTransaction`
5. Candidate's `StudentStreak` and `SkillLevel` (+XP)
6. `AssessmentSkillScore` in the intelligence module
7. Notifications to candidate, company, and institution

### Step-by-Step Test Procedure
1. Authenticate as student candidate `aravind.swaminathan@psgtech.edu`.
2. Apply to opportunity `NVIDIA GPU Acceleration Lab` (ID: `opp-gpu-01`).
3. Create assessment session via `POST /api/v1/assessment/session`.
4. Launch session with `launchToken` and complete biometric verification.
5. Answer questions via `POST /api/v1/assessment/session/{sessionId}/answer`.
6. Submit assessment via `POST /api/v1/assessment/session/{sessionId}/submit`.
7. **Verification Invariants**:
   - `SELECT status, score FROM assessment_sessions WHERE id = :sessionId` -> `status='SUBMITTED'`, `score > 0`.
   - `SELECT count(*) FROM assessment_results WHERE session_id = :sessionId` -> `1`.
   - `SELECT status, assessment_score FROM recruitment_applications WHERE opportunity_id = :oppId AND student_id = :studentId` -> `status='ASSESSMENT_COMPLETED'`, `assessment_score == session.score`.
   - `SELECT balance FROM coin_wallets WHERE student_id = :studentId` -> initial balance + 50.
   - `SELECT count(*) FROM notifications WHERE user_id = :studentId AND title LIKE '%Assessment%'` -> `>= 1`.

---

## Scenario 2: Opportunity Application & Recruiter Pipeline Sync

### Test Objective
Verify that when a student applies for an opportunity:
1. Coins are deducted from the student's wallet based on `minBeyonCoins`.
2. The application is created in `recruitment_applications`.
3. The recruiter pipeline for the company displays the applicant with status `APPLIED`.
4. The student's `/my-applications` page immediately displays the application.

### Step-by-Step Test Procedure
1. Record student coin balance.
2. Call `POST /api/v1/opportunities/{id}/apply`.
3. Assert HTTP 200 OK.
4. Verify `coin_wallets.balance = previous_balance - minBeyonCoins`.
5. Authenticate as company recruiter and call `GET /api/v1/pipeline/company`.
6. Verify candidate appears in `APPLIED` stage.

---

## Scenario 3: Recruiter Shortlist & Status Propagation

### Test Objective
Verify that when a recruiter moves a candidate to `SHORTLISTED`:
1. `recruitment_applications.status` becomes `SHORTLISTED`.
2. A row is added to `recruitment_status_history`.
3. Candidate receives a real-time notification.
4. The candidate's `/my-applications` view updates to reflect `SHORTLISTED`.

---

## Scenario 4: Placement Offer Issuance & Student Acceptance

### Test Objective
Verify that:
1. Recruiter calls `POST /api/v1/pipeline/{id}/offer`.
2. `placement_offers` record is inserted with `offerStatus = 'SENT'`.
3. Student calls `POST /api/v1/pipeline/offer/{offerId}/accept`.
4. Status transitions to `ACCEPTED` and pipeline stage advances to `SELECTED`.
5. Institution placement statistics increment placed candidate count.

---

## Scenario 5: Streak Milestone & Coin Reward Settlement

### Test Objective
Verify that maintaining a 7-day practice streak unlocks the `7_DAY_STREAK` badge AND deposits 100 coins into the student's wallet.

### Step-by-Step Test Procedure
1. Set `student_streaks.current_streak = 6` with `last_activity_date = yesterday`.
2. Solve a practice question via `POST /api/v1/practice/submit`.
3. Assert `current_streak == 7`.
4. Assert `student_achievement_badges` contains `7_DAY_STREAK`.
5. Assert `coin_transactions` contains `REASON='7_DAY_STREAK'` and amount `100`.
6. Assert wallet balance increased by 100.

---

## Scenario 6: Institution TPO Student Verification

### Test Objective
Verify that the institution TPO can view unverified students and approve them, transitioning the student's profile from `PENDING_INSTITUTION_VERIFICATION` to `COMPLETED`.

### Step-by-Step Test Procedure
1. Query student in `users` with `profile_status = 'PENDING_INSTITUTION_VERIFICATION'`.
2. Authenticate as institution TPO and call `GET /api/v1/institution/students/pending`.
3. Assert student is present in array.
4. Call `POST /api/v1/institution/students/{studentId}/verify` with `{ approved: true }`.
5. Re-query `users`: assert `profile_status = 'COMPLETED'`.
6. Authenticate as student and assert login routes to `/student/home` without redirection to `/verification-pending`.
