Yes. Since you have now planned 220 phases, the right next step is not another feature phase. You need a Master Validation + Architecture Migration Prompt that makes your agent inspect the entire implementation against all 220 phases, identify missing/broken functionality, and migrate the data architecture from Supabase → Appwrite + Dolt.

I verified the current Appwrite capabilities: Appwrite provides Auth, TablesDB/database storage, Storage, Functions, Messaging, Realtime, and server/client SDKs; its current database model is database → tables → rows with permissions. Appwrite also supports secure session persistence and permission controls. Dolt provides a MySQL-compatible SQL server, transactions, branches, commits, merges, constraints, indexes, and SQL clients compatible with MySQL tooling.

The important architectural distinction I recommend is:

Appwrite
├── Authentication / Identity
├── User-facing profile data
├── User preferences
├── Files / Storage
├── Realtime
└── Messaging / notifications

Dolt
├── Companies
├── Institutions
├── Skills
├── Jobs
├── Recruitment
├── Applications
├── Beyon Coins ledger
├── Assessments
├── Questions
├── Placement records
├── Analytics-ready relational data
└── Other strongly relational transactional data

Upstash Redis
├── Cache
├── Rate limiting
├── Temporary state
└── High-frequency counters

This avoids trying to use Appwrite TablesDB as a replacement for every relational operation while still keeping the user/identity side centered around Appwrite.

# Beyon — Master Validation, Architecture Migration & Production Audit Prompt

## 0. PURPOSE

You are now responsible for validating and completing the entire Beyon application.

Beyon has been designed through approximately 220 implementation phases.

The current task is NOT to blindly add another feature.

Your task is to:

1. Inspect the entire existing Beyon implementation.
2. Compare the implementation against the complete product requirements.
3. Validate every major feature and workflow.
4. Identify incomplete, broken, mocked, duplicated, insecure, or incorrectly implemented functionality.
5. Replace the existing Supabase architecture with Appwrite + Dolt.
6. Preserve all working functionality.
7. Migrate data safely.
8. Verify the complete end-to-end application.
9. Fix discovered issues in dependency order.
10. Produce a final implementation audit.

This is a REAL APPLICATION VALIDATION AND MIGRATION TASK.

Do not assume that previous phases were implemented correctly.

Do not claim a feature is complete merely because a UI screen exists.

A feature is considered complete only when:

Frontend
+
Backend
+
Database
+
Authorization
+
Validation
+
Persistence
+
Error handling
+
Testing

all work together.

---

# 1. PROJECT SOURCE OF TRUTH

Before doing anything:

Read:

```text
knowledge.md
skills.md
```

Then inspect:

```text
phases/
```

Read every available phase specification from:

```text
phase-001.md
...
phase-220.md
```

If some phase files do not exist but the repository contains implementation corresponding to them, infer the feature scope from the established Beyon roadmap and document that inference.

Do NOT silently ignore missing phase specifications.

---

# 2. MASTER PRODUCT DEFINITION

Beyon is an AI-powered skill-development, assessment, recruitment, placement, and academia-industry collaboration platform.

Core philosophy:

> Learn → Practice → Prove → Earn → Qualify → Apply → Assess → Get Hired → Build Career

Beyon is NOT:

* Only a LeetCode clone
* Only a job portal
* Only a placement portal
* Only an LMS
* Only an AI chatbot
* Only a proctoring platform

It combines all of these into a connected ecosystem.

---

# 3. PRIMARY USER TYPES

The system must support:

```text
STUDENT
INSTITUTION
INSTITUTION_ADMIN
FACULTY
PLACEMENT_OFFICER
COMPANY
COMPANY_ADMIN
COMPANY_RECRUITER
MENTOR
ALUMNI
MODERATOR
ADMIN
SUPER_ADMIN
```

Do not create roles unnecessarily if equivalent roles already exist.

Use a centralized permission model.

---

# 4. CORE DATA OWNERSHIP ARCHITECTURE

IMPORTANT:

The old Supabase architecture is being replaced.

DO NOT retain Supabase as an active application dependency.

The target architecture is:

```text
                   BEYON
                     |
       ┌─────────────┼─────────────┐
       |             |             |
       v             v             v
   Appwrite         Dolt       Upstash Redis
       |             |             |
   Identity      SQL Data       Cache
   Profiles      Relations     Rate Limit
   Files         Transactions  Temporary State
   Realtime      Reporting     Counters
   Messaging
```

---

# 5. APPWRITE RESPONSIBILITIES

Appwrite is the authoritative application platform for:

## Identity

Use Appwrite Auth for:

* Registration
* Login
* Logout
* Session management
* Email verification
* Password recovery
* MFA where supported/configured
* User identity
* Authentication sessions

Do NOT create a second password authentication system inside Dolt.

Never store plaintext passwords anywhere in the application.

Appwrite handles password security and session persistence through its authentication system.

---

# 6. APPWRITE USER INFORMATION

The requirement is:

> User information must be stored in Appwrite.

Interpret this as:

### Appwrite Auth

Authoritative identity:

```text
appwriteUserId
email
authentication state
verification state
sessions
```

### Appwrite TablesDB / user-profile data

Store user-facing identity/profile information such as:

```text
user profile
display name
avatar reference
bio
phone where appropriate
location
career preferences
privacy preferences
notification preferences
social/profile links
onboarding state
profile completion
placement preference
role metadata
```

Use Appwrite's current table/row database model and permission controls.

Do NOT put large relational business workflows into Appwrite merely because it can store structured rows.

---

# 7. DOLT RESPONSIBILITIES

Dolt is the authoritative SQL system for strongly relational, transactional, query-heavy business data.

Dolt is MySQL-compatible and should be accessed through standard MySQL-compatible drivers.

Use Dolt for:

```text
Organizations
Companies
Institutions
Departments
Skills
Skill Taxonomy
Topics
Questions
Question Versions
Assessments
Assessment Sections
Assessment Attempts
Submissions
Eligibility Rules
Jobs
Internships
Recruitment Drives
Applications
Application Status History
Coin Transactions
Coin Rules
XP Transactions
Achievements
Leaderboards where relational persistence is required
Interviews
Offers
Placements
Placement Verification
Institution Ratings
Company Ratings
Collaboration Projects
Research Projects
Mentorship records
Events
Community relational metadata
Certificates
Credential records
Audit/business history
Analytics-ready structured data
```

---

# 8. IMPORTANT DATABASE RULE

DO NOT duplicate the same authoritative business record across Appwrite and Dolt.

For every entity decide:

```text
ONE SOURCE OF TRUTH
```

Example:

```text
User Identity
→ Appwrite

Student Profile
→ Appwrite

Company
→ Dolt

Institution
→ Dolt

Skill
→ Dolt

Job
→ Dolt

Application
→ Dolt

Coin Ledger
→ Dolt

Assessment
→ Dolt
```

If an Appwrite document contains a reference to a Dolt entity, store only the required external identifier.

Do not create contradictory copies.

---

# 9. CROSS-DATABASE IDENTITY

Because Appwrite and Dolt are separate systems:

Use:

```text
appwrite_user_id
```

as the external identity reference.

Example:

```text
Dolt:

student_profiles
----------------------------
id
appwrite_user_id
institution_id
department_id
cgpa
graduation_year
...
```

The backend must verify the authenticated Appwrite identity before accessing Dolt records.

Never trust:

```text
userId
studentId
companyId
institutionId
```

from the client as proof of ownership.

---

# 10. BACKEND ARCHITECTURE

The existing Spring Boot backend remains the primary business API.

Architecture:

```text
React
   |
   v
Spring Boot
   |
   ├── Appwrite Adapter
   |
   ├── Dolt SQL Repository
   |
   ├── Upstash Redis Adapter
   |
   ├── Assessment Engine
   |
   ├── AI Service
   |
   └── Storage/Notification adapters
```

The frontend should NOT directly manipulate Dolt.

For sensitive user/application operations, the frontend should communicate with Spring Boot.

---

# 11. APPWRITE CLIENT / SERVER BOUNDARY

Use Appwrite client SDK only for functionality that is intentionally safe for client-side use.

Use Appwrite server SDK/API from Spring Boot for privileged operations.

Appwrite distinguishes client and server APIs; server APIs require API keys and can operate with server authority, while client APIs follow user permissions.

Never place:

```text
APPWRITE_API_KEY
server secrets
admin credentials
```

into React/Vite frontend environment variables.

---

# 12. APPWRITE STORAGE

Replace Supabase Storage with Appwrite Storage.

Use Appwrite Storage for:

```text
Student Avatars
Resumes
Certificates
Academic Documents
Institution Documents
Company Verification Documents
Project Images
Project Evidence
Internship Documents
Offer Letters
Credential Assets
Feedback Attachments
```

Appwrite Storage provides controlled file access and configurable storage adapters.

Create private buckets for sensitive documents.

Do not expose private files using permanent public URLs.

Use controlled access / temporary access where appropriate.

---

# 13. APPWRITE REALTIME

Where existing Beyon functionality requires realtime behavior, use Appwrite Realtime where appropriate.

Possible use cases:

```text
Notifications
Application status changes
Recruitment status
Mentorship updates
Messaging
Assessment session state
Admin activity
```

Do not introduce unnecessary polling where realtime is appropriate.

---

# 14. APPWRITE MESSAGING

Use Appwrite Messaging where appropriate for:

```text
Email notifications
Push notifications
System messages
Assessment reminders
Recruitment notifications
Application updates
```

However, business eligibility must ALWAYS be decided by Spring Boot.

Messaging should distribute an already-authorized event.

---

# 15. APPWRITE FUNCTIONS

Do not automatically move backend business logic into Appwrite Functions.

The primary business logic remains Spring Boot.

Use Appwrite Functions only if there is a clearly justified Appwrite-specific task.

Avoid creating duplicate backend logic between:

```text
Spring Boot
Appwrite Functions
AI Service
```

---

# 16. DOLT SQL ARCHITECTURE

Dolt should be accessed as a MySQL-compatible SQL server.

Application connection:

```text
Spring Boot
   |
   | MySQL-compatible JDBC
   v
Dolt SQL Server
```

Dolt supports a built-in MySQL-compatible server.

Use the appropriate MySQL/Dolt JDBC configuration.

Do not use a PostgreSQL driver.

Do not leave PostgreSQL/Supabase JDBC drivers active unless a separate legitimate use remains.

---

# 17. DOLT TRANSACTION RULES

Use SQL transactions for critical operations.

Important operations include:

```text
Coin Application
Coin Reward
Application Creation
Assessment Submission
Placement Update
Offer Acceptance
Certificate Issuing
Recruitment Status Changes
```

Use:

```sql
START TRANSACTION;
COMMIT;
ROLLBACK;
```

Dolt supports transactional behavior and rollback semantics, but its transaction isolation differs from MySQL; validate concurrency assumptions rather than assuming PostgreSQL semantics.

---

# 18. BEYON COIN TRANSACTION

This is one of the highest-priority validations.

For:

```text
Company Application
```

the operation must be atomic.

Required logic:

```text
BEGIN
   |
   +-- Validate authenticated user
   |
   +-- Validate eligibility
   |
   +-- Lock/check coin balance
   |
   +-- Check duplicate application
   |
   +-- Deduct coins / create transaction
   |
   +-- Create application
   |
   +-- Create audit/event record
   |
COMMIT
```

If any operation fails:

```text
ROLLBACK
```

Never:

```text
deduct coins
then
attempt application creation
```

without a transactional guarantee.

---

# 19. COIN LEDGER

Coin balance must be derived from a transactionally reliable ledger.

Example:

```text
coin_transactions

id
student_id
transaction_type
amount
reference_type
reference_id
balance_after
created_at
```

Types:

```text
EARN
SPEND
REFUND
ADJUSTMENT
REVERSAL
```

Never allow frontend code to directly set:

```text
coin_balance = 5000
```

---

# 20. DOLT VERSION CONTROL

Use Dolt's versioning capability deliberately.

Dolt supports branches, commits and merges.

Use branches primarily for controlled data/schema workflows, not for every runtime user request.

Recommended concepts:

```text
main
staging-data
development
analytics-snapshot
```

Do NOT create a branch per student.

Do NOT create a branch per normal API request.

---

# 21. DOLT MIGRATIONS

Database changes must be version controlled.

Create:

```text
database/
   dolt/
      schema/
      migrations/
      seeds/
      verification/
```

Each schema change must be reproducible.

Document:

```text
Schema version
Migration
Rollback considerations
Dolt commit
```

---

# 22. DOLT CONSTRAINTS

Use SQL constraints where appropriate.

Examples:

```text
PRIMARY KEY
FOREIGN KEY
UNIQUE
NOT NULL
CHECK
INDEX
```

Dolt supports relational constructs including indexes, foreign keys and check constraints.

Use database constraints as a second line of defense after application validation.

---

# 23. APPWRITE PERMISSIONS

Use Appwrite's permission model for user-owned documents and files.

Appwrite supports access control at table/row/file level.

Examples:

Student profile:

```text
Owner → read/write
Authorized recruiter → controlled read
Institution → controlled read
Public → selected fields only
```

Private document:

```text
Owner → read/write
Authorized verifier → read
Everyone else → denied
```

Do not use broad public permissions for private user data.

---

# 24. REMOVE SUPABASE COMPLETELY

Search the repository for:

```text
supabase
@supabase
Supabase
SUPABASE_
supabase-js
PostgREST
postgresql
```

Classify every occurrence:

```text
REMOVE
REPLACE
KEEP WITH JUSTIFICATION
```

The final application must have:

```text
NO UNNECESSARY SUPABASE DEPENDENCY
```

Do not merely rename variables from:

```text
SUPABASE_URL
```

to:

```text
APPWRITE_URL
```

The integration itself must be correctly migrated.

---

# 25. SUPABASE MIGRATION MAP

Replace:

```text
Supabase Auth
→ Appwrite Auth
```

Replace:

```text
Supabase Storage
→ Appwrite Storage
```

Replace:

```text
Supabase Realtime
→ Appwrite Realtime
```

Replace:

```text
Supabase Messaging / ad-hoc email
→ Appwrite Messaging where appropriate
```

Replace:

```text
Supabase PostgreSQL
→ Dolt SQL
```

Replace:

```text
Supabase profile tables
→ Appwrite user/profile tables
```

Do not leave duplicated database systems after migration.

---

# 26. DOLT VS APPWRITE DATA DECISION RULE

When encountering existing data:

Ask:

### Is it identity/profile/user preference data?

→ Appwrite

### Is it file/document storage?

→ Appwrite Storage

### Is it realtime/messaging?

→ Appwrite services

### Is it strongly relational business data?

→ Dolt

### Does it require transactions, joins, constraints, complex SQL or historical relational querying?

→ Dolt

### Is it temporary/cache/rate limiting?

→ Upstash Redis

### Is it AI/ML processing?

→ Python FastAPI / appropriate AI storage

---

# 27. NO DUPLICATED BUSINESS LOGIC

Do not implement:

```text
Eligibility Engine in React
Eligibility Engine in Appwrite
Eligibility Engine in Spring Boot
```

Correct:

```text
Spring Boot
    ↓
Eligibility Engine
    ↓
Result
```

Frontend only displays the result.

Same rule applies to:

```text
Coins
Skill Score
Placement Status
Assessment Score
Recruitment Eligibility
Institution Rating
Company Tier
```

---

# 28. COMPLETE 220-PHASE VALIDATION

Create a validation matrix.

For every phase:

```text
Phase Number
Feature
Expected Behavior
Implemented?
Frontend
Backend
Database
Authorization
Testing
UI/UX
Security
Performance
Status
```

Allowed statuses:

```text
COMPLETE
PARTIAL
BROKEN
MISSING
MOCKED
DUPLICATED
OBSOLETE
NEEDS_MIGRATION
```

Do not use only:

```text
PASS / FAIL
```

because a feature can be partially implemented.

---

# 29. PHASE VALIDATION RULE

For every phase, ask:

```text
Does the feature exist?
Does it work?
Does it persist correctly?
Does it enforce authorization?
Does it survive refresh/restart?
Does it have proper error handling?
Does it work on mobile where applicable?
Does it integrate with the backend?
Does it use the correct database?
Does it have tests?
Does it preserve existing functionality?
```

---

# 30. MISSING FEATURE DETECTION

Search for fake implementations such as:

```text
TODO
FIXME
mock
dummy
placeholder
coming soon
return []
return {}
hardcoded
static
sample data
demo data
fake API
temporary
```

Do not automatically remove every occurrence.

Determine whether each is:

```text
legitimate seed/demo data
or
unfinished production functionality
```

---

# 31. MOCK DATA AUDIT

Identify all:

```text
mock users
mock companies
mock institutions
mock jobs
mock assessments
mock analytics
mock coin balances
mock skill scores
mock leaderboards
mock placement numbers
```

Mark them:

```text
SEED DATA
TEST DATA
PRODUCTION MOCK
```

Production functionality must use real persistence.

---

# 32. UI VALIDATION

Inspect every major screen.

Check:

```text
Alignment
Spacing
Typography
Responsive behavior
Loading states
Empty states
Error states
Accessibility
Consistency
```

Beyon visual language:

```text
#131313
#E1FB15
#32D583
#1A1A1A
#232325
#2A2A2C
```

Typography:

```text
Clash Grotesk
General Sans
```

Do not introduce random colors.

---

# 33. FULL-WIDTH ONBOARDING VALIDATION

One previously identified UI requirement is critical.

The onboarding forms must NOT be narrow centered cards.

Validate:

```text
Desktop
→ Full-width professional layout
→ 1200–1500px content region where appropriate
→ 2–3 column responsive grid

Tablet
→ 2 columns where appropriate

Mobile
→ 1 column
```

Check every:

```text
Student Onboarding
Institution Onboarding
Company Onboarding
Profile Editing
Assessment Setup
```

for alignment consistency.

---

# 34. CORE STUDENT VALIDATION

Validate:

```text
Registration
Profile
Academic Data
Placement Preference
Skills
Current Learning
Projects
Certifications
Achievements
Resume
Portfolio
Career Goals
Skill Graph
Skill Gap
Daily Challenges
Practice
Weekend Tests
Coins
XP
Streak
Achievements
Leaderboards
Career Roadmap
Recommendations
Applications
Assessments
Placement
```

---

# 35. CORE COMPANY VALIDATION

Validate:

```text
Company Registration
Verification
Company Profile
Hiring Skills
Jobs
Internships
Recruitment Drives
Institution Targeting
Eligibility Rules
Assessment Builder
Question Bank
Assessment Publication
Candidate Discovery
Applications
Shortlisting
Interviews
Offers
Placements
Analytics
```

---

# 36. CORE INSTITUTION VALIDATION

Validate:

```text
Institution Registration
Verification
Institution Profile
Student Management
Placement Willingness
Company Relationships
Recruitment Drives
Eligible Students
Applications
Placement Tracking
Placement Verification
Institution Rating
Salary Analytics
Company Tier Analytics
Skill Gap Analytics
Industry Collaboration
Events
Research
```

---

# 37. ASSESSMENT VALIDATION

Validate the complete desktop workflow:

```text
Web
 ↓
Eligibility
 ↓
Coin Check
 ↓
Application
 ↓
Assessment Session
 ↓
Desktop Launch
 ↓
Authentication
 ↓
System Check
 ↓
Identity Verification
 ↓
Proctoring
 ↓
Question Delivery
 ↓
Answer
 ↓
Code Execution
 ↓
Autosave
 ↓
Submit
 ↓
Evaluation
 ↓
Proctoring Report
 ↓
Company Result
```

Every state must be recoverable.

---

# 38. PROCTORING VALIDATION

Check:

```text
Camera
Microphone
Screen
Fullscreen
App Switching
Multiple Faces
Face Missing
Network Loss
Device Changes
Session Expiry
Assessment Recovery
```

Important:

Do not implement an automatic:

```text
"CHEATING = TRUE"
```

decision based on one signal.

Generate:

```text
events
evidence
risk indicators
```

and allow configured human review.

---

# 39. ELIGIBILITY VALIDATION

Test examples:

```text
Student satisfies all requirements
→ Eligible

CGPA below requirement
→ Ineligible

Skill below requirement
→ Ineligible

Wrong department
→ Ineligible

Wrong graduation year
→ Ineligible

Insufficient coins
→ Cannot apply

Duplicate application
→ Blocked
```

Backend must remain authoritative.

---

# 40. FOLLOW + NOTIFICATION VALIDATION

Test:

```text
Student follows company
        ↓
Company posts opportunity
        ↓
Eligibility checked
        ↓
If eligible
        ↓
Notification

If not eligible
        ↓
No actionable recruitment notification
```

Also validate:

```text
Unfollow
Notification preferences
Digest mode
Duplicate notifications
Read state
Offline recovery
```

---

# 41. COIN VALIDATION

Perform concurrency testing.

Example:

```text
Student balance = 500
Application cost = 500

Send 10 simultaneous apply requests.
```

Expected:

```text
Exactly ONE successful application
Exactly ONE coin deduction
Balance = 0
9 requests rejected/idempotently resolved
No negative balance
No duplicate application
```

This test is mandatory.

---

# 42. PLACEMENT DATA VALIDATION

Verify:

```text
Selected
Offer
Accepted
Joined
Verified Placement
```

Only verified placement data should influence:

```text
Institution Rating
Placement Rate
Salary Statistics
Company Tier Analytics
Student Career Outcomes
```

---

# 43. CERTIFICATE VALIDATION

Test:

```text
Issue
Verify
Revoke
Expire
QR
Public URL
Privacy
Duplicate ID prevention
```

Invalid credential:

```text
NOT VERIFIED
```

must never display as verified.

---

# 44. COMMUNITY VALIDATION

Test:

```text
Post
Comment
Like
Follow
Report
Moderation
Block
Delete
Spam
Abuse
```

Ensure private or moderated content is inaccessible when restricted.

---

# 45. FILE VALIDATION

Test every upload:

```text
Resume
Certificate
Image
Academic Document
Offer Letter
Project File
Feedback Attachment
```

Validate:

```text
File Type
File Size
Authorization
Private/Public Visibility
Download Access
Deletion
Replacement
```

---

# 46. SEARCH VALIDATION

Validate:

```text
Students
Companies
Institutions
Jobs
Internships
Skills
Questions
Courses
Events
Projects
Community
```

Check:

```text
Search
Pagination
Sorting
Filtering
Ranking
Permissions
```

Do not expose private profiles through search.

---

# 47. PERFORMANCE VALIDATION

Measure:

```text
Login
Dashboard
Search
Opportunity List
Opportunity Details
Application
Assessment Launch
Assessment Submit
Leaderboard
Analytics
Community Feed
Profile
```

Look for:

```text
N+1 queries
Large payloads
Repeated requests
Slow SQL
Cache misses
Memory growth
Frontend render issues
```

---

# 48. SECURITY VALIDATION

Perform an actual security audit.

Test:

```text
IDOR
Privilege Escalation
Role Tampering
Session Theft
Token Misuse
Rate Limit Bypass
Coin Replay
Duplicate Application
Unauthorized File Access
SQL Injection
XSS
CSRF where applicable
WebSocket authorization
Desktop assessment session abuse
```

Do not merely read the code.

Actually test the endpoints and workflows.

---

# 49. DATA MIGRATION PLAN

Before modifying production data:

Create:

```text
docs/migration/supabase-to-appwrite-dolt.md
```

Document:

```text
Old system
New system
Mapping
Transformation
Validation
Rollback strategy
```

---

# 50. DATA MAPPING

Create a concrete mapping.

Example:

```text
OLD SUPABASE
    ↓
NEW

auth.users
    ↓
Appwrite Auth

profiles
    ↓
Appwrite user profile table

avatars/files
    ↓
Appwrite Storage

student_profile
    ↓
Appwrite profile data

companies
    ↓
Dolt companies

institutions
    ↓
Dolt institutions

skills
    ↓
Dolt skills

jobs
    ↓
Dolt jobs

applications
    ↓
Dolt applications

coin_transactions
    ↓
Dolt coin_transactions

assessments
    ↓
Dolt assessments
```

Adjust the mapping based on the actual repository schema.

Do not blindly follow this example if the existing implementation differs.

---

# 51. MIGRATION SAFETY

Before migration:

```text
BACKUP
```

Then:

```text
Extract
 ↓
Transform
 ↓
Load
 ↓
Validate
 ↓
Reconcile
```

Calculate counts.

Example:

```text
Students:
Old = 4,250
New = 4,250

Companies:
Old = 182
New = 182
```

Investigate every mismatch.

---

# 52. MIGRATION INTEGRITY

Validate:

```text
User IDs
Profiles
Relationships
Applications
Coins
Assessments
Certifications
Placements
Documents
```

For coin data:

```text
old total ledger
==
new total ledger
```

Do not silently lose transactions.

---

# 53. SUPABASE REMOVAL VALIDATION

After migration:

Search again for:

```text
supabase
@supabase
SUPABASE_
postgresql
PostgREST
supabase-js
```

Every remaining occurrence must have a documented reason.

Ideal result:

```text
Supabase production dependency:
0
```

---

# 54. ENVIRONMENT VARIABLE MIGRATION

Remove old variables.

Delete:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL for PostgreSQL if obsolete
```

Replace with appropriate:

```text
APPWRITE_ENDPOINT
APPWRITE_PROJECT_ID
APPWRITE_API_KEY
APPWRITE_DATABASE_ID
APPWRITE_BUCKET_ID_x

DOLT_HOST
DOLT_PORT
DOLT_DATABASE
DOLT_USERNAME
DOLT_PASSWORD

UPSTASH_REDIS_URL
UPSTASH_REDIS_TOKEN
```

Never expose secrets to the frontend.

---

# 55. FRONTEND ENVIRONMENT RULE

Only public configuration can use:

```text
VITE_
```

Never put:

```text
APPWRITE_API_KEY
DOLT_PASSWORD
UPSTASH_REDIS_TOKEN
AI_PRIVATE_KEY
```

into frontend environment variables.

Appwrite client SDK configuration may expose the endpoint/project identifier when required, but server API keys must remain server-side.

---

# 56. APPWRITE SECURITY VALIDATION

Validate:

```text
Authentication
Session
Tables/Rows permissions
Storage permissions
Realtime permissions
Messaging
Server API keys
```

Appwrite permissions should follow least privilege. Appwrite supports table/row/file-level access controls.

---

# 57. DOLT SECURITY VALIDATION

If using `dolt sql-server`:

Configure authenticated SQL access.

Dolt supports branch permissions through branch-control system tables.

Do not expose an unauthenticated production Dolt SQL server.

Use:

```text
Application
 ↓
Private network / secured connection
 ↓
Authenticated Dolt SQL Server
```

---

# 58. DOLT BRANCHING POLICY

Production should use:

```text
main
```

Only controlled operations may modify production branches.

Use branches for:

```text
Schema development
Controlled data changes
Analytics experiments
Data migrations
```

Dolt branches provide isolated database revisions and support historical inspection.

---

# 59. SCHEMA REVIEW

Verify all SQL tables.

For every table:

```text
Primary Key
Foreign Keys
Unique Constraints
Indexes
Nullability
Check Constraints
Timestamps
Audit Fields
```

Look for:

```text
Missing index
Duplicate data
Nullable identifiers
Orphaned references
Unbounded text
Poor naming
```

---

# 60. API CONTRACT VALIDATION

For every API:

```text
Endpoint
Method
Authentication
Authorization
Request Schema
Response Schema
Errors
Pagination
Rate Limit
Audit
```

Generate/update:

```text
docs/api/
```

Use OpenAPI/Swagger where already configured.

---

# 61. TESTING STRATEGY

Run:

```text
Unit Tests
Integration Tests
API Tests
Database Tests
E2E Tests
Security Tests
Performance Tests
Desktop Tests
Migration Tests
```

Do not consider a feature complete because only unit tests pass.

---

# 62. E2E GOLDEN PATH

The following exact scenario MUST pass:

```text
Student Registration
        ↓
Appwrite Authentication
        ↓
Student Profile in Appwrite
        ↓
Skill references in Dolt
        ↓
Practice
        ↓
Daily Challenge
        ↓
Earn Coins
        ↓
Career Goal
        ↓
Skill Gap
        ↓
Follow Company
        ↓
Company Posts Requirement
        ↓
Eligibility Check
        ↓
Notification
        ↓
Student Applies
        ↓
Dolt Coin Transaction
        ↓
Dolt Application
        ↓
Desktop Assessment
        ↓
Proctoring
        ↓
Evaluation
        ↓
Shortlisting
        ↓
Interview
        ↓
Offer
        ↓
Placement Verification
        ↓
Portfolio Update
        ↓
Institution Analytics
```

---

# 63. SECOND GOLDEN PATH — INSTITUTION

```text
Institution Registration
        ↓
Appwrite Authentication
        ↓
Institution Profile
        ↓
Verification
        ↓
Add Students / Associate Students
        ↓
Placement-Willing Students
        ↓
Company Targets Institution
        ↓
Eligible Students
        ↓
Notification
        ↓
Applications
        ↓
Assessment
        ↓
Selection
        ↓
Placement Verification
        ↓
Institution Rating
```

---

# 64. THIRD GOLDEN PATH — COMPANY

```text
Company Registration
        ↓
Appwrite Authentication
        ↓
Company Profile
        ↓
Verification
        ↓
Create Recruitment Drive
        ↓
Define Skills
        ↓
Define Eligibility
        ↓
Set Coin Cost
        ↓
Create Assessment
        ↓
Target Institutions
        ↓
Publish
        ↓
Applications
        ↓
Assessment
        ↓
Shortlisting
        ↓
Interview
        ↓
Offer
        ↓
Placement
```

---

# 65. DESKTOP ASSESSMENT GOLDEN PATH

```text
Eligible Candidate
        ↓
Apply
        ↓
Assessment Session
        ↓
Launch Electron App
        ↓
Authenticate
        ↓
System Check
        ↓
Identity Verification
        ↓
Camera/Microphone/Screen
        ↓
Exam
        ↓
Autosave
        ↓
Network Interruption
        ↓
Recovery
        ↓
Submit
        ↓
Evaluation
        ↓
Proctoring Report
```

Every interruption must have a defined behavior.

---

# 66. MOBILE/RESPONSIVE VALIDATION

Validate web interfaces on:

```text
Mobile
Tablet
Laptop
Desktop
Large Desktop
```

Critical:

```text
Registration
Onboarding
Student Dashboard
Opportunity Search
Application
Portfolio
Community
Institution Dashboard
Company Dashboard
```

---

# 67. DESKTOP ASSESSMENT VALIDATION

Test supported environments based on what the existing Electron application actually declares.

At minimum validate the supported Windows workflow thoroughly.

Test:

```text
Install
Launch
Login
Permissions
Camera
Microphone
Screen
Exam
Network Failure
Recovery
Submission
Update
Uninstall
```

Do not claim cross-platform support unless actually tested.

---

# 68. APPWRITE AVAILABILITY STRATEGY

If Appwrite becomes temporarily unavailable:

Determine feature-specific behavior.

Authentication:

```text
Fail safely
```

Public cached content:

```text
May degrade gracefully
```

Critical profile writes:

```text
Do not silently lose data
```

Notifications:

```text
Queue/retry
```

Do not silently pretend operations succeeded.

---

# 69. DOLT AVAILABILITY STRATEGY

Dolt is authoritative for critical relational business data.

If Dolt is unavailable:

```text
Do not create fake applications
Do not deduct fake coins
Do not mark assessments completed
Do not mark placements verified
```

Return controlled service errors.

---

# 70. REDIS FAILURE STRATEGY

If Upstash Redis is unavailable:

Do not lose permanent business data.

Possible fallback:

```text
Cache miss
→ Read authoritative store
```

For rate limiting:

Use a safe fallback policy that does not accidentally remove all abuse protection.

---

# 71. MIGRATION ACCEPTANCE CRITERIA

Migration is accepted only when:

```text
[ ] Appwrite Auth works
[ ] Appwrite profiles work
[ ] Appwrite Storage works
[ ] Appwrite permissions work
[ ] Appwrite Realtime works
[ ] Messaging works where implemented
[ ] Dolt connection works
[ ] Dolt transactions work
[ ] Dolt constraints work
[ ] Dolt migrations work
[ ] Upstash works
[ ] No critical Supabase dependency remains
[ ] Data counts reconcile
[ ] Coin balances reconcile
[ ] Applications reconcile
[ ] User/profile mappings reconcile
[ ] E2E paths pass
```

---

# 72. ARCHITECTURAL ACCEPTANCE CRITERIA

The final architecture must resemble:

```text
                        BEYON
                          |
                 ┌────────┼────────┐
                 |        |        |
                 v        v        v
             Appwrite   Spring   AI Service
                 |        |        |
           ┌─────┼────┐   |        |
           |     |    |   |        |
          Auth Profile Storage     |
           |     |    |            |
           └─────┼────┘            |
                 |                 |
                 └──────┬──────────┘
                        |
                      Dolt
                        |
                    Upstash
```

---

# 73. CODE QUALITY AUDIT

Inspect:

```text
Duplicated Logic
Huge Components
Huge Services
Circular Dependencies
Unused Dependencies
Dead Code
Hardcoded Configuration
Magic Numbers
Poor Naming
Missing Validation
Unsafe Error Handling
```

Refactor only when justified.

Do not perform cosmetic rewrites of stable code.

---

# 74. SECURITY SECRETS AUDIT

Search:

```text
password
secret
token
api_key
private_key
service_key
```

Then inspect suspicious values.

No real secrets may exist in:

```text
Git
Frontend bundle
Logs
README
Documentation
Test fixtures
Seed files
```

---

# 75. DEPENDENCY AUDIT

Check:

```text
npm
Maven
Python
Electron
```

Identify:

```text
Unused
Deprecated
Vulnerable
Duplicated
Unnecessarily large
```

Do not upgrade every package blindly.

Upgrade only where compatibility has been validated.

---

# 76. DOCUMENTATION AUDIT

Update:

```text
README.md
knowledge.md
skills.md
docs/architecture.md
docs/configuration.md
docs/database.md
docs/api/
docs/security.md
docs/migration/
```

Add:

```text
APPWRITE_SETUP.md
DOLT_SETUP.md
DEPLOYMENT.md
MIGRATION_RUNBOOK.md
VALIDATION_REPORT.md
```

---

# 77. APPWRITE DOCUMENTATION REQUIREMENTS

Document:

```text
Appwrite Project
Endpoint
Project ID
Database IDs
Table IDs
Bucket IDs
Permissions
Storage
Messaging
Realtime
Authentication
```

Never document secrets.

Appwrite supports self-hosting as well as managed cloud usage; if self-hosting is used, document the operational requirements separately.

---

# 78. DOLT DOCUMENTATION REQUIREMENTS

Document:

```text
Database
Host
Port
Authentication
Schema
Migrations
Branch strategy
Backup strategy
Remote strategy
SQL access
Transaction policy
```

Dolt's SQL server is MySQL-compatible and can be used with standard MySQL clients/drivers.

---

# 79. FINAL PERFORMANCE CHECK

Measure the real application.

Do not invent performance numbers.

Record actual measurements for:

```text
Landing
Login
Profile
Dashboard
Skill Search
Opportunity Search
Application
Assessment Launch
Assessment Submit
Leaderboard
Analytics
```

Record:

```text
p50
p95
error rate
query time
cache hit rate
```

---

# 80. FINAL SECURITY CHECK

Perform actual tests for:

```text
Unauthenticated access
Wrong role
Forged user ID
Forged company ID
Forged institution ID
Forged assessment ID
Coin replay
Application replay
Document access
Private profile access
Admin access
Dolt SQL access
Appwrite server key leakage
```

---

# 81. FINAL FEATURE MATRIX

Create:

```text
docs/VALIDATION_MATRIX.md
```

Columns:

```text
Phase
Feature
Frontend
Backend
Appwrite
Dolt
Redis
Desktop
Security
Tests
Status
Issues
```

Status must be one of:

```text
COMPLETE
PARTIAL
BROKEN
MISSING
MOCKED
NEEDS_MIGRATION
```

---

# 82. FINAL MISSING-FEATURE REPORT

Create:

```text
docs/MISSING_FEATURES.md
```

For each missing feature:

```text
Phase
Feature
Expected
Current
Missing Components
Priority
Dependencies
Recommended Fix
```

Priority:

```text
P0 Critical
P1 High
P2 Medium
P3 Low
```

---

# 83. FINAL BUG REPORT

Create:

```text
docs/BUGS.md
```

For every bug:

```text
ID
Severity
Component
Steps to Reproduce
Expected
Actual
Root Cause
Fix
Regression Test
Status
```

---

# 84. FINAL ARCHITECTURE REPORT

Create:

```text
docs/FINAL_ARCHITECTURE.md
```

Include:

```text
Frontend
Spring Boot
Appwrite
Dolt
Upstash
AI Service
Electron
Storage
Realtime
Messaging
Authentication
Authorization
```

Include diagrams.

---

# 85. FINAL DATA REPORT

Create:

```text
docs/DATA_OWNERSHIP.md
```

Every entity must have exactly one source of truth.

Example:

```text
Entity                  Source
----------------------------------------
Identity                Appwrite Auth
User Profile            Appwrite
User Preferences        Appwrite
Files                   Appwrite Storage
Company                 Dolt
Institution             Dolt
Skill                   Dolt
Question                Dolt
Assessment              Dolt
Application             Dolt
Coins                   Dolt
Placement               Dolt
Cache                   Upstash
Temporary state         Upstash
```

---

# 86. FINAL MIGRATION REPORT

Create:

```text
docs/MIGRATION_REPORT.md
```

Include:

```text
Supabase dependencies removed
Appwrite integrations
Dolt integrations
Data migrated
Data counts
Reconciliation
Failed records
Recovery plan
Rollback plan
```

---

# 87. FINAL AUTOMATED VALIDATION

Create an automated validation command.

Example:

```bash
npm run validate
```

and/or:

```bash
./mvnw test
```

plus project-specific validation commands.

The validation process should verify:

```text
Environment
Build
Tests
Database connectivity
Appwrite connectivity
Dolt connectivity
Redis connectivity
API health
Security checks
Migration consistency
```

Do not make validation depend on manual inspection alone.

---

# 88. NO FALSE COMPLETION

The agent MUST NOT say:

```text
"Everything is complete"
```

unless:

* The feature works.
* Data persists.
* APIs work.
* Authorization works.
* Tests pass.
* Migration is verified.
* No critical known issue exists.

If something is incomplete, report it honestly.

---

# 89. IMPLEMENTATION STRATEGY

Do NOT attempt to fix everything simultaneously.

Use this order:

```text
1. Inventory
2. Architecture Audit
3. Supabase Dependency Audit
4. Appwrite Integration
5. Dolt Integration
6. Data Migration
7. Authentication Validation
8. Core Business Data Validation
9. Student Validation
10. Company Validation
11. Institution Validation
12. Recruitment Validation
13. Assessment Validation
14. Proctoring Validation
15. Community Validation
16. Analytics Validation
17. Security Validation
18. Performance Validation
19. E2E Validation
20. Final Documentation
```

---

# 90. PHASE-BY-PHASE REPAIR STRATEGY

If a phase is broken:

Do not jump randomly to a later phase.

Resolve dependencies first.

Example:

```text
Phase 19 Eligibility Broken
        ↓
Fix Phase 19
        ↓
Re-test Phase 20
        ↓
Re-test affected later phases
```

Maintain a dependency graph.

---

# 91. REGRESSION RULE

Every fix must be tested against previously working functionality.

Example:

Changing:

```text
Authentication
```

requires re-testing:

```text
Profile
Recruitment
Assessment
Desktop
Notifications
```

Changing:

```text
Dolt schema
```

requires checking:

```text
Applications
Coins
Assessment
Placement
Analytics
```

---

# 92. UI/UX VALIDATION

Use the established Beyon design system.

### Core:

```css
--color-primary: #E1FB15;
--color-secondary: #32D583;
--color-white: #FFFFFF;
--color-black: #131313;

--color-surface: #1A1A1A;
--color-surface-elevated: #232325;
--color-border: #2A2A2C;
--color-text-secondary: #B5B5B8;
--color-text-muted: #8A8A8E;

--color-warning: #FFB020;
--color-error: #FF5C5C;
```

### Typography:

```text
Clash Grotesk
General Sans
```

### Shape:

```text
12px
20px
32px
40px
```

Use the design system consistently.

---

# 93. UI QUALITY RULE

Do not accept:

```text
Misaligned Forms
Narrow Onboarding
Random Card Widths
Inconsistent Buttons
Different Border Radius
Different Colors
Poor Mobile Layout
Missing Empty States
Missing Loading States
Missing Error States
```

Every major screen must receive visual QA.

---

# 94. FULL-WIDTH FORM RULE

All major onboarding/profile/admin/recruitment creation forms must use appropriate width.

Desktop:

```text
1200px–1500px content region where appropriate
```

Use:

```text
2–3 columns
```

instead of a tiny centered form.

Do not blindly set every form to 100% width; maintain sensible field widths inside the full layout.

---

# 95. PERFORMANCE RULE

Do not optimize based on assumptions.

Measure first.

Then optimize:

```text
Database
Redis
API
Frontend
Images
Search
Analytics
```

Record before/after numbers.

---

# 96. FINAL PRODUCTION ACCEPTANCE

The application can be considered validated only when:

```text
[ ] Appwrite is fully integrated
[ ] Supabase removed
[ ] Dolt is authoritative SQL database
[ ] Upstash Redis works
[ ] User authentication works
[ ] User profile data lives in Appwrite
[ ] Business relational data lives in Dolt
[ ] Files live in Appwrite Storage
[ ] Realtime works
[ ] Notifications work
[ ] All critical transactions are atomic
[ ] Coin ledger is consistent
[ ] Eligibility is backend-authoritative
[ ] Recruitment works
[ ] Desktop assessment works
[ ] Proctoring works
[ ] Placement verification works
[ ] Institution analytics work
[ ] Company analytics work
[ ] Student analytics work
[ ] Community works
[ ] Mentorship works
[ ] Certification verification works
[ ] Public portfolio works
[ ] Privacy controls work
[ ] RBAC works
[ ] Audit logging works
[ ] Security tests pass
[ ] E2E tests pass
[ ] Performance tests pass
[ ] Migration reconciles
[ ] Documentation is complete
```

---

# 97. FINAL AGENT REPORT

Create:

```text
docs/FINAL_VALIDATION_REPORT.md
```

Use this structure:

## Executive Summary

## Architecture

## Appwrite Migration

## Dolt Migration

## Upstash

## Phase Validation

## Feature Completeness

## Security

## Performance

## Data Integrity

## Testing

## Known Issues

## Critical Issues

## Remaining Work

## Release Recommendation

Possible final status:

```text
READY_FOR_PRODUCTION
READY_WITH_NON_CRITICAL_ISSUES
NOT_READY
```

---

# 98. FINAL RULE

Do not optimize the codebase for the roadmap.

Optimize the codebase for the actual product.

If a previous phase introduced a technically incorrect design:

1. Identify it.
2. Explain it.
3. Fix it.
4. Preserve its intended functionality.
5. Add a regression test.
6. Document the architecture change.

Never preserve a bad implementation simply because an earlier phase specified it.

---

# 99. FINAL PRODUCT PRINCIPLE

Beyon must ultimately provide:

```text
LEARN
 ↓
PRACTICE
 ↓
BUILD SKILLS
 ↓
EARN COINS
 ↓
GET CERTIFIED
 ↓
BUILD VERIFIED PORTFOLIO
 ↓
FOLLOW COMPANIES
 ↓
MEET ELIGIBILITY
 ↓
SPEND COINS
 ↓
APPLY
 ↓
PROCTORED ASSESSMENT
 ↓
INTERVIEW
 ↓
OFFER
 ↓
VERIFIED PLACEMENT
 ↓
CAREER GROWTH
```

And simultaneously:

```text
INDUSTRY DEMAND
 ↓
SKILL REQUIREMENTS
 ↓
STUDENT SKILL DATA
 ↓
SKILL GAP
 ↓
LEARNING
 ↓
ASSESSMENT
 ↓
HIRING OUTCOME
 ↓
INSTITUTION ANALYTICS
 ↓
BETTER INDUSTRY-ACADEMIA ALIGNMENT
```

---

# 100. FINAL COMMAND

After reading this prompt, DO NOT immediately rewrite the application.

First produce an audit:

```text
1. Repository inventory
2. Existing architecture
3. Current database architecture
4. Current Supabase dependencies
5. Appwrite migration plan
6. Dolt migration plan
7. Current phase completion matrix
8. Critical bugs
9. Security risks
10. Data migration risks
11. Recommended execution order
```

Then begin implementation in dependency order.

Do not skip the audit.

Do not claim features are complete without evidence.

Do not delete working functionality.

Do not use mock data as a substitute for missing production logic.

Do not leave Supabase partially connected after migration.

The final system must have a clean, explicit data ownership model:

```text
APPWRITE
→ Identity + User Information + Files + Realtime + Messaging

DOLT
→ Relational Business Data + SQL Transactions + Versioned SQL Data

UPSTASH
→ Cache + Rate Limiting + Temporary State

SPRING BOOT
→ Business Logic + API + Authorization + Orchestration

PYTHON
→ AI / ML

ELECTRON
→ Secure Assessment Environment
```

The final result must be a real, testable, secure Beyon application—not a collection of UI prototypes.
