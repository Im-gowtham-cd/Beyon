# Beyon — Phase 04: Role-Based Registration & Complete Onboarding

## How to use this

This is a paste-ready implementation prompt for the Beyon agentic coding AI.

Before starting:

1. Read `knowledge.md`
2. Read `skills.md`
3. Read `phase-001.md`
4. Read `phase-002.md`
5. Read `phase-003.md`
6. Inspect the existing implementation
7. Do NOT rewrite working Phase 01–03 functionality
8. Implement only Phase 04 requirements

---

# 1. Phase Objective

Upgrade Beyon's registration flow into a complete role-based onboarding system.

The registration flow must work like:

Register
    ↓
Basic Account Creation
    ↓
Select Role
    ↓
Role-Specific Complete Profile Form
    ↓
Review Information
    ↓
Submit
    ↓
Profile Created
    ↓
Role Dashboard

The selected role determines the exact onboarding form.

Supported roles:

- Student
- Institution
- Company

Admin must NOT be publicly selectable.

---

# 2. Critical UI/UX Requirement

The previous authentication UI uses a narrow centered card.

DO NOT continue that design for onboarding.

The onboarding/profile form must use a:

## Full-screen / Full-width application layout

The form should visually occupy the available viewport width.

Do NOT create:

```text
┌─────────────────────────────┐
│                             │
│       narrow form           │
│       narrow form           │
│                             │
└─────────────────────────────┘

Instead create:

┌─────────────────────────────────────────────────────────────┐
│ BEYON                         Step 2 of 4          65%       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Complete your profile                                      │
│  Tell us about yourself                                     │
│                                                             │
│  ┌──────────────────────┐   ┌────────────────────────────┐  │
│  │ Personal Information │   │ Academic Information       │  │
│  │                      │   │                            │  │
│  │ Full Name            │   │ Institution                │  │
│  │ Email                │   │ Department                 │  │
│  │ Phone                │   │ CGPA                       │  │
│  │                      │   │ Graduation Year            │  │
│  └──────────────────────┘   └────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Skills & Interests                                      ││
│  │                                                         ││
│  │ [ Java ] [ React ] [ SQL ] [ + Add Skill ]             ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  [ Back ]                                      [ Continue ] │
└─────────────────────────────────────────────────────────────┘

The form should feel like a modern SaaS onboarding application.

3. Onboarding Design Philosophy

The onboarding experience should feel like:

Premium SaaS
Professional
Structured
Spacious
Easy to scan
Modern
Data-oriented

It must NOT feel like:

A basic HTML form
A tiny login card
A university admission form
A generic Bootstrap form
A cluttered dashboard

Use the existing Beyon design system.

4. Beyon Visual System

Use:

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

Typography:

Headings → Clash Grotesk
Body/UI → General Sans
5. Registration Flow

The registration experience should now be:

Step 1 — Account

Collect:

Full name
Email
Password
Confirm password

Then:

Step 2 — Role

Choose:

Student
Institution
Company

Then immediately:

Step 3 — Role Profile

Show the complete role-specific form.

Then:

Step 4 — Review

Show everything entered.

Then:

Step 5 — Completion

Create the profile and redirect to the correct dashboard.

6. Important Navigation Rule

After role selection:

Student
    ↓
Student Onboarding

Institution
    ↓
Institution Onboarding

Company
    ↓
Company Onboarding

Do NOT send the user to a generic dashboard before profile completion.

Do NOT ask the user to manually navigate to another page.

7. Onboarding URL Structure

Use a clean structure.

/register
/register/role
/onboarding/student
/onboarding/institution
/onboarding/company
/onboarding/review
/onboarding/complete

The exact routing implementation may differ if the existing architecture uses another approach.

8. Onboarding Progress Indicator

Every onboarding page should show progress.

Example:

ACCOUNT ───── ROLE ───── PROFILE ───── REVIEW
   ●           ●          ○             ○

Or:

Step 3 of 4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 75%

The active step uses Beyon yellow.

Completed steps use mint.

Future steps use muted gray.

9. Persistent Onboarding State

If the user refreshes the page:

Do NOT lose the entire form.

Persist safe temporary onboarding state where appropriate.

Do NOT store:

Password
Access tokens
Refresh tokens
Sensitive credentials

in insecure browser storage.

The backend remains authoritative.

10. Student Onboarding

When:

role = STUDENT

show the Student onboarding form.

The form should collect the information needed for Beyon's future:

Skill mapping
Challenges
Coins
Recruitment
Institution placement
Company applications
Portfolio
Assessments
11. Student — Personal Information

Fields:

Full Name

Required.

Profile Photo

Optional.

Allow:

Upload
Preview
Remove

Use Supabase Storage for persistent profile images.

Date of Birth

Optional unless required by institutional policy.

Gender

Optional.

Do not force unnecessary personal information.

Phone Number

Required.

Location

Collect:

Country
State
City

Do not require exact residential address.

12. Student — Academic Information

Collect:

Institution

Required.

Allow selection from registered institutions.

Registration / Roll Number

Required where applicable.

Degree

Example:

B.E
B.Tech
B.Sc
M.E
M.Tech
MCA

Allow configurable values.

Department

Example:

Computer Science and Engineering
Information Technology
Electronics and Communication Engineering
Mechanical Engineering
Civil Engineering

Do not hardcode the list permanently.

Academic Year

Example:

1st Year
2nd Year
3rd Year
4th Year
Graduation Year

Required.

CGPA

Required where applicable.

Validate reasonable ranges.

Do not accept impossible values.

13. Student — Placement Information

Collect:

Placement Preference

Required:

PLACEMENT_WILLING
PLACEMENT_NOT_WILLING

This is a major Beyon concept.

The student's choice determines how institutional recruitment can target them.

14. Student — Career Preferences

Collect:

Preferred Job Roles

Multi-select.

Examples:

Software Engineer
Frontend Developer
Backend Developer
Full Stack Developer
Data Analyst
Data Scientist
AI Engineer
ML Engineer
Cloud Engineer
DevOps Engineer
Cybersecurity Engineer
UI/UX Designer
Product Engineer

Allow future configuration.

Preferred Industries

Examples:

FinTech
HealthTech
EdTech
SaaS
Automotive
Manufacturing
Consulting
Government
E-commerce
Preferred Work Type
On-site
Hybrid
Remote
Any
15. Student — Skills

Collect current skills.

Categories:

Programming

Examples:

Java
Python
C
C++
JavaScript
TypeScript
Frontend
React
Angular
Vue
Next.js
HTML
CSS
Backend
Spring Boot
Node.js
Express
NestJS
Django
Database
PostgreSQL
MySQL
MongoDB
Redis
Cloud / DevOps
AWS
Azure
Docker
Kubernetes
Terraform

Do NOT hardcode skills into the database.

Create a reusable skill-reference architecture for future phases.

16. Student — Skill Proficiency

Allow each selected skill to have a basic self-reported proficiency.

Example:

Java       → Beginner
React      → Intermediate
SQL        → Advanced

Levels:

BEGINNER
INTERMEDIATE
ADVANCED
EXPERT

This is only self-reported.

Do NOT mark these skills as verified yet.

Future assessment systems will verify them.

17. Student — Certifications

Allow students to add existing certifications.

Fields:

Certification name
Issuing organization
Issue date
Expiry date
Credential ID
Credential URL
Certificate file

Certificate upload should use Supabase Storage.

Do not treat uploaded certificates as verified automatically.

Status should initially be:

PENDING_VERIFICATION
18. Student — Projects

Allow students to add projects.

Fields:

Project name
Description
Role
Technologies
GitHub URL
Live URL
Project image
Start date
End date

Students should be able to add multiple projects.

Do not force project entry during onboarding if the user has none.

19. Student — Social / Developer Links

Optional:

GitHub
LinkedIn
Portfolio
LeetCode
HackerRank
CodeChef
Kaggle

Validate URLs.

20. Student — Resume

Allow optional resume upload.

Supported formats:

PDF
DOC
DOCX

Apply reasonable file-size limits.

Store through Supabase Storage.

Do not expose uploaded files publicly by default.

21. Student — Profile Summary

Allow:

About Me

Maximum reasonable character limit.

This will later be used for the digital portfolio.

22. Institution Onboarding

When:

role = INSTITUTION

show the Institution onboarding form.

The institution profile will later support:

Students
Placement statistics
Company partnerships
Institution rating
Recruitment
Analytics
Following
Company targeting
23. Institution — Basic Information

Collect:

Institution Name

Required.

Institution Type

Examples:

University
Engineering College
Arts & Science College
Medical College
Polytechnic
Management Institution
Other
Institution Code

Optional/required depending on country.

Official Email

Required.

Prefer institutional domain email.

Phone

Required.

Website

Optional.

24. Institution — Location

Collect:

Country
State
City
Address
Postal Code

Do not collect unnecessary personal information.

25. Institution — Academic Information

Collect:

Affiliated University

Optional.

Accreditation

Allow multiple:

NAAC
NBA
NIRF
ISO
Other
Accreditation Grade

Optional.

Established Year

Optional.

26. Institution — Placement Information

Collect existing placement metrics where available.

Fields:

Placement Rate

Percentage.

Average Package

Numeric.

Highest Package

Numeric.

Number of Students

Numeric.

Students Placement-Willing

Numeric.

Students Placement-Not-Willing

Numeric.

These values should later be verified.

Do NOT consider them officially verified during onboarding.

27. Institution — Placement History

Allow the institution to provide basic historical placement information.

For example:

Academic Year
Students Placed
Placement Percentage
Average Package
Highest Package

Allow multiple academic years.

This information will later contribute to the Institution Rating.

28. Institution — Verification

Institution accounts require verification.

Collect:

Official email
Institution registration/accreditation document where applicable
Authorized representative information

Account state:

PENDING_VERIFICATION

until verified.

Do not give verified institution status immediately.

29. Institution — Authorized Representative

Collect:

Representative name
Designation
Official email
Phone
Department

Examples:

Placement Officer
Training & Placement Coordinator
Principal
Dean
Department Head
Career Development Officer
30. Company Onboarding

When:

role = COMPANY

show Company onboarding.

The company profile will later support:

Recruitment
Assessments
Jobs
Internships
Company following
Institution following
Skill requirements
Candidate matching
31. Company — Basic Information

Collect:

Company Name

Required.

Company Logo

Optional.

Company Type

Examples:

Startup
Private Company
Public Company
Government
MNC
Non-profit
Consultancy
Other
Industry

Required.

Company Website

Required.

Official Email

Required.

Phone

Required.

32. Company — Location

Collect:

Country
State
City
Headquarters
Operating regions

Allow multiple operating locations later.

33. Company — Organization Information

Collect:

Company Size
1–10
11–50
51–200
201–500
501–1000
1001–5000
5000+
Founded Year

Optional.

About Company

Required.

LinkedIn

Optional.

34. Company — Recruitment Information

Collect:

Hiring Types

Multi-select:

Full-time
Internship
Apprenticeship
Contract
Graduate Program
Trainee
Preferred Candidate Levels
Fresher
Entry Level
Experienced
Recruitment Regions

Allow multiple.

35. Company — Hiring Skills

Allow the company to define common skills it recruits for.

Example:

Java
Spring Boot
React
SQL
Python
AWS
Docker

This is NOT an actual job requirement yet.

It represents the company's general hiring skill ecosystem.

Actual assessment/job requirements will be created in future phases.

36. Company — Authorized Representative

Collect:

Name
Designation
Official email
Phone

Examples:

HR Manager
Talent Acquisition Manager
Recruiter
Engineering Manager
Founder
37. Company Verification

Company accounts should initially be:

PENDING_VERIFICATION

Allow submission of:

Company registration document
Official domain email
Business identification where applicable

Do not expose company verification as completed until an authorized process confirms it.

38. Review Page

Before final submission, show a complete review.

Example:

Review Your Profile

ACCOUNT
Name
Email
Role

PERSONAL
...

ACADEMIC
...

CAREER
...

SKILLS
...

DOCUMENTS
...

────────────────────────

[ Back ]        [ Create Profile ]

Every section should have:

Edit

so users can return to the corresponding section.

39. Review UX

Do NOT dump all information into one huge text block.

Use expandable sections:

Personal Information       ✓
Academic Information       ✓
Career Preferences        ✓
Skills                     ✓
Certifications             3
Projects                   2
Documents                  1

Clicking a section expands the details.

40. Completion Page

After successful profile creation:

Show:

You're ready for Beyon.

Your profile has been created successfully.

For Student:

Start building your skills.
Earn Beyon Coins.
Unlock opportunities.

For Institution:

Start building your institution's talent ecosystem.

For Company:

Start connecting with skilled talent.
41. Redirect Rules

After completion:

STUDENT
→ /student/dashboard

INSTITUTION
→ /institution/dashboard

COMPANY
→ /company/dashboard

Admin:

ADMIN
→ /admin/dashboard

Do not build full dashboards in this phase.

If dashboards do not exist yet, create minimal placeholders.

42. Database Architecture

Do NOT put all role-specific fields into users.

Use:

users
    │
    ├── student_profiles
    │
    ├── institution_profiles
    │
    └── company_profiles

Additional related tables:

student_skills
student_certifications
student_projects
student_links
student_preferences

institution_placement_history
institution_accreditations
institution_representatives

company_hiring_preferences
company_skills
company_representatives
company_locations

Only create tables that are actually needed by this phase.

43. PostgreSQL vs MongoDB

Use PostgreSQL/Supabase for:

User identity
Profiles
Academic data
Company data
Institution data
Relationships
Structured preferences

Use MongoDB only where flexible document structures genuinely justify it.

Do NOT put the entire profile into MongoDB simply because it is easier.

44. Supabase Storage

Use Supabase Storage for:

Profile photos
Resumes
Certificates
Institution documents
Company verification documents
Project images

Use private buckets for sensitive documents.

Generate controlled access rather than making sensitive files publicly accessible.

45. Profile APIs

Create APIs appropriate to the architecture.

Examples:

POST /api/v1/onboarding/student
POST /api/v1/onboarding/institution
POST /api/v1/onboarding/company

GET /api/v1/profile
PUT /api/v1/profile

Role-specific APIs may be used where cleaner.

The backend must validate that the authenticated user is creating/updating their own profile.

46. Ownership Security

A student must not be able to modify another student's profile.

A company must not be able to modify another company's profile.

An institution must not be able to modify another institution's profile.

Never trust:

{
  "userId": "..."
}

from the frontend as the authority.

Use the authenticated identity from the backend security context.

47. Form Architecture

Do not build one giant React component.

Use:

OnboardingLayout
OnboardingProgress
OnboardingHeader
FormSection
FormField
SelectField
MultiSelect
FileUpload
SkillSelector
ProfilePhotoUploader
StepNavigation
ReviewSection

Role-specific forms:

StudentOnboarding
InstitutionOnboarding
CompanyOnboarding
48. Full-Width Layout Specification

Desktop:

Page width: 100%
Horizontal padding: 32–64px
Content width: min(1400px, 100%)

Large desktop:

max-width: 1500px

Do NOT use:

max-width: 500px

for the entire onboarding form.

Individual fields may use sensible widths.

49. Form Grid

Use a responsive grid.

Desktop:

2-column

For larger sections:

3-column where appropriate

Mobile:

1-column

Example:

┌──────────────────────────┬──────────────────────────┐
│ First Name               │ Last Name                │
├──────────────────────────┼──────────────────────────┤
│ Email                    │ Phone                    │
├──────────────────────────┼──────────────────────────┤
│ Institution              │ Department               │
└──────────────────────────┴──────────────────────────┘

Avoid extremely narrow inputs.

50. Form Sections

Each major section should be visually separated.

Example:

PERSONAL INFORMATION

Tell us who you are.

────────────────────────────────────────

Academic Information

Tell us about your education.

────────────────────────────────────────

Career Preferences

Tell Beyon where you want to go.

Use subtle surfaces and borders.

Do not create excessive nested cards.

51. Form Width Rules

Inputs:

width: 100%

Within grid columns.

Text areas:

min-height: 140px

Selects:

width: 100%

Long URLs:

width: 100%

Do not make forms visually cramped.

52. Sticky Navigation

On desktop, the bottom action area may remain visible.

Example:

─────────────────────────────────────────────────────────────
Phase 3 of 4

[ ← Back ]                              [ Continue → ]

Use a subtle surface/background.

On mobile, buttons become full width or stacked.

53. Unsaved Changes

If the user tries to leave onboarding with unsaved data:

show:

Leave onboarding?

Your progress may not be saved.

Do not unexpectedly discard large amounts of input.

54. Validation

Validate at both:

Frontend
and
Backend.

Examples:

CGPA:

0–10

Percentage:

0–100

Year:

reasonable academic year

Phone:

valid international format

URLs:

valid URL

File:

allowed type
allowed size
55. Accessibility

Every field must have:

Label
Input association
Focus state
Error message
Keyboard support

Required fields must be clearly identified.

Do not communicate errors only through red borders.

56. Responsive UX

Desktop:

Full-width layout
2–3 column forms
Spacious sections
Sticky navigation

Tablet:

2 columns where appropriate

Mobile:

1 column
Full-width controls
Sticky/visible action controls
No horizontal scrolling
57. Loading States

During profile submission:

Disable duplicate submission.

Button:

Creating profile...

Do not allow multiple API requests from repeated clicks.

58. Error Recovery

If profile creation fails:

Do NOT clear the entire form.

Show:

We couldn't save your profile.
Your information is still here.

[Try Again]

Preserve entered data.

59. Security

Never store:

Password
Authentication secrets
Verification secrets

inside onboarding profile tables.

Validate uploaded files.

Prevent malicious file uploads.

Do not expose private documents publicly.

60. Performance

Do not load all profile reference data at once if unnecessary.

Examples:

Skills:

Use searchable/paginated loading.

Institutions:

Use searchable selection.

Countries/states/cities:

Use efficient reference data.

Avoid massive dropdowns containing thousands of DOM elements.

61. Profile Completion

Calculate a basic profile completion percentage.

Example:

Profile completeness

████████████████░░░░ 80%

This is only a profile completeness metric.

Do NOT connect it to Beyon Coins yet.

Future phases will define reward logic.

62. Do NOT Implement Yet

Do not implement:

Beyon Coins
Daily challenges
Weekend challenges
Certifications reward
Company application coin cost
Skill verification
Leaderboards
Following
Notifications
Recruitment drives
Job posting
Company assessments
Proctoring
AI recommendations
Institution rating calculation
Placement score calculation

These are future phases.

63. Definition of Done

Phase 04 is complete only when:

[ ] Registration successfully creates the base account.

[ ] Role selection works.

[ ] Student selection opens Student onboarding.

[ ] Institution selection opens Institution onboarding.

[ ] Company selection opens Company onboarding.

[ ] Admin cannot be selected publicly.

[ ] Student form collects complete required profile data.

[ ] Institution form collects complete required profile data.

[ ] Company form collects complete required profile data.

[ ] Student skills can be selected.

[ ] Student certifications can be added.

[ ] Student projects can be added.

[ ] Student resume can be uploaded.

[ ] Institution verification information can be submitted.

[ ] Company verification information can be submitted.

[ ] Profile review works.

[ ] User can edit sections from review.

[ ] Profile submission works.

[ ] Data is stored in PostgreSQL.

[ ] Files are stored securely in Supabase Storage.

[ ] Profile ownership is enforced.

[ ] Backend validates all profile data.

[ ] Profile completion percentage works.

[ ] Full-width onboarding layout is implemented.

[ ] Desktop layout is clean.

[ ] Tablet layout is clean.

[ ] Mobile layout is clean.

[ ] No narrow centered registration card remains for onboarding.

[ ] No horizontal scrolling occurs.

[ ] Loading states work.

[ ] Error recovery works.

[ ] Existing Phase 01–03 functionality remains working.

[ ] Tests pass.

[ ] Production build succeeds.

64. Final Verification

Test the complete flows.

Student

Register
→ Select Student
→ Complete profile
→ Add skills
→ Add certification
→ Add project
→ Upload resume
→ Review
→ Submit
→ Student dashboard

Institution

Register
→ Select Institution
→ Complete institution details
→ Add placement information
→ Add representative
→ Upload verification document
→ Review
→ Submit
→ Institution dashboard

Company

Register
→ Select Company
→ Complete company details
→ Add hiring preferences
→ Add skills
→ Add representative
→ Upload verification document
→ Review
→ Submit
→ Company dashboard

65. Visual QA

Before completing the phase, inspect every screen visually.

Check:

[ ] Alignment

[ ] Spacing

[ ] Form width

[ ] Input width

[ ] Typography

[ ] Button placement

[ ] Section hierarchy

[ ] Responsive behavior

[ ] Error states

[ ] Loading states

[ ] File upload states

[ ] Review page

[ ] Mobile layout

The onboarding UI must NOT look like a narrow authentication form.

It should look like a serious premium product.

66. Agent Reporting Format

When finished:

Phase 04 Status

COMPLETED or BLOCKED

Registration Flow
Account:
Role:
Profile:
Review:
Completion:
Student
Personal:
Academic:
Placement:
Skills:
Certifications:
Projects:
Resume:
Institution
Basic:
Academic:
Placement:
Representative:
Verification:
Company
Basic:
Hiring:
Skills:
Representative:
Verification:
Database
Tables:
Relationships:
Migrations:
Storage
Buckets:
Uploads:
Access control:
UI/UX
Full-width layout:
Desktop:
Tablet:
Mobile:
Review:
Validation:
Security
Ownership:
File validation:
Authorization:
Tests
Passed:
Failed:
