# Beyon — Database Consistency Report

**Document Version:** 1.0.0  
**Audit Date:** September 3, 2026  
**Database System:** Dolt SQL Server 2.1.4 (MySQL 8.0 Compatible)  
**Host/Port:** `127.0.0.1:3306` | **Database:** `beyon`

---

## 1. Schema & Table Census

The `beyon` database contains **212 tables**:
* **Populated Tables:** 74 tables containing seed data, user accounts, taxonomy trees, opportunities, and practice questions.
* **Empty Tables:** 138 tables containing advanced workflows (assessment results, live interview scheduling, AI advisor chat logs, and analytics snapshots).

### High-Level Census of Core Tables

| Table Category | Key Tables | Row Count | Invariant & Relationship Health |
|---|---|---|---|
| **Identity & Auth** | `users`, `user_roles`, `user_sessions` | 190 users | **100% Consistent**. All 190 users have active BCrypt hashes (`$2a$10$...`) with valid roles (`STUDENT`, `INSTITUTION`, `COMPANY`, `ADMIN`). |
| **Profiles** | `student_profiles`, `institution_profiles`, `company_profiles` | 123 students, 26 institutions, 41 companies | **100% Consistent**. Zero orphan profiles (`student_profiles.user_id` strictly references `users.id`). |
| **Coin Economy** | `coin_wallets`, `coin_transactions`, `coin_rules` | 123 wallets, 125 transactions | **100% Mathematically Sound**. For all 123 wallets: `balance = total_earned - total_spent`. Historical transaction sums match wallet totals exactly. |
| **Taxonomy & Skills** | `skill_categories`, `skills`, `skill_topics`, `skill_subtopics` | 12 categories, 85 skills, 310 topics | **100% Consistent**. Foreign key hierarchy is valid and fully navigable. |
| **Practice Engine** | `questions`, `question_options`, `test_cases`, `student_question_attempts` | 420 questions, 1680 options | **100% Consistent**. Question options match question foreign keys; practice attempts reference valid questions and students. |
| **Opportunities** | `company_opportunities`, `opportunity_assessments` | 35 opportunities | **Consistent**. Referenced by valid company user IDs. |
| **Recruitment** | `recruitment_applications`, `opportunity_applications`, `placement_drives`, `recruitment_drives` | 120 recruitment apps, 293 opportunity apps, 25 placement drives, 2 recruitment drives | **SCHEMA DIVERGENCE FOUND**. Two parallel sets of application and drive tables exist. |
| **Assessments** | `assessment_sessions`, `assessment_answers`, `assessment_results`, `assessment_configurations` | 0 active sessions (live testing pending) | **SCHEMA DEFINED, DATA EMPTY**. Schema is valid with UUID primary keys and foreign keys to applications. |

---

## 2. Critical Dual-Table Anomalies

### A. Dual Application Tables: `opportunity_applications` vs `recruitment_applications`
* **`opportunity_applications`** (293 rows):
  - Created in `com.beyon.practice.model.OpportunityApplication`.
  - Written by `CompanyOpportunityController.apply()` (`/api/v1/practice/companies/opportunities/{id}/apply`).
  - Columns: `id`, `opportunity_id`, `student_id`, `status` (`APPLIED`), `coins_spent`, `assessment_score`, `applied_at`, `updated_at`.
* **`recruitment_applications`** (120 rows):
  - Created in `com.beyon.recruitment.model.RecruitmentApplication`.
  - Read by `RecruitmentController.getMyApplications()` (`/api/v1/recruitment/my-applications`).
  - Columns: `id`, `student_id`, `opportunity_id`, `drive_id`, `institution_id`, `status` (`ELIGIBLE`, `APPLIED`, `ASSESSMENT_PENDING`, `ASSESSMENT_COMPLETED`, `SHORTLISTED`, `INTERVIEW`, `SELECTED`, `REJECTED`), `assessment_score`, `interview_score`, `notes`, `coins_spent`.
* **Impact**:
  When a candidate applies to an opportunity in the student portal, it writes to `opportunity_applications`. But when the candidate navigates to `/my-applications`, the frontend queries `/api/v1/recruitment/my-applications`, reading from `recruitment_applications` where the newly submitted application is absent!
* **Resolution**:
  Standardize `RecruitmentApplication` as the canonical entity. Synchronize both tables in the application transaction so neither query view breaks.

### B. Dual Drive Tables: `placement_drives` vs `recruitment_drives`
* **`placement_drives`** (25 rows):
  - Mapped by `com.beyon.institution.model.PlacementDrive` and served by `InstitutionController` (`/api/v1/institution/drives`).
  - Contains college campus placement drives targeted at specific universities.
* **`recruitment_drives`** (2 rows):
  - Mapped by `com.beyon.recruitment.model.RecruitmentDrive` and served by `RecruitmentDriveController` (`/api/v1/drives`).
  - Contains open public recruitment drives posted by corporate recruiters.
* **Resolution**:
  Maintain both models with clear domain boundaries: `PlacementDrive` for institution-managed on-campus drives, and `RecruitmentDrive` for company-managed open/targeted drives.

### C. Dual Notification Tables: `notifications` vs `smart_notifications`
* **`notifications`**:
  - Entity: `com.beyon.notification.model.Notification`.
  - Read by: `NotificationController` (`/api/v1/notifications`).
* **`smart_notifications`**:
  - Entity: `com.beyon.community.model.SmartNotification`.
  - Written by: `SmartNotificationService` in the recruitment pipeline service.
* **Impact**:
  Notifications emitted by the recruitment pipeline do not show up in the top navigation bar bell icon because the navbar queries `NotificationController`.
* **Resolution**:
  Have `SmartNotificationService` write to canonical `Notification` or duplicate the alert to both tables.

---

## 3. Invariant Verification & Math Audit

### A. Coin Ledger Mathematical Soundness
An audit of all 123 student coin wallets against their transaction history verifies:
* For every wallet, `balance == total_earned - total_spent` (123/123 pass).
* Sum of all credit transactions (`EARNED`) equals wallet `total_earned`.
* Sum of all debit transactions (`SPENT`) equals wallet `total_spent`.
* No negative wallet balances exist.

### B. Foreign Key & Orphan Scan
* `users` $\rightarrow$ `student_profiles`: 0 orphans.
* `users` $\rightarrow$ `coin_wallets`: 0 orphans.
* `users` $\rightarrow$ `institution_profiles`: 0 orphans.
* `users` $\rightarrow$ `company_profiles`: 0 orphans.
* `questions` $\rightarrow$ `question_options`: 0 orphans.
* `skills` $\rightarrow$ `skill_topics`: 0 orphans.

---

## 4. Conclusion & Action Items

The underlying Dolt relational database is fundamentally healthy and free of orphan corruption. The primary issue is **controller-level bifurcation** (writing to Table A while reading from Table B) and **omitted cross-table writes** (e.g. `AssessmentSessionService` omitting writes to `assessment_results` and `recruitment_applications`).
