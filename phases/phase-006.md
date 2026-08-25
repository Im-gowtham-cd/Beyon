# Beyon — Phase 06 Implementation Prompt

## 1. Phase Objective

Build the complete Student Profile module for Beyon.

The profile must become the central representation of a student's:

- Academic background
- Skills
- Skill proficiency
- Career interests
- Certifications
- Projects
- Achievements
- Resume
- Developer/social profiles
- Placement preference
- Profile completeness
- Skill development progress

This profile will later be consumed by:

- Daily Challenges
- Skill Assessments
- Beyon Coins
- Company Assessments
- Job Matching
- Internship Matching
- Institution Placement
- Leaderboards
- Recommendations
- Digital Portfolio

Do NOT implement those systems in this phase.

---

# 2. Important Existing Architecture

Phase 04 created the student onboarding system.

Phase 05 created authentication and authorization.

Reuse both.

Do NOT create another student identity/profile system.

The authenticated user must map to exactly one student profile.

---

# 3. Student Profile Route

Create:

```text
/student/profile

Also support:

/student/profile/edit

Future public profile:

/student/u/:username

If username functionality is not implemented yet, prepare the architecture without overbuilding it.

4. Profile Page UX

The profile should NOT look like a basic form.

It should look like a premium professional developer/recruitment profile.

Structure:

┌──────────────────────────────────────────────────────────────┐
│ BEYON NAVIGATION                                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────────────────────────────────────────────┐   │
│   │ PROFILE HEADER                                       │   │
│   │                                                      │   │
│   │   ○ Avatar                                           │   │
│   │                                                      │   │
│   │   Gowtham C D                                        │   │
│   │   Computer Science & Engineering                     │   │
│   │   Kongu Engineering College                           │   │
│   │                                                      │   │
│   │   [Edit Profile]   [Share Profile]                   │   │
│   └──────────────────────────────────────────────────────┘   │
│                                                              │
│   ┌───────────────────────┐ ┌─────────────────────────────┐  │
│   │ PROFILE COMPLETION    │ │ SKILL SCORE                 │  │
│   │                       │ │                             │  │
│   │       82%             │ │          742                │  │
│   └───────────────────────┘ └─────────────────────────────┘  │
│                                                              │
│   SKILLS                                                     │
│   [Java] [React] [SQL] [Python]                              │
│                                                              │
│   PROJECTS                                                   │
│   ...                                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Use the existing Beyon design system from Phase 03.

5. Profile Header

Display:

Profile photo
Full name
Current degree
Department
Institution
Graduation year
Placement preference
Profile verification state
Profile completeness
Edit button
Share profile button

Example:

Gowtham C D

B.E. Computer Science & Engineering
Kongu Engineering College

Placement:
● Open to Placement

Profile:
● 82% Complete

Do not expose private information.

6. Profile Visibility

Separate profile information into:

Public

Potentially visible:

Name
Profile photo
Institution
Department
Graduation year
Skills
Skill proficiency
Projects
Certifications
Achievements
Portfolio links
Private

Never expose publicly:

Personal email
Phone number
Residential address
Resume file unless explicitly shared
Academic registration number
Private documents

The backend must enforce this distinction.

7. Profile Sections

The student profile must contain:

Overview
Academic
Skills
Projects
Certifications
Achievements
Career Preferences
Resume
Links

Use tabs or section navigation depending on the existing UI architecture.

8. Overview Section

Display:

About me
Profile completion
Skill score placeholder
Current learning topics
Career interests
Placement preference
Top skills

Skill Score is a placeholder in this phase.

Do NOT calculate the final Beyon Skill Score yet.

9. Academic Section

Display:

Institution
Degree
Department
Academic year
Graduation year
CGPA
Academic achievements

Do not expose:

Roll number
Registration number

on public profiles.

10. Academic Editing

Allow students to edit appropriate academic fields.

Some fields may require verification.

Example:

Institution
Department
Degree
Graduation Year
CGPA

If the institution has already verified certain information, mark:

✓ Verified

Students should not be able to falsely mark their own data as verified.

11. Placement Preference

Display prominently:

Placement Status

Options:

OPEN_TO_PLACEMENT
NOT_SEEKING_PLACEMENT

Use Beyon terminology consistently.

This status will later determine institution-based recruitment eligibility.

12. Skill Section

Build a complete skill management system.

Display skills grouped by category.

Example:

Programming
Java
Python
C++
JavaScript

Frontend
React
Next.js
HTML
CSS

Backend
Spring Boot
Node.js

Database
SQL
PostgreSQL
MongoDB
13. Skill Categories

Initial categories:

PROGRAMMING
FRONTEND
BACKEND
DATABASE
CLOUD
DEVOPS
AI_ML
DATA
CYBERSECURITY
MOBILE
UI_UX
TOOLS
SOFT_SKILLS

The architecture must allow new categories later.

14. Skill Reference Data

Do NOT hardcode skills directly into React components.

Create a proper skill reference structure.

Example:

skills
├── id
├── name
├── slug
├── category
├── description
├── is_active
└── created_at

Future phases can add:

Skill aliases
Skill relationships
Industry demand
Difficulty
Learning paths

Do not implement those yet.

15. Student Skill Relationship

Create:

student_skills
├── id
├── student_id
├── skill_id
├── proficiency
├── source
├── verified
├── created_at
└── updated_at
16. Skill Proficiency

Initial proficiency levels:

BEGINNER
INTERMEDIATE
ADVANCED
EXPERT

Display visually.

Example:

Java

Advanced
████████████████░░░░

Do not represent proficiency using color alone.

17. Skill Source

Every skill should have a source.

Examples:

SELF_REPORTED
ASSESSMENT
CERTIFICATION
PROJECT
INSTITUTION
COMPANY
SYSTEM

For this phase, newly added skills should normally be:

SELF_REPORTED
18. Skill Verification

Display:

Java
Advanced
Self-reported

instead of:

Java
Verified

unless verified data actually exists.

Prepare support for:

✓ Verified

but do not artificially verify student skills.

19. Add Skill UX

Create an elegant skill selector.

Example:

Add Skills

Search skills...

Programming
[ Java ]
[ Python ]
[ C++ ]

Frontend
[ React ]
[ Vue ]
[ Angular ]

Selected:
[ Java × ] [ React × ]

[ Save Skills ]

Support:

Search
Category filtering
Multi-select
Remove
Keyboard navigation
20. Skill Search

Do not load thousands of skills into the browser.

Use server-side search where appropriate.

Example:

GET /api/v1/skills?search=java

Add pagination/limit.

21. Current Learning Skills

Allow students to mark skills they are currently learning.

Example:

Currently Learning

Spring Boot
Kubernetes
System Design

These are different from mastered skills.

Create a suitable relationship/status rather than duplicating skill records.

22. Skill Status

Support:

LEARNING
ACTIVE

Future phases may introduce:

MASTERED
VERIFIED

Do not implement complex skill progression yet.

23. Projects Section

Display project cards.

Each project:

Project Name
Short Description
Technologies
Role
GitHub
Live Demo
Duration

Example:

Planora

AI Project Architect for CS Students

React · Node.js · Firebase · Gemini

[GitHub] [Live Demo]
24. Project Creation

Allow:

/student/profile/projects/new

Fields:

Project name
Description
Role
Technologies
Start date
End date
GitHub URL
Live URL
Project image
Featured project
25. Project Technologies

Technologies must use the existing skill reference system where possible.

Example:

React
Node.js
MongoDB
Docker

Do not create duplicate free-text skill records.

26. Featured Projects

Allow students to mark a limited number of projects as featured.

For example:

Featured Projects
1–3 projects

Do not allow unlimited featured projects.

27. Certifications

Display certification cards.

Each certification:

Certification
Issuer
Issue Date
Expiry
Credential ID
Credential URL
Verification Status

Example:

Oracle APEX
Oracle
Verified

Only display verified when actual verification exists.

28. Certification Upload

Allow certificate document upload.

Use Supabase Storage.

Requirements:

File validation
File size validation
Private storage
Controlled access
Upload progress
Replace
Delete

Do not expose raw storage paths to users.

29. Certification Verification

Initial states:

PENDING
VERIFIED
REJECTED

Student-created certifications start:

PENDING

Do not build the verification workflow in this phase.

Only prepare the data model/UI state.

30. Achievements

Create an achievements section.

Examples:

Hackathon
Academic Achievement
Competition
Research
Publication
Leadership
Open Source
Other

Fields:

Title
Description
Organization
Date
URL
Proof/document
31. Resume

Show resume status:

Resume
resume.pdf

Uploaded
Updated 2 days ago

[View]
[Replace]
[Delete]

If no resume:

No resume uploaded.

[Upload Resume]

Resume remains private unless explicitly shared.

32. Developer Links

Display:

GitHub
LinkedIn
Portfolio
LeetCode
HackerRank
CodeChef
Kaggle

Only display links that exist.

Validate URLs.

33. Career Preferences

Create an editable career preference section.

Fields:

Job Roles

Multi-select.

Industries

Multi-select.

Work Type
REMOTE
HYBRID
ONSITE
ANY
Preferred Locations

Multiple.

Career Goal

Free text.

34. Current Learning Topics

Allow students to identify what they are currently learning.

Example:

Currently Learning

Java
SQL
System Design
React

This information will later power daily challenges.

Do not generate challenges yet.

35. Profile Completion

Implement a meaningful profile completion calculation.

Example:

Basic information          20%
Academic information       20%
Skills                     20%
Projects                   15%
Certifications             10%
Career preferences         10%
Links                       5%

Total:

100%

The exact weighting should be configurable.

36. Completion UI

Use:

Profile Strength

82%

████████████████░░░░

Complete your GitHub profile
+5%

Provide actionable suggestions.

Example:

Complete these:

✓ Basic information
✓ Academic information
✓ Skills

○ Add a project
○ Add GitHub
○ Upload resume
37. Profile Strength Rules

Do not award Beyon Coins for profile completion yet.

This phase only calculates completion.

Future reward logic belongs to the Coins phase.

38. Share Profile

Add:

Share Profile

Possible actions:

Copy Profile Link
Share

If public username/profile routing is not ready, show a controlled placeholder or implement the basic public route.

Do not expose private information.

39. Public Student Profile

Create:

/student/u/:username

Only expose public fields.

Example:

┌──────────────────────────────────────────────┐
│ Avatar                                       │
│                                              │
│ Gowtham C D                                  │
│ Software Engineer Candidate                 │
│                                              │
│ Kongu Engineering College                   │
│                                              │
│ Skills                                       │
│ [Java] [React] [SQL]                        │
│                                              │
│ Projects                                     │
│ ...                                          │
│                                              │
│ Certifications                               │
│ ...                                          │
└──────────────────────────────────────────────┘
40. Username

If not already implemented:

Add a unique username field.

Requirements:

Unique
URL safe
Lowercase normalization
Reasonable length
No offensive/reserved system words
Cannot impersonate system accounts

Example:

beyon.app/student/u/gowtham

Do not use email addresses as public usernames.

41. Profile Editing

Create a reusable editing architecture.

Do not make students navigate through the original onboarding process every time they edit their profile.

Example:

Profile
   ↓
Edit Profile
   ↓
Section editing
   ↓
Save
42. Autosave

Do NOT implement aggressive autosave for every keystroke.

Use explicit save actions.

For long forms, preserve unsaved local state temporarily if appropriate.

43. Optimistic UI

Use optimistic updates only where safe.

For example:

Adding/removing a skill can update the UI immediately and rollback if the API fails.

Do not use optimistic updates for:

File uploads
Verification
Sensitive data
Important academic changes
44. API Structure

Create clean APIs.

Examples:

GET    /api/v1/student/profile
PUT    /api/v1/student/profile

GET    /api/v1/student/skills
POST   /api/v1/student/skills
DELETE /api/v1/student/skills/:id

GET    /api/v1/skills
GET    /api/v1/skills/search

GET    /api/v1/student/projects
POST   /api/v1/student/projects
PUT    /api/v1/student/projects/:id
DELETE /api/v1/student/projects/:id

GET    /api/v1/student/certifications
POST   /api/v1/student/certifications
PUT    /api/v1/student/certifications/:id
DELETE /api/v1/student/certifications/:id

GET    /api/v1/student/achievements
POST   /api/v1/student/achievements
PUT    /api/v1/student/achievements/:id
DELETE /api/v1/student/achievements/:id

Adapt naming to the existing backend conventions.

45. Database Structure

Use PostgreSQL/Supabase for structured student data.

Potential tables:

users
student_profiles
skills
student_skills
student_learning_skills
student_projects
project_skills
student_certifications
student_achievements
student_links
student_career_preferences
student_preferred_roles
student_preferred_industries
student_preferred_locations

Do not create unnecessary tables if the existing architecture already provides an equivalent normalized structure.

46. Relationships

Conceptually:

users
  │
  └── student_profiles
          │
          ├── student_skills ─── skills
          │
          ├── student_projects
          │       └── project_skills ─── skills
          │
          ├── certifications
          │
          ├── achievements
          │
          ├── career_preferences
          │
          └── links

Use foreign keys.

Use cascading behavior carefully.

Never accidentally delete a user's complete profile because one child record was removed.

47. Supabase Storage

Suggested private buckets:

student-avatars
student-resumes
student-certificates
student-achievements
student-projects

Use appropriate access policies.

Profile avatars may be public if the product requires public profiles, but private documents must remain private.

48. RLS

Students can manage only their own records.

Example:

student_skills
student_id → authenticated student's profile

A student cannot modify:

another_student.student_skills

Public profile access must use a controlled public policy/view.

49. Cache

Use the existing Upstash Redis architecture only where it provides actual value.

Good candidates:

Skill search
Skill reference lists
Public profile cache
Profile statistics

Do NOT cache private profile data carelessly.

Invalidate relevant cache after profile updates.

50. MongoDB

Do not move the structured student profile into MongoDB.

Use PostgreSQL/Supabase for:

Student profile
Skills
Projects
Certifications
Academic information
Career preferences

Only introduce MongoDB later for genuinely document-oriented workloads.

51. Skill Graph Preparation

Prepare the data model for future skill relationships.

For example:

Java
 ├── Spring Boot
 ├── JDBC
 └── Hibernate

React
 ├── JavaScript
 ├── TypeScript
 └── Next.js

Do NOT implement the recommendation graph yet.

Only ensure the skill model can support relationships later.

52. Future Compatibility

The profile must eventually support:

Student
 ↓
Skills
 ↓
Current Learning
 ↓
Daily Challenge
 ↓
Assessment
 ↓
Verified Skill
 ↓
Beyon Coins
 ↓
Company Eligibility
 ↓
Company Assessment
 ↓
Job/Internship

Do not tightly couple Phase 06 to future reward logic.

53. Skill Score

Display a placeholder:

Skill Score
Coming from verified assessments

Do NOT create an arbitrary formula.

The real Skill Score will be defined when assessment/skill verification is implemented.

54. Coins

Do NOT show a fake coin balance.

If the dashboard expects Coins from future phases, use:

Beyon Coins
Coming soon

Do not create reward transactions yet.

55. Loading States

Every profile section needs loading states.

Examples:

Loading profile...
Loading skills...
Loading projects...
Loading certifications...

Prefer skeletons over large spinners.

56. Empty States

Create meaningful empty states.

Projects:

No projects yet.

Showcase the work you're proud of.

[Add Project]

Certifications:

No certifications added.

[Add Certification]

Skills:

No skills added.

Add the technologies you know.
57. Error States

Example:

Unable to load your profile.

[Retry]

Do not destroy already loaded data if one section fails.

58. Form Validation

Validate both frontend and backend.

Examples:

Project:

Name required
Description length
Valid URLs
Valid dates

Certification:

Name required
Issuer required
Valid credential URL

Skill:

Valid skill ID
Prevent duplicate skill assignment

Career preferences:

Valid option IDs
59. Duplicate Prevention

Prevent:

Duplicate skills
Duplicate projects with same ID
Duplicate certification references where appropriate
Duplicate links

Database constraints should reinforce frontend validation.

60. Accessibility

All profile functionality must support:

Keyboard navigation
Focus states
Screen readers
Proper labels
Accessible dialogs
Accessible dropdowns
Accessible file uploads

Do not rely on color alone for verification/status.

61. Responsive Design

Desktop:

2–3 column bento layout

Tablet:

2 columns

Mobile:

1 column

Profile header must collapse cleanly.

Skill chips must wrap.

Project cards must not overflow.

Tables, if used, must become responsive.

62. Beyon Visual Rules

Use:

Canvas:
#131313

Primary:
#E1FB15

Secondary:
#32D583

Surface:
#1A1A1A

Elevated:
#232325

Border:
#2A2A2C

Use:

Large rounded corners
Asymmetric bento layout
Minimal shadows
Primary yellow for important actions
Mint for verified/success
Red only for destructive/error states
Clash Grotesk for headings
General Sans for UI

Do not introduce random colors.

63. Texture Rules

Student profile is a gamified/productive surface.

Texture may be used for:

Skill progress
Profile completion
Skill score placeholder
Achievement cards

Use:

Hatch → secondary/inactive
Dots → highlighted
Solid → primary hero metric

Do not overuse texture.

64. Profile Header Hero

Use the Beyon organic/blob visual style carefully.

Possible hero:

Profile Strength
82%

or:

Your Skill Journey

Do not turn the entire profile page into blobs.

Maximum:

1 major hero visual

per screen.

65. Security

Never expose:

Authentication tokens
Passwords
Private documents
Internal verification notes

Enforce authorization on backend.

Enforce ownership through database policies.

Do not trust frontend role information.

66. Performance

Avoid:

Fetching every project/certification file immediately
Loading unnecessary images
Massive skill lists
Repeated profile API calls

Use:

Pagination where appropriate
Lazy loading
Image optimization
Caching for public/reference data
Query selection
67. Testing
Profile

[ ] View profile
[ ] Edit profile
[ ] Save profile
[ ] Refresh profile
[ ] Profile completion updates

Skills

[ ] Search
[ ] Add
[ ] Remove
[ ] Change proficiency
[ ] Current learning
[ ] Duplicate prevention

Projects

[ ] Create
[ ] Edit
[ ] Delete
[ ] Feature
[ ] URLs

Certifications

[ ] Add
[ ] Upload
[ ] Replace
[ ] Delete
[ ] Pending verification

Achievements

[ ] Add
[ ] Edit
[ ] Delete

Resume

[ ] Upload
[ ] Replace
[ ] Delete
[ ] Private access

Links

[ ] Add
[ ] Edit
[ ] Delete
[ ] URL validation

Security

[ ] Student can modify own profile
[ ] Student cannot modify another student
[ ] Public profile exposes only public data
[ ] Private documents remain protected

68. Definition of Done

Phase 06 is complete when:

[ ] Student profile page exists.

[ ] Student can edit profile.

[ ] Academic information is displayed.

[ ] Placement preference is displayed.

[ ] Skills system works.

[ ] Skill categories work.

[ ] Skill proficiency works.

[ ] Skill source is stored.

[ ] Current learning skills work.

[ ] Projects work.

[ ] Certifications work.

[ ] Achievements work.

[ ] Resume upload works.

[ ] Developer links work.

[ ] Career preferences work.

[ ] Profile completion works.

[ ] Public profile architecture exists.

[ ] Private/public information is separated.

[ ] Supabase Storage is integrated securely.

[ ] RLS policies work.

[ ] Backend ownership checks work.

[ ] Upstash caching is used only where appropriate.

[ ] Responsive UI works.

[ ] Loading states work.

[ ] Empty states work.

[ ] Error states work.

[ ] Existing authentication remains functional.

[ ] Production build succeeds.

[ ] Tests pass.

69. Do NOT Implement in Phase 06

Do not implement:

Beyon Coin rewards
Daily challenges
Weekly challenges
Weekend tests
Company application coin cost
Recruitment drives
Job applications
Company following
Institution following
Notifications
Proctored assessment
AI matching
Institution rating
Placement ranking
Leaderboards
Skill verification engine

These belong to later phases.

70. Agent Completion Report

When finished, return:

Phase 06 Status

COMPLETED / BLOCKED

Student Profile
Overview:
Academic:
Skills:
Projects:
Certifications:
Achievements:
Resume:
Links:
Career Preferences:
Skill System
Skill Reference:
Student Skills:
Proficiency:
Current Learning:
Verification State:
Storage
Avatar:
Resume:
Certificates:
Project Images:
Database
Tables:
Relationships:
Constraints:
RLS:
API
Profile:
Skills:
Projects:
Certifications:
Achievements:
Cache
Upstash usage:
Cache invalidation:
Security
Ownership:
Public/private separation:
File security:
UI/UX
Desktop:
Tablet:
Mobile:
Loading:
Empty:
Error:
Testing
Passed:
Failed:
Known Issues
...
Ready For

Phase 07


### Phase 6 outcome

After this phase, a student will have a **real Beyon identity/profile**, not just the registration data.

The important foundation becomes:

**Student → Skills → Current Learning → Projects → Certifications → Career Preferences → Profile Strength**

That is the data layer we'll later use to build the **LeetCode-style daily challenge system and Beyon Coin earning engine** without having to redesign the student model.
