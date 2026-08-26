# Beyon — Phase 07 Implementation Prompt

## 1. Phase Objective

Build Beyon's centralized Skill Taxonomy system.

The system must provide a structured hierarchy:

Skill Category
    ↓
Skill
    ↓
Topic
    ↓
Subtopic

Example:

Programming
  └── Java
       ├── Basics
       ├── OOP
       ├── Collections
       ├── Exception Handling
       ├── Multithreading
       └── JVM

Database
  └── SQL
       ├── SELECT
       ├── JOIN
       ├── Subqueries
       ├── Aggregation
       └── Window Functions

This system will later power:

- Daily Questions
- Daily Challenges
- Weekend Tests
- Skill Assessments
- Certification recommendations
- Student Skill Progress
- Company Requirements
- Job Matching
- Institution Skill Analytics
- Beyon Coin rewards

Do NOT implement those systems in this phase.

---

# 2. Existing Architecture

Reuse:

- Existing authentication
- Existing student profile
- Existing student_skills
- Existing Supabase PostgreSQL database
- Existing Upstash Redis configuration
- Existing Beyon UI/UX system

Do not create a second authentication system.

Do not duplicate the existing skill table if Phase 06 already created it.

Extend the existing schema instead.

---

# 3. Skill Taxonomy

Create the hierarchy:

```text
Category
    ↓
Skill
    ↓
Topic
    ↓
Subtopic

Example:

Programming
└── Java
    ├── Java Basics
    │   ├── Variables
    │   ├── Data Types
    │   └── Operators
    │
    ├── OOP
    │   ├── Class
    │   ├── Object
    │   ├── Inheritance
    │   └── Polymorphism
    │
    └── Collections
        ├── List
        ├── Set
        └── Map
4. Categories

Initial categories:

PROGRAMMING
FRONTEND
BACKEND
DATABASE
CLOUD
DEVOPS
AI_ML
DATA_SCIENCE
CYBERSECURITY
MOBILE
UI_UX
SOFTWARE_ENGINEERING
TESTING
TOOLS
SOFT_SKILLS

Make categories database-driven.

Do not hardcode category names throughout the frontend.

5. Skills

Create/extend:

skills

Suggested structure:

id
name
slug
category_id
description
icon
is_active
created_at
updated_at

Constraints:

Name unique within appropriate scope
Slug unique
Category required
Inactive skills cannot be selected for new student profiles
6. Topics

Create:

skill_topics

Fields:

id
skill_id
name
slug
description
display_order
is_active
created_at
updated_at

Example:

Java
 ├── Basics
 ├── OOP
 ├── Collections
 ├── Exception Handling
 └── Multithreading
7. Subtopics

Create:

skill_subtopics

Fields:

id
topic_id
name
slug
description
display_order
is_active
created_at
updated_at

Example:

OOP
 ├── Classes
 ├── Objects
 ├── Inheritance
 ├── Encapsulation
 ├── Abstraction
 └── Polymorphism
8. Difficulty

Prepare standardized difficulty levels:

EASY
MEDIUM
HARD

Do not create challenge questions yet.

The difficulty will later be attached to questions/topics.

9. Learning Stage

Prepare:

NOT_STARTED
LEARNING
PRACTICING
ASSESSMENT_READY
MASTERED

This is future-facing.

Only use the stages required by existing UI in this phase.

Do not automatically mark students as MASTERED.

10. Student Learning Topic

Extend the student learning system from Phase 06.

A student should be able to indicate:

Currently Learning

at topic level.

Example:

Java
 └── OOP
      └── Polymorphism

Store the relationship rather than only storing free-text.

Suggested:

student_learning_topics

Fields:

id
student_id
topic_id
status
started_at
updated_at
11. Student Skill Progress Foundation

Prepare:

student_skill_progress

Fields:

id
student_id
skill_id
topic_id
subtopic_id
progress_percentage
learning_stage
updated_at

Do not build the final scoring algorithm yet.

The progress value can initially be manually/system initialized.

12. Important Rule

Do not confuse:

Student Skill

with:

Student Learning Topic

Example:

A student can have:

Java → Advanced

while currently learning:

Java → Multithreading

These are different concepts.

13. Skill Relationships

Prepare support for relationships between skills.

Example:

Java
 ↓ prerequisite
OOP

Spring Boot
 ↓ prerequisite
Java

React
 ↓ prerequisite
JavaScript

Create:

skill_relationships

Suggested fields:

id
source_skill_id
target_skill_id
relationship_type

Types:

PREREQUISITE
RELATED
NEXT_STEP

Do not build recommendation logic yet.

14. Topic Relationships

Prepare topic relationships if useful:

topic_relationships

Examples:

Java Basics
   ↓
OOP
   ↓
Collections
   ↓
Advanced Java

Use this later for learning paths.

15. Skill Search API

Implement:

GET /api/v1/skills
GET /api/v1/skills/:id
GET /api/v1/skills/search
GET /api/v1/categories
GET /api/v1/skills/:id/topics
GET /api/v1/topics/:id/subtopics

Support:

Search
Category filter
Pagination
Active/inactive filtering
Sorting
16. Student Learning APIs

Implement:

GET    /api/v1/student/learning
POST   /api/v1/student/learning
DELETE /api/v1/student/learning/:id

Allow the student to:

Add topic
Remove topic
View current learning
Change learning status
17. Student Skill Progress API

Prepare:

GET /api/v1/student/skill-progress
GET /api/v1/student/skill-progress/:skillId

Do not allow students to arbitrarily manipulate verified progress.

If progress is system-generated later, keep write access restricted.

18. Student UI — Skill Explorer

Create:

/student/skills

UI:

Skills

Search skills...

[Programming] [Frontend] [Backend] [Database]

Java
Advanced
12 Topics

React
Intermediate
8 Topics

SQL
Advanced
10 Topics

Clicking a skill opens its topics.

19. Skill Detail Page

Create:

/student/skills/:skillSlug

Example:

Java

Your Level
Advanced

Topics

✓ Basics
✓ OOP
● Collections
○ Multithreading
○ JVM

Use visual progress.

Do not fabricate progress values.

20. Topic Detail

Create:

/student/skills/:skillSlug/:topicSlug

Display:

Java
OOP

Description

Subtopics

✓ Classes
✓ Objects
● Inheritance
○ Polymorphism
○ Abstraction

[Start Learning]

The actual learning content is NOT part of this phase.

21. Learning Topic Selector

From student profile:

Add Current Learning Topic

Flow:

Select Category
      ↓
Select Skill
      ↓
Select Topic
      ↓
Optional Subtopic
      ↓
Add

Do not use one huge dropdown.

Use progressive selection.

22. Current Learning Dashboard Widget

On student dashboard, prepare:

Currently Learning

Java
OOP
Progress 62%

SQL
Window Functions
Progress 34%

React
Hooks
Progress 48%

[View Learning]

If no topics exist:

You haven't added any learning topics.

[Choose What You're Learning]
23. Learning Status UI

Use:

Learning
Practicing
Assessment Ready
Mastered

Do not use color alone.

Example:

● Learning
◐ Practicing
✓ Assessment Ready
★ Mastered
24. Admin/Seed Data

Create a reliable seed mechanism for initial taxonomy.

At minimum include useful common skills:

Programming
Java
Python
C
C++
JavaScript
TypeScript
Go
Rust
Frontend
HTML
CSS
React
Vue
Angular
Next.js
Backend
Node.js
Express.js
Spring Boot
Django
FastAPI
NestJS
Database
SQL
PostgreSQL
MySQL
MongoDB
Redis
Cloud
AWS
Azure
Google Cloud
DevOps
Docker
Kubernetes
GitHub Actions
Terraform

Do not attempt to create every possible technology.

The architecture must allow expansion.

25. Java Example Taxonomy

Seed a useful Java hierarchy:

Java
├── Basics
│   ├── Variables
│   ├── Data Types
│   ├── Operators
│   ├── Control Flow
│   └── Methods
│
├── OOP
│   ├── Classes
│   ├── Objects
│   ├── Encapsulation
│   ├── Inheritance
│   ├── Abstraction
│   └── Polymorphism
│
├── Collections
│   ├── List
│   ├── Set
│   ├── Map
│   └── Queue
│
├── Exception Handling
│   ├── Try Catch
│   ├── Checked Exceptions
│   └── Custom Exceptions
│
└── Multithreading
    ├── Threads
    ├── Synchronization
    └── Executors

This is only seed data.

Do not hardcode these into UI.

26. SQL Example Taxonomy

Seed:

SQL
├── Basics
│   ├── SELECT
│   ├── WHERE
│   └── ORDER BY
│
├── Aggregation
│   ├── GROUP BY
│   ├── HAVING
│   └── Aggregate Functions
│
├── Joins
│   ├── INNER JOIN
│   ├── LEFT JOIN
│   ├── RIGHT JOIN
│   └── FULL JOIN
│
├── Subqueries
└── Window Functions
27. Skill Metadata

Prepare optional metadata:

skill_type
technology
language
framework
tool
soft_skill
concept

This helps future recommendation systems.

28. Industry Demand Preparation

Do NOT calculate industry demand yet.

However, keep the schema extensible for future:

skill_demand

Future data:

skill_id
industry
demand_score
source
period

Do not populate fake demand scores.

29. Company Requirement Compatibility

Future companies will specify:

Required Skills
Preferred Skills
Minimum Proficiency
Required Topics

Make sure the skill IDs are reusable.

Never allow companies to define completely independent text-based skill names.

30. Assessment Compatibility

Future assessments must be able to reference:

Skill
Topic
Subtopic
Difficulty

Example:

Assessment
 ├── Java
 │    ├── OOP
 │    └── Collections
 │
 └── SQL
      └── Joins

Do not create assessment tables in this phase.

31. Daily Challenge Compatibility

Future daily challenge:

Challenge
 ↓
Skill
 ↓
Topic
 ↓
Difficulty

This phase must make that relationship possible.

Do not implement challenges.

32. Cache Strategy

Use Upstash Redis for relatively stable reference data.

Good cache candidates:

categories
skills
skill search
skill topics
topic subtopics

Suggested conceptual keys:

skills:all
skills:category:{categoryId}
skills:search:{query}
skill:{skillId}:topics
topic:{topicId}:subtopics

Set reasonable TTLs.

Invalidate cache whenever taxonomy data changes.

33. Supabase Database

All structured taxonomy data must remain in Supabase PostgreSQL.

Use:

Foreign keys
Unique constraints
Indexes
RLS where applicable

Important indexes:

skills.slug
skills.category_id
skill_topics.skill_id
skill_topics.slug
skill_subtopics.topic_id
student_learning_topics.student_id
student_learning_topics.topic_id
student_skill_progress.student_id
student_skill_progress.skill_id
34. Admin Access Preparation

Only authorized administrative users should eventually be able to modify:

Categories
Skills
Topics
Subtopics
Relationships

Students must have read-only access to taxonomy reference data.

Do not build a complete admin dashboard in this phase unless already required by the existing architecture.

35. Data Integrity

Prevent:

Duplicate skills
Duplicate topics within a skill
Duplicate subtopics within a topic
Invalid parent relationships
Duplicate student learning topics
Invalid skill references

Database constraints must enforce these rules.

36. Security

Students can:

READ taxonomy
MANAGE own learning topics
READ own progress

Students cannot:

CREATE official skills
EDIT official skills
DELETE official skills
CHANGE verified progress

Never trust frontend role checks.

37. UI/UX Rules

Follow Phase 03 exactly.

Use:

#131313
#E1FB15
#32D583
#1A1A1A
#232325
#2A2A2C

Use:

Large rounded cards
Full-width layouts
Strong alignment
Bento where appropriate
Minimal shadows
Clear hierarchy
Responsive layouts

Do NOT create narrow centered forms.

Do NOT repeat the alignment problems from earlier phases.

38. Search UX

Skill search should feel instant.

Example:

Search skills...

"jav"

Java
JavaScript
JavaFX

Debounce API calls.

Show:

No skills found

when appropriate.

39. Mobile

On mobile:

Category
 ↓
Skill
 ↓
Topics

Use stacked navigation rather than tiny dropdowns.

Touch targets must be large enough.

40. Loading States

Implement skeletons for:

Categories
Skills
Topics
Subtopics
Learning topics
Skill progress

Do not show blank screens.

41. Error Handling

Example:

Unable to load skills.

[Retry]

For failed learning-topic update:

Couldn't update your learning topics.

Please try again.

Do not silently fail.

42. Testing
Taxonomy

[ ] Categories load
[ ] Skills load
[ ] Skill search works
[ ] Topics load
[ ] Subtopics load
[ ] Pagination works

Student Learning

[ ] Add topic
[ ] Remove topic
[ ] Duplicate prevention
[ ] Status update
[ ] Student ownership

Security

[ ] Student cannot modify taxonomy
[ ] Student cannot modify another student's learning topics
[ ] Unauthorized API requests rejected

Cache

[ ] Cache hit works
[ ] Cache invalidation works
[ ] Stale data is not permanently served

Responsive

[ ] Desktop
[ ] Tablet
[ ] Mobile

43. Do NOT Implement

Do not implement:

Daily challenge engine
Question bank
LeetCode-style coding problems
Coins
Rewards
Streaks
Leaderboard
Company assessments
Proctoring
Job applications
Notifications
Company matching
AI recommendations
Institution analytics

Those belong to later phases.

44. Definition of Done

Phase 07 is complete when:

[ ] Centralized skill taxonomy exists.

[ ] Categories exist.

[ ] Skills exist.

[ ] Topics exist.

[ ] Subtopics exist.

[ ] Student learning topics work.

[ ] Skill progress foundation exists.

[ ] Skill relationships are supported.

[ ] Skill Explorer exists.

[ ] Skill detail page exists.

[ ] Topic detail page exists.

[ ] Student can select current learning topics.

[ ] Dashboard can display current learning topics.

[ ] Supabase schema is normalized.

[ ] Required indexes exist.

[ ] Upstash caching works for reference data.

[ ] RLS/security rules work.

[ ] Seed data works.

[ ] Responsive UI works.

[ ] Loading states work.

[ ] Empty states work.

[ ] Error states work.

[ ] Existing Phase 06 functionality remains intact.

[ ] Production build succeeds.

[ ] Tests pass.

45. Final Agent Report

Return:

Phase 07 Status

COMPLETED / BLOCKED

Taxonomy
Categories:
Skills:
Topics:
Subtopics:
Relationships:
Student Learning
Current topics:
Learning status:
Progress foundation:
Database
Tables:
Relationships:
Indexes:
Constraints:
RLS:
APIs
Taxonomy:
Student learning:
Progress:
Cache
Upstash keys:
TTL:
Invalidation:
UI
Skill Explorer:
Skill Details:
Topic Details:
Learning Selector:
Testing
Passed:
Failed:
Known Issues
...
Ready For

Phase 08


### Phase 07 dependency flow

```text
PHASE 06
Student Profile
      │
      ▼
PHASE 07
Skill Taxonomy
      │
      ├──────────────┐
      ▼              ▼
Current Learning   Skill Progress
      │              │
      └──────┬───────┘
             ▼
       Future Phases
             │
     ┌───────┼────────┐
     ▼       ▼        ▼
Daily      Tests    Company
Challenges           Requirements
     │       │        │
     └───────┼────────┘
             ▼
       Beyon Matching
             │
             ▼
        Beyon Coins
