# Beyon — Comprehensive Seed Data, Test Accounts & Realistic Test Environment

## PURPOSE

Build a complete, repeatable, realistic test-data generation and seeding system for Beyon.

The objective is to create a fully populated DEVELOPMENT/STAGING environment that allows the entire Beyon application to be tested end-to-end.

The seed system must create real persisted records in:

- Appwrite
- Dolt
- Upstash Redis where appropriate

The data must be usable by the actual application.

Do NOT create fake data only inside frontend JSON files.

Do NOT create temporary in-memory mocks.

Do NOT create frontend-only demo data.

Every important seed record must be persisted in the correct backend source of truth.

---

# 1. CRITICAL ENVIRONMENT RULE

This seed system is ONLY for:

- development
- local testing
- staging
- QA

NEVER run destructive seed/reset commands against production.

The seed system must validate:

```text
APP_ENV
ENVIRONMENT
NODE_ENV
SPRING_PROFILES_ACTIVE

or the project's equivalent environment variable.

If the environment is:

production
prod
live

the seed command MUST REFUSE TO RUN.

Example:

ERROR:
Seed operations are disabled in production.

Require an explicit override only if a developer intentionally wants it.

2. SEED MODES

Implement multiple seed modes.

Reset

Completely reset test data.

seed:reset

Only allowed in development/staging.

Base Seed

Creates the minimum complete Beyon test environment.

seed:base
Large Seed

Creates realistic high-volume testing data.

seed:large
Assessment Seed

Creates complete assessment/test data.

seed:assessment
Recruitment Seed

Creates companies, jobs, drives, applications and placements.

seed:recruitment
Community Seed

Creates posts, discussions, comments, follows and notifications.

seed:community
Full Seed

Creates everything.

seed:full

Recommended default:

seed:full --environment=staging
Incremental Seed

Adds missing records without duplicating existing records.

seed:incremental
3. SEED DATA PRINCIPLES

The seed system must be:

Deterministic

Given the same seed value:

SEED=20260826

the same data should be generated.

Repeatable

Running the seed twice should not create uncontrolled duplicates.

Referentially valid

Every foreign key/reference must point to an existing record.

Realistic

Data should resemble actual students, institutions, companies, recruiters and assessments.

Diverse

Include:

eligible users
ineligible users
strong users
weak users
incomplete users
verified users
unverified users
placed users
unplaced users
active applications
rejected applications
assessment failures
proctoring flags
4. DATA SOURCE OF TRUTH

Follow the Beyon architecture.

Appwrite

Store:

User identity
Authentication
User-facing profile information
Preferences
Privacy
Notification preferences
Onboarding state
Files
Dolt

Store:

Companies
Institutions
Departments
Skills
Topics
Questions
Assessments
Applications
Jobs
Internships
Recruitment
Coin transactions
XP
Placements
Certifications
Interviews
Community relational data
Analytics-ready data
Upstash Redis

Store only:

Cache
Temporary state
Rate-limit counters
Leaderboard acceleration
Unread counters
Short-lived test/session state

Do NOT use Redis as the permanent source of truth.

5. SEED VOLUME

Create at least:

Users
2,000 students
100 faculty
50 placement officers
100 institution administrators
100 company recruiters
50 company administrators
50 mentors
100 alumni
20 moderators
10 platform admins
5 super admins

At least:

2,585 total accounts

The exact number can be configurable.

6. TEST ACCOUNTS

Create clearly identifiable test accounts.

Use a dedicated domain such as:

@example.beyon.test

or another reserved/non-production domain.

DO NOT use real people's email addresses.

7. REQUIRED TEST LOGIN ACCOUNTS

Create fixed accounts whose credentials are documented.

Super Admin
role: SUPER_ADMIN
email: superadmin@example.beyon.test
password: "BeyonTest!2026#Super"
Admin
role: ADMIN
email: admin@example.beyon.test
password: "BeyonTest!2026#Admin"
Moderator
role: MODERATOR
email: moderator@example.beyon.test
password: "BeyonTest!2026#Moderator"
Student — Strong
role: STUDENT
email: student.strong@example.beyon.test
password: "BeyonTest!2026#Student1"
Student — Weak
role: STUDENT
email: student.weak@example.beyon.test
password: "BeyonTest!2026#Student2"
Student — Placement Willing
role: STUDENT
email: student.placement@example.beyon.test
password: "BeyonTest!2026#Student3"
Student — Not Placement Willing
role: STUDENT
email: student.independent@example.beyon.test
password: "BeyonTest!2026#Student4"
Student — Incomplete Profile
role: STUDENT
email: student.incomplete@example.beyon.test
password: "BeyonTest!2026#Student5"
Company Recruiter
role: COMPANY_RECRUITER
email: recruiter@example.beyon.test
password: "BeyonTest!2026#Recruiter"
Company Admin
role: COMPANY_ADMIN
email: company.admin@example.beyon.test
password: "BeyonTest!2026#Company"
Institution Admin
role: INSTITUTION_ADMIN
email: institution.admin@example.beyon.test
password: "BeyonTest!2026#Institution"
Placement Officer
role: PLACEMENT_OFFICER
email: placement@example.beyon.test
password: "BeyonTest!2026#Placement"
Faculty
role: FACULTY
email: faculty@example.beyon.test
password: "BeyonTest!2026#Faculty"
Mentor
role: MENTOR
email: mentor@example.beyon.test
password: "BeyonTest!2026#Mentor"
Alumni
role: ALUMNI
email: alumni@example.beyon.test
password: "BeyonTest!2026#Alumni"

IMPORTANT:

These credentials are TEST credentials only.

Clearly label them in:

docs/TEST_ACCOUNTS.md
8. PASSWORD HANDLING

Passwords must be created through the actual Appwrite authentication flow.

DO NOT manually insert password hashes into Dolt.

DO NOT store passwords in:

seed SQL
JSON
CSV
Dolt
logs
frontend source

The seed script should create accounts through the appropriate Appwrite server/admin API.

9. STUDENT TEST PERSONA DATA

Every seeded student should include realistic:

id:
appwrite_user_id:
name:
email:
phone:
country:
state:
city:
institution_id:
department_id:
degree:
academic_year:
graduation_year:
cgpa:
placement_status:
career_goal:
preferred_roles:
preferred_industries:
work_mode:
profile_completion:

Example:

name: Arjun Kumar
degree: B.Tech
department: Computer Science and Engineering
graduation_year: 2027
cgpa: 8.42
placement_status: PLACEMENT_WILLING
career_goal: Backend Developer
preferred_roles:
  - Backend Developer
  - Java Developer
preferred_industries:
  - SaaS
  - FinTech
work_mode:
  - Hybrid
  - Remote
10. STUDENT PERSONA TYPES

Create realistic personas.

Persona A — High Performer
skill_score: 91
cgpa: 9.1
coins: 2450
xp: 18400
streak: 87
certifications: 8
projects: 6
assessment_average: 91
placement_status: PLACEMENT_WILLING
Persona B — Average Student
skill_score: 68
cgpa: 7.6
coins: 420
xp: 6200
streak: 12
certifications: 3
projects: 2
assessment_average: 70
placement_status: PLACEMENT_WILLING
Persona C — Weak Student
skill_score: 42
cgpa: 6.4
coins: 80
xp: 1800
streak: 2
certifications: 0
projects: 1
assessment_average: 48
placement_status: PLACEMENT_WILLING
Persona D — Independent Student
skill_score: 79
cgpa: 8.3
coins: 730
placement_status: NOT_SEEKING_PLACEMENT

This student MUST still be able to:

search jobs
follow companies
apply independently
take assessments
participate in challenges
11. INSTITUTION DATA

Create at least:

25 institutions

Each institution should contain:

name:
code:
type:
website:
country:
state:
city:
established_year:
accreditation:
rating:
placement_rate:
average_package:
highest_package:
tier1_placement_count:
tier2_placement_count:
student_count:

Example:

name: Beyon Institute of Technology
code: BIT001
type: Engineering College
city: Chennai
state: Tamil Nadu
accreditation:
  - NAAC
placement_rate: 87.4
average_package: 7.8
highest_package: 32.0

Use fictional institution names unless explicitly configured for test data.

12. INSTITUTION QUALITY DISTRIBUTION

Create institutions with different performance:

5 elite
7 strong
8 average
3 weak
2 new/unverified

This allows testing:

Institution rating
Leaderboards
Benchmarking
Company targeting
Placement analytics
13. DEPARTMENT DATA

Create departments such as:

CSE
IT
ECE
EEE
MECH
CIVIL
AIDS
AIML
CYS
CSBS

Each institution should have some subset.

14. COMPANY DATA

Create at least:

100 companies

Distribute:

20 Tier 1
35 Tier 2
30 Tier 3
15 Startup/Emerging

Each company:

name:
slug:
industry:
type:
website:
headquarters:
company_tier:
employee_range:
verification_status:
average_package:
hiring_skills:

Use fictional company names unless the staging environment specifically requires named test companies.

15. COMPANY PERSONAS

Create:

High-volume recruiter
Startup recruiter
MNC recruiter
Institution-focused recruiter
Public hiring recruiter
Internship recruiter
Technical recruiter

Each recruiter should belong to a company.

16. SKILL TAXONOMY DATA

Create a large realistic taxonomy.

At least:

20 categories
200 skills
1,000 topics/subtopics

Categories:

Programming
Frontend
Backend
Database
Cloud
DevOps
AI/ML
Data Science
Cybersecurity
Mobile
UI/UX
Testing
System Design
Soft Skills
Tools
17. CORE SKILLS

At minimum include:

Java
Python
C
C++
JavaScript
TypeScript
Go
Rust

React
Vue
Angular
Next.js
HTML
CSS

Spring Boot
Node.js
Express
NestJS
Django
FastAPI

SQL
PostgreSQL
MySQL
MongoDB
Redis

AWS
Azure
Docker
Kubernetes
Terraform

Machine Learning
Deep Learning
NLP
Computer Vision

Git
GitHub
Linux

DSA
System Design
Operating Systems
Computer Networks
DBMS
OOP
18. QUESTION BANK

Create at least:

10,000 questions

Distribution:

40% Easy
40% Medium
15% Hard
5% Expert

Types:

MCQ
Multiple Select
True/False
Coding
SQL
Debugging
Output Prediction
Aptitude
Short Answer

Each question must reference:

skill:
topic:
subtopic:
difficulty:
question_type:
score:
time_limit:
tags:
19. CODING QUESTIONS

Create at least:

2,000 coding questions

Languages:

Java
Python
C++
JavaScript
TypeScript

Each coding problem should contain:

id:
title:
description:
input_format:
output_format:
constraints:
starter_code:
public_test_cases:
hidden_test_cases:
expected_output:
difficulty:
skill:
topic:

Do NOT expose hidden test cases to candidates.

20. SQL QUESTIONS

Create at least:

500 SQL questions

Include:

SELECT
WHERE
JOIN
GROUP BY
HAVING
Subqueries
CTE
Window Functions
Aggregation
Date functions
String functions

Use controlled schemas/test datasets for evaluation.

21. DAILY CHALLENGES

Create at least:

365 daily challenge records

for testing.

Include:

date:
skill:
topic:
difficulty:
question_id:
reward_coins:
reward_xp:

Create several challenge states:

completed
active
missed
expired
locked
22. WEEKEND TESTS

Create at least:

20 weekend tests

Each test:

name:
duration:
sections:
questions:
passing_score:
coin_reward:
xp_reward:

Include tests for:

Java
SQL
DSA
Python
Web Development
Aptitude
Backend
Frontend
23. COMPANY ASSESSMENTS

Create at least:

50 company assessments

Distribute:

10 easy
20 medium
15 hard
5 highly selective

Each assessment:

company_id:
title:
role:
duration:
coin_cost:
passing_score:
proctoring_level:
question_count:
skills:
eligibility:
status:
24. COMPANY APPLICATION COSTS

Use realistic test values:

50
100
150
250
500
750
1000

Create multiple companies at each level.

25. ELIGIBILITY TEST CASES

Create deliberate eligibility scenarios.

Case 1
skill_requirement: satisfied
cgpa_requirement: satisfied
coin_requirement: satisfied
department: satisfied
result: ELIGIBLE
Case 2
skill_requirement: failed
cgpa_requirement: satisfied
coin_requirement: satisfied
result: INELIGIBLE
Case 3
skill_requirement: satisfied
cgpa_requirement: failed
result: INELIGIBLE
Case 4
skills: satisfied
coins: insufficient
result: CANNOT_APPLY
Case 5
student: placement_not_willing
company: public_job
result: CAN_APPLY_INDEPENDENTLY
Case 6
student: placement_not_willing
company: institution_targeted_drive
result: NOT_ELIGIBLE_FOR_CAMPUS_DRIVE
26. COIN DATA

Create realistic coin transaction history.

Each selected student should have:

50–200 transactions

Examples:

type: EARN
reason: DAILY_CHALLENGE
amount: 20

type: EARN
reason: WEEKEND_TEST
amount: 100

type: EARN
reason: CERTIFICATION
amount: 250

type: SPEND
reason: COMPANY_ASSESSMENT
amount: 500

Do not directly seed only the balance.

Seed the ledger.

Then calculate/verify the balance from transactions.

27. XP DATA

Create:

skill_xp_transactions

Examples:

reason: QUESTION_SOLVED
xp: 10

reason: DAILY_CHALLENGE
xp: 50

reason: WEEKEND_TEST
xp: 200

reason: PROJECT_COMPLETED
xp: 500
28. STREAK DATA

Create:

7-day
14-day
30-day
60-day
100-day

students.

Also create:

broken streak
recovered streak
inactive user
29. ACHIEVEMENTS

Seed all major achievements.

Examples:

First Solve
10 Questions
50 Questions
100 Questions
500 Questions
7-Day Streak
30-Day Streak
100-Day Streak
First Certification
First Internship
First Assessment
Top 10%
Industry Ready
First Placement
Hackathon Winner

Assign achievements realistically.

30. CERTIFICATIONS

Create at least:

500 certifications

with statuses:

PENDING
VERIFIED
REJECTED
EXPIRED

Use fictional certification providers where appropriate.

Never label test certificates as real external credentials.

31. PROJECT DATA

Create at least:

1,000 student projects

Examples:

name: Campus Connect
technologies:
  - React
  - Node.js
  - PostgreSQL
github_url:
live_url:
verification_status:

Create mixed states:

verified
pending
unverified
rejected
32. PORTFOLIO DATA

Create:

public profiles
private profiles
company-visible profiles
institution-visible profiles

Test visibility rules.

33. JOBS

Create at least:

500 jobs

Statuses:

DRAFT
PUBLISHED
CLOSING_SOON
CLOSED
CANCELLED

Roles:

Frontend Developer
Backend Developer
Full Stack Developer
Java Developer
Python Developer
Data Analyst
Data Scientist
ML Engineer
DevOps Engineer
Cloud Engineer
QA Engineer
Cybersecurity Engineer
34. INTERNSHIPS

Create:

300 internships

Include:

Remote
Hybrid
Onsite
Paid
Unpaid
Stipend
35. RECRUITMENT DRIVES

Create:

100 recruitment drives

States:

DRAFT
PUBLISHED
ACTIVE
ASSESSMENT
INTERVIEW
COMPLETED
CANCELLED

Include:

public drives
institution-targeted drives
skill-targeted drives
campus drives
independent recruitment
36. APPLICATION DATA

Create at least:

20,000 applications

Distribution:

Applied
Assessment Pending
Assessment Completed
Shortlisted
Interview
Selected
Rejected
Withdrawn
Expired

The application records must reference real seeded:

student
company
job
recruitment_drive
37. ASSESSMENT ATTEMPTS

Create at least:

5,000 assessment attempts

States:

NOT_STARTED
STARTED
IN_PROGRESS
SUBMITTED
AUTO_SUBMITTED
ABANDONED
EXPIRED
38. ASSESSMENT RESULTS

Create realistic:

score
accuracy
time
section scores
skill scores
percentile

Include:

top performers
average performers
failures
edge cases
perfect scores
near-pass scores
39. PROCTORING TEST DATA

Create realistic proctoring events.

Examples:

event_type: FACE_NOT_DETECTED
severity: WARNING
timestamp:
session_id:

Other events:

MULTIPLE_FACE
CAMERA_DISCONNECTED
MIC_DISCONNECTED
SCREEN_CAPTURE_INTERRUPTED
FOCUS_LOST
FULLSCREEN_EXIT
NETWORK_INTERRUPTION
SUSPICIOUS_AUDIO

Create assessment sessions with:

0 violations
1 warning
2 warnings
critical event
multiple events
review required
cleared

These records are TEST DATA ONLY.

Never represent them as actual misconduct.

40. INTERVIEW DATA

Create:

2,000 interview records

Types:

Technical
HR
Managerial
Behavioral
Final

Statuses:

Scheduled
Completed
Cancelled
Rescheduled
41. INTERVIEW FEEDBACK

Create realistic structured feedback:

technical: 8
problem_solving: 9
communication: 7
teamwork: 8
overall: 8.1
recommendation: HIRE

Include:

Strong Hire
Hire
Hold
Reject
42. OFFER DATA

Create:

500 offers

Statuses:

DRAFT
SENT
VIEWED
ACCEPTED
REJECTED
EXPIRED
43. PLACEMENT DATA

Create:

300 verified placements
200 pending placements
100 rejected/unverified placement records

Include:

student:
company:
institution:
role:
salary:
company_tier:
placement_year:
verification_status:
joining_status:
44. INSTITUTION RATING DATA

Create historical snapshots.

institution_rating_snapshots

Include:

academic_score:
placement_score:
salary_score:
industry_score:
skill_score:
overall_score:
calculation_version:
period:

Do not hardcode the final rating independently of the underlying metrics.

45. COMPANY TIER DATA

Create test companies classified as:

TIER_1
TIER_2
TIER_3
STARTUP
EMERGING

Provide data suitable for testing filtering and analytics.

46. FOLLOW DATA

Create at least:

20,000 follow relationships

Examples:

student → company
student → institution
student → student
institution → company
company → institution

Include:

active
unfollowed history

Do not create duplicate active follows.

47. NOTIFICATION DATA

Create at least:

50,000 notifications

Types:

RECRUITMENT
ASSESSMENT
APPLICATION
COIN
CHALLENGE
ACHIEVEMENT
MENTORSHIP
EVENT
COMMUNITY
SYSTEM

States:

UNREAD
READ
ARCHIVED

Create users with:

0 unread
1 unread
10 unread
100 unread
48. COMMUNITY DATA

Create:

5,000 posts
20,000 comments
50,000 likes
10,000 follows
2,000 reports

Post types:

QUESTION
DISCUSSION
ACHIEVEMENT
PROJECT
OPPORTUNITY
EVENT
ANNOUNCEMENT

Include:

normal
popular
reported
moderated
removed
49. MENTORSHIP DATA

Create:

200 mentors
1,000 mentorship requests
500 active mentorships

States:

REQUESTED
ACCEPTED
ACTIVE
COMPLETED
REJECTED
CANCELLED

Create session data.

50. EVENT DATA

Create:

200 events

Types:

Workshop
Hackathon
Guest Lecture
FDP
Webinar
Career Fair
Industry Visit
Technical Contest

Create registrations and attendance records.

51. LIVE INDUSTRY PROJECTS

Create:

100 industry projects
500 student applications
200 active participants

Include:

milestones
tasks
submissions
feedback
completion
52. RESEARCH/COLLABORATION DATA

Create:

50 research collaborations
50 consultancy projects
50 industry-academia partnerships

Statuses:

PROPOSAL
REVIEW
ACCEPTED
ACTIVE
COMPLETED
REJECTED
53. REFERRAL DATA

Create:

500 referrals

Include:

active
expired
accepted
rejected
reported
54. CAREER ROADMAP DATA

Create career paths:

Frontend Developer
Backend Developer
Full Stack Developer
Data Analyst
Data Scientist
ML Engineer
DevOps Engineer
Cloud Engineer
Cybersecurity Engineer
Mobile Developer

For each:

skills
topics
prerequisites
courses
certifications
projects
assessment
55. SKILL GAP TEST DATA

Create students with deliberately different gaps.

Example:

career_goal: Backend Developer

skills:
  Java: 90
  SQL: 82
  Spring Boot: 55
  Docker: 32
  AWS: 21

Expected recommendation:

Docker
AWS
Spring Boot
56. AI TEST DATA

Create representative documents/text for testing:

resumes
project descriptions
career questions
job descriptions
skill descriptions

The AI service should be able to analyze these.

Use synthetic data only.

57. SEARCH DATA

Ensure sufficient data for testing:

student search
company search
institution search
job search
skill search
question search
community search
event search

Create duplicate-like names and overlapping keywords to test ranking.

Example:

Java Developer
Senior Java Developer
Junior Java Developer
Java Backend Engineer
Java Spring Engineer
58. REALTIME TEST DATA

Create active events that can be triggered during testing.

Examples:

type: NEW_OPPORTUNITY
target_user:
company:
eligibility:
notification:

Also create:

application status update
interview scheduled
new message
mentor response
achievement unlocked
coin reward

The test environment should allow a developer to trigger these events through supported APIs.

59. REALTIME EVENT SIMULATOR

Create a development-only utility:

npm run realtime:test

or equivalent.

It should be able to trigger:

New Notification
Application Status Change
Assessment Invitation
Coin Reward
Achievement
Interview Update
Message
Company Post
Institution Announcement

The events must pass through the same backend mechanisms used by the real application.

Do NOT directly manipulate frontend state.

60. ASSESSMENT LOGIN TEST CASES

Create a special set of assessment test users.

Assessment Candidate 1
email: exam.candidate1@example.beyon.test
password: "BeyonTest!2026#Exam1"
role: STUDENT
eligibility: PASS
coins: 1000
assessment_state: READY
Assessment Candidate 2
email: exam.candidate2@example.beyon.test
password: "BeyonTest!2026#Exam2"
role: STUDENT
eligibility: FAIL
coins: 1000
assessment_state: BLOCKED
Assessment Candidate 3
email: exam.candidate3@example.beyon.test
password: "BeyonTest!2026#Exam3"
role: STUDENT
eligibility: PASS
coins: 50
assessment_state: INSUFFICIENT_COINS
Assessment Candidate 4
email: exam.candidate4@example.beyon.test
password: "BeyonTest!2026#Exam4"
role: STUDENT
eligibility: PASS
coins: 1000
assessment_state: IN_PROGRESS
Assessment Candidate 5
email: exam.candidate5@example.beyon.test
password: "BeyonTest!2026#Exam5"
role: STUDENT
eligibility: PASS
coins: 1000
assessment_state: SUBMITTED
61. ASSESSMENT FIXTURE DATA

Create a fixed assessment:

id: TEST-JAVA-BACKEND-001

title: Java Backend Recruitment Assessment

duration_minutes: 90

coin_cost: 250

passing_score: 65

proctoring_level: STANDARD

skills:
  - Java
  - SQL
  - Spring Boot

sections:

  - name: Java Fundamentals
    questions: 10
    marks: 20

  - name: SQL
    questions: 5
    marks: 10

  - name: Coding
    questions: 3
    marks: 40

  - name: Backend Concepts
    questions: 10
    marks: 30
62. ASSESSMENT ANSWER FIXTURES

Create deterministic answer sets.

Candidate A
java: 90%
sql: 80%
coding: 95%
backend: 85%
overall: 88%
result: PASS
Candidate B
java: 50%
sql: 40%
coding: 35%
backend: 48%
overall: 44%
result: FAIL
Candidate C

Create:

borderline pass

Example:

overall: 65%
result: PASS
Candidate D

Create:

perfect score
Candidate E

Create:

incomplete submission
63. PROCTORING FIXTURES

Create deterministic development-only sessions:

Clean
violations: 0
risk: LOW
decision: CLEAR
Warning
violations:
  - FACE_NOT_DETECTED
risk: MEDIUM
decision: REVIEW
Multiple warnings
violations:
  - FOCUS_LOST
  - FULLSCREEN_EXIT
risk: HIGH
decision: REVIEW
Critical
violations:
  - MULTIPLE_FACE
  - SCREEN_CAPTURE_INTERRUPTED
risk: HIGH
decision: REVIEW_REQUIRED

The seed data must never imply actual misconduct by real people.

64. TEST ACCOUNT SCENARIO MATRIX

Create a file:

docs/TEST_SCENARIOS.md

Example:

Account	Purpose
student.strong@...	Strong student
student.weak@...	Weak student
student.placement@...	Campus placement
student.independent@...	Independent hiring
student.incomplete@...	Onboarding
exam.candidate1@...	Assessment pass
exam.candidate2@...	Assessment ineligible
exam.candidate3@...	Insufficient coins
exam.candidate4@...	In-progress assessment
exam.candidate5@...	Submitted assessment
recruiter@...	Recruiter
institution.admin@...	Institution
placement@...	Placement officer
mentor@...	Mentor
admin@...	Admin
superadmin@...	Super admin
65. LOGIN TEST CHECKLIST

Test every account.

For each:

Login
Session Creation
Session Persistence
Refresh
Logout
Role Routing
Authorization
Profile Loading

Then test wrong passwords.

Then test:

Suspended user
Unverified company
Unverified institution
Incomplete student
Expired session
66. TEST FILE STRUCTURE

Create:

test-data/
├── accounts/
│   ├── users.yaml
│   ├── test-accounts.yaml
│
├── institutions/
│   └── institutions.yaml
│
├── companies/
│   └── companies.yaml
│
├── skills/
│   ├── categories.yaml
│   ├── skills.yaml
│   ├── topics.yaml
│   └── subtopics.yaml
│
├── questions/
│   ├── mcq.yaml
│   ├── coding.yaml
│   └── sql.yaml
│
├── assessments/
│   ├── assessments.yaml
│   ├── attempts.yaml
│   └── proctoring.yaml
│
├── recruitment/
│   ├── jobs.yaml
│   ├── drives.yaml
│   ├── applications.yaml
│   ├── interviews.yaml
│   └── offers.yaml
│
├── students/
│   ├── profiles.yaml
│   ├── skills.yaml
│   ├── projects.yaml
│   ├── certifications.yaml
│   └── achievements.yaml
│
├── community/
│   ├── posts.yaml
│   ├── comments.yaml
│   └── follows.yaml
│
├── notifications/
│   └── notifications.yaml
│
└── seed-config.yaml
67. TEMPLATE DATA FORMAT

Use YAML or JSON consistently.

Recommended YAML for human-maintainable seed definitions.

Example:

student:
  external_key: STUDENT_0001

  identity:
    email: student0001@example.beyon.test
    password_env: TEST_PASSWORD_STUDENT
    role: STUDENT

  profile:
    first_name: Aarav
    last_name: Kumar
    phone: "+919800000001"
    city: Chennai
    state: Tamil Nadu

  academics:
    institution_key: INST_0001
    department_key: CSE
    degree: BTECH
    graduation_year: 2027
    cgpa: 8.42

  placement:
    status: PLACEMENT_WILLING

  career:
    goal: BACKEND_DEVELOPER
    preferred_roles:
      - JAVA_DEVELOPER
      - BACKEND_DEVELOPER

  skills:
    - skill: JAVA
      proficiency: ADVANCED
    - skill: SQL
      proficiency: INTERMEDIATE
    - skill: SPRING_BOOT
      proficiency: BEGINNER
68. REFERENTIAL SEED KEYS

Do not hardcode random UUIDs everywhere without relationships.

Use stable seed keys:

STUDENT_0001
COMPANY_0001
INSTITUTION_0001
JOB_0001
ASSESSMENT_0001
QUESTION_0001
SKILL_JAVA
TOPIC_JAVA_OOP

The seed engine resolves:

external_key
        ↓
actual Appwrite/Dolt ID

This makes seed data reproducible.

69. IDEMPOTENCY

Running:

seed:full

twice should NOT result in uncontrolled duplicates.

Use:

external_key
slug
email
unique business identifier

to detect existing records.

70. REAL-TIME DATABASE VERIFICATION

After seeding, verify:

Appwrite
Users
Profiles
Files
Permissions
Sessions
Dolt
Companies
Institutions
Skills
Questions
Assessments
Applications
Coins
Placements
Redis
Cache
Leaderboard
Notification counters
Rate limits

Output a seed report.

71. SEED REPORT

Generate:

docs/SEED_REPORT.md

Example:

========================================
BEYON TEST DATA SEED REPORT
========================================

Environment:
staging

Seed:
20260826

Students:
2000

Institutions:
25

Companies:
100

Questions:
10000

Coding Questions:
2000

SQL Questions:
500

Assessments:
50

Jobs:
500

Internships:
300

Applications:
20000

Certificates:
500

Projects:
1000

Community Posts:
5000

Notifications:
50000

Placements:
600

========================================

Appwrite:
SUCCESS

Dolt:
SUCCESS

Upstash:
SUCCESS

========================================

Integrity Checks:
PASS

Duplicate Checks:
PASS

Foreign Key Checks:
PASS

Coin Ledger Reconciliation:
PASS

========================================
72. SEED VALIDATION

After seeding automatically validate:

Every student references valid institution
Every skill reference exists
Every question references a valid skill
Every assessment references valid questions
Every application references valid student/company/job
Every placement references valid application/student/company
Every notification references valid target user
Every coin transaction references valid student
73. COIN RECONCILIATION

For every seeded student:

SUM(EARN)
-
SUM(SPEND)
+
SUM(REFUND)
+
SUM(ADJUSTMENT)
-
SUM(REVERSAL)
=
BALANCE

Run this automatically.

If any mismatch exists:

SEED VALIDATION = FAILED
74. APPLICATION RECONCILIATION

Validate:

application.student exists
application.company exists
application.job exists
application.drive exists where required
application.status is valid
application.coin transaction exists when applicable
75. ASSESSMENT RECONCILIATION

Validate:

assessment exists
questions exist
attempt belongs to assessment
attempt belongs to candidate
submission belongs to attempt
result belongs to submission
proctoring session belongs to attempt
76. NOTIFICATION RECONCILIATION

Validate:

notification recipient exists
notification type valid
notification reference valid where applicable
read status valid
77. REALISTIC TIMESTAMP DISTRIBUTION

Do not create every record with the exact same timestamp.

Use realistic distributions:

Past 365 days
Past 90 days
Past 30 days
Past 7 days
Today
Future scheduled events

Examples:

Completed certifications → historical
Applications → recent
Open jobs → current
Events → future
Assessment → current
Notifications → mixed
78. FUTURE-DATED TEST DATA

Create some:

upcoming interviews
upcoming assessments
future events
future application deadlines

This allows testing countdowns and scheduling.

79. EDGE-CASE DATA

Include:

CGPA = 0
CGPA = 10
CGPA = boundary requirement
0 coins
exact coin requirement
1 coin below requirement
very high coin balance
0 projects
50 projects
0 certifications
expired certification
missing profile photo
very long project description
special characters
unicode names
long company names

Handle these safely.

80. INTERNATIONALIZATION TEST DATA

Include synthetic names containing:

Unicode
Accents
Multiple words
Non-Latin characters

Example:

Émile Laurent
José Martínez
李明
சுரேஷ்

Do not use real persons.

81. SECURITY TEST DATA

Create dedicated users for testing:

suspended user
unverified user
wrong-role user
admin user
moderator user
expired-session user

Do not weaken production security to make seed data work.

82. TESTING ADMIN USERS

Seed:

admin
superadmin
moderator

but do NOT automatically seed these users into production.

Development only.

83. TEST RESET

Implement:

seed:reset

The reset operation must:

Verify environment.
Print environment.
Ask for explicit confirmation when destructive.
Remove only seeded test data.
Rebuild cleanly.

It must NOT delete unrelated developer/staging data without explicit configuration.

84. SEED CONFIGURATION

Create:

seed:
  environment: staging
  seed: 20260826

  counts:
    students: 2000
    institutions: 25
    companies: 100
    questions: 10000
    assessments: 50
    jobs: 500
    internships: 300
    applications: 20000
    posts: 5000
    notifications: 50000

  options:
    create_files: true
    create_assessments: true
    create_recruitment: true
    create_community: true
    create_realtime_events: true

Allow counts to be overridden from CLI.

85. EXAMPLE COMMANDS
seed:base
seed:large
seed:full
seed:full --students=5000 --companies=250
seed:assessment
seed:recruitment
seed:community
seed:validate
seed:reset
86. TEST API UTILITIES

Create development-only utilities for:

Login as test student
Login as test recruiter
Create test assessment
Trigger notification
Trigger coin reward
Create application
Start assessment
Simulate proctoring event
Complete assessment
Move application stage
Create placement

These utilities MUST call actual backend APIs where possible.

Do not bypass business rules unless the utility is explicitly labeled a low-level fixture tool.

87. REAL-TIME TEST SCENARIO

Create this exact scenario:

Student follows Company A
        ↓
Company A publishes recruitment drive
        ↓
Eligibility evaluated
        ↓
Student eligible
        ↓
Backend creates notification
        ↓
Appwrite Realtime event
        ↓
Student UI receives event
        ↓
Unread notification count increases
        ↓
Student opens notification
        ↓
Notification becomes READ

Verify the complete chain.

88. ASSESSMENT TEST SCENARIO

Create this exact scenario:

Candidate Login
        ↓
Opportunity
        ↓
Eligible
        ↓
Enough Coins
        ↓
Spend Coins
        ↓
Application Created
        ↓
Assessment Unlocked
        ↓
Desktop App
        ↓
System Check
        ↓
Identity
        ↓
Proctoring
        ↓
Questions
        ↓
Submit
        ↓
Evaluate
        ↓
Result
        ↓
Shortlist

Every step must persist real backend data.

89. TEST UI REQUIREMENT

The seeded data must populate real UI pages.

Do NOT create a separate fake test dashboard.

The following actual application pages should display seeded records:

Student Dashboard
Practice
Challenges
Wallet
Leaderboard
Profile
Portfolio
Opportunities
Applications
Assessments
Notifications
Community

Institution Dashboard
Students
Placement
Companies
Analytics

Company Dashboard
Jobs
Drives
Candidates
Assessments
Analytics

Admin Dashboard
Users
Moderation
Feedback
Audit
Analytics
90. FINAL SEED ACCEPTANCE CRITERIA

The implementation is complete only when:

[ ] Test accounts can actually log in.
[ ] Credentials are documented.
[ ] Appwrite users exist.
[ ] Appwrite profiles exist.
[ ] Dolt business records exist.
[ ] Appwrite files exist where requested.
[ ] Upstash test cache can be populated.
[ ] Student data is realistic.
[ ] Institution data is realistic.
[ ] Company data is realistic.
[ ] Questions exist.
[ ] Coding questions exist.
[ ] SQL questions exist.
[ ] Assessments exist.
[ ] Assessment attempts exist.
[ ] Proctoring fixtures exist.
[ ] Jobs exist.
[ ] Applications exist.
[ ] Coins have ledger transactions.
[ ] XP has transactions.
[ ] Certifications exist.
[ ] Projects exist.
[ ] Placements exist.
[ ] Notifications exist.
[ ] Community exists.
[ ] Mentorship exists.
[ ] Events exist.
[ ] Recruitment drives exist.
[ ] Real-time events work.
[ ] Search has enough data.
[ ] Pagination can be tested.
[ ] Filtering can be tested.
[ ] Concurrency can be tested.
[ ] Data integrity passes.
[ ] No production data is touched.
91. FINAL AGENT TASK

Implement this seed-data system completely.

Do not merely create YAML files.

The seed system must:

Read seed definitions
        ↓
Create Appwrite identities
        ↓
Create Appwrite profile records
        ↓
Create Appwrite storage files
        ↓
Create Dolt relational data
        ↓
Create relationships
        ↓
Create coin ledger
        ↓
Create assessments
        ↓
Create applications
        ↓
Create placement data
        ↓
Populate Redis where appropriate
        ↓
Trigger selected realtime events
        ↓
Validate integrity
        ↓
Generate seed report

After seeding:

Run integrity validation
Run login tests
Run API smoke tests
Run assessment smoke test
Run coin reconciliation
Run referential integrity checks
Run realtime test

Then create:

docs/
├── TEST_ACCOUNTS.md
├── TEST_SCENARIOS.md
├── SEED_REPORT.md
├── SEED_DATA_DICTIONARY.md
└── TEST_ENVIRONMENT.md

The final report must include:

Seed Status:
PASS / FAIL

Environment:
Development / Staging

Records Created:
...

Appwrite:
PASS / FAIL

Dolt:
PASS / FAIL

Upstash:
PASS / FAIL

Authentication:
PASS / FAIL

Assessment:
PASS / FAIL

Realtime:
PASS / FAIL

Integrity:
PASS / FAIL

Coin Reconciliation:
PASS / FAIL

Known Problems:
...

DO NOT claim success until the seeded users can actually log in and the seeded records appear through the real Beyon application UI and backend APIs.


### Recommended test account groups

The most useful accounts to keep permanently documented are:

```text
superadmin@example.beyon.test
admin@example.beyon.test
moderator@example.beyon.test

student.strong@example.beyon.test
student.weak@example.beyon.test
student.placement@example.beyon.test
student.independent@example.beyon.test
student.incomplete@example.beyon.test

exam.candidate1@example.beyon.test
exam.candidate2@example.beyon.test
exam.candidate3@example.beyon.test
exam.candidate4@example.beyon.test
exam.candidate5@example.beyon.test

recruiter@example.beyon.test
company.admin@example.beyon.test

institution.admin@example.beyon.test
placement@example.beyon.test
faculty@example.beyon.test

mentor@example.beyon.test
alumni@example.beyon.test

The important part is that these are real Appwrite accounts connected to real Dolt records, not credentials invented solely for the documentation. The seed process should create them and then immediately run login and authorization smoke tests.

For your live/realtime testing, the best test isn't just generating 50,000 notifications. The seed system should also expose a development-only event simulator that sends events through the same backend path as production, so you can watch the actual Beyon UI react to a company posting a job, an application changing status, a coin reward arriving, an interview being scheduled, or an assessment becoming available.
