# Beyon — Phase 03: Identity, Authentication & RBAC

## How to use this

This is a paste-ready implementation prompt for the Beyon agentic coding AI.

The agent MUST:

1. Read `knowledge.md`
2. Read `skills.md`
3. Read `phases/phase-001.md`
4. Read `phases/phase-002.md`
5. Inspect the actual codebase before modifying anything
6. Implement ONLY Phase 03
7. Preserve all functionality from previous phases
8. Do NOT implement future-phase business functionality

---

# 1. Phase Objective

Build the complete identity foundation for Beyon.

This phase establishes:

- User identity
- Authentication
- Registration
- Login
- Logout
- Session handling
- Role-based access control
- Account verification foundation
- Password management foundation
- Protected routes
- Authentication-aware UI
- Student / Institution / Company / Admin role selection
- Basic onboarding shell

This is the security and identity foundation for every future Beyon module.

Future features such as:

- Student profiles
- Company profiles
- Institution analytics
- Skill systems
- Coins
- Challenges
- Recruitment
- Assessments
- Proctoring

must NOT be implemented in this phase.

---

# 2. Beyon Product Context

Beyon is a skill-development and industry recruitment ecosystem.

The main user roles are:

### Student

Uses Beyon to:

- Learn
- Solve challenges
- Earn Beyon Coins
- Build skills
- Take assessments
- Find opportunities
- Apply to companies

### Institution

Uses Beyon to:

- Manage students
- Monitor placement readiness
- Track skills
- Work with companies
- Monitor placement performance

### Company

Uses Beyon to:

- Publish opportunities
- Define required skills
- Create assessments
- Discover candidates
- Work with institutions

### Admin

Manages:

- Platform configuration
- Verification
- Moderation
- Users
- Organizations
- System-level operations

Only the identity foundation should be implemented now.

---

# 3. Technology Requirements

Use the existing Phase 01 and Phase 02 stack.

## Web

- React
- Vite
- TypeScript
- Pure CSS

## Backend

- Java
- Spring Boot
- Maven

## Database

- Supabase PostgreSQL

## Flexible data

- MongoDB Atlas

## Cache

- Upstash Redis

## Storage

- Supabase Storage

## Desktop

- Electron
- React
- TypeScript

Do not introduce a different authentication architecture without documenting the reason.

---

# 4. Authentication Architecture

Use a secure token-based authentication architecture.

Preferred architecture:

Web/Desktop
    ↓
Authentication API
    ↓
Spring Boot
    ↓
PostgreSQL

Authentication state should be represented using short-lived access credentials and secure refresh/session handling.

Do not store sensitive authentication credentials in:

- localStorage
- sessionStorage
- URL parameters
- plain frontend state

Use secure mechanisms appropriate for the application platform.

---

# 5. Identity Model

Create the foundational user identity model.

A user should conceptually contain:

- ID
- Email
- Password hash
- Display name
- Role
- Account status
- Email verification status
- Created timestamp
- Updated timestamp
- Last login timestamp

Do NOT put role-specific profile information directly into the core identity entity.

For example:

Student-specific data should NOT be placed inside the base User model.

Future phases will create:

User
    ↓
Student Profile

User
    ↓
Company Profile

User
    ↓
Institution Profile

---

# 6. User Roles

Implement these roles:

```text
STUDENT
INSTITUTION
COMPANY
ADMIN

Use a strongly typed role representation.

Do not use arbitrary free-text role values throughout the application.

7. Account Status

Prepare account states:

PENDING_VERIFICATION
ACTIVE
SUSPENDED
DEACTIVATED

The system must prevent suspended/deactivated users from accessing protected functionality.

8. Role-Based Access Control

Implement RBAC at the backend.

Conceptually:

ADMIN
↓
Platform management

COMPANY
↓
Company functionality

INSTITUTION
↓
Institution functionality

STUDENT
↓
Student functionality

Do not rely only on frontend route restrictions.

Backend authorization is mandatory.

9. Authorization Rules

Create reusable authorization mechanisms.

Examples:

ROLE_STUDENT
ROLE_COMPANY
ROLE_INSTITUTION
ROLE_ADMIN

Future endpoints should be able to declare access rules without duplicating authorization logic.

Do not hardcode authorization checks inside every controller.

10. Authentication APIs

Create the foundational APIs.

Register
POST /api/v1/auth/register

Accept only the required identity information.

Do not create complete role-specific profiles yet.

Login
POST /api/v1/auth/login

Authenticate credentials and establish a secure authenticated session/token flow.

Logout
POST /api/v1/auth/logout

Invalidate the relevant session/refresh mechanism.

Current User
GET /api/v1/auth/me

Returns the authenticated user's basic identity.

Example conceptual response:

{
  "id": "...",
  "email": "...",
  "name": "...",
  "role": "STUDENT",
  "status": "ACTIVE"
}

Do not return password hashes or security secrets.

11. Registration Rules

Registration must validate:

Email format
Required fields
Password strength
Role
Duplicate email
Valid account state

Reject invalid requests consistently.

Do not allow arbitrary unknown roles.

12. Password Security

Passwords must NEVER be stored in plaintext.

Use a strong password hashing algorithm appropriate for modern applications.

Preferred:

Argon2id

BCrypt may be used if the existing Spring Security configuration makes it more practical.

Never:

Encrypt passwords for storage
Log passwords
Return passwords
Store passwords in Redis
Store passwords in MongoDB
13. Password Policy

Create a reasonable password policy.

At minimum enforce:

Minimum length
Maximum length
Basic complexity requirements
Reject obviously unsafe values

Do not create unnecessarily frustrating password rules.

The goal is strong security with good UX.

14. Email Verification Foundation

Prepare the architecture for email verification.

The system should be able to represent:

emailVerified = true / false

Create the verification-token mechanism.

The actual production email provider may be configured later.

Do not hardcode an external email provider.

15. Verification API

Prepare:

POST /api/v1/auth/verify-email

and:

POST /api/v1/auth/resend-verification

Validate:

Token
Expiration
User state
Token reuse

Verification tokens must be single-use.

16. Password Reset Foundation

Create:

POST /api/v1/auth/forgot-password

and:

POST /api/v1/auth/reset-password

Do not reveal whether an email exists.

Example:

Incorrect:

This email does not exist.

Correct:

If an account exists for this email, a password reset instruction has been sent.

This prevents account enumeration.

17. Rate Limiting

Authentication endpoints must be protected against abuse.

At minimum consider rate limiting for:

Login
Registration
Password reset
Verification resend

Use Upstash Redis where appropriate.

Do not over-engineer the rate limiter in this phase.

The goal is to establish the reusable foundation.

18. Login Abuse Protection

Implement basic protection against repeated login attempts.

Do not permanently lock accounts after a few incorrect passwords.

Prefer temporary throttling/rate limiting.

Avoid creating denial-of-service vulnerabilities through account locking.

19. Session Security

Authentication credentials must have:

Expiration
Secure storage
Rotation/invalidation where applicable
Logout invalidation

Do not create indefinitely valid tokens.

Do not put sensitive tokens in URLs.

20. Refresh Token / Session Strategy

Use a secure refresh/session strategy appropriate to the web and desktop clients.

For web:

Prefer secure HTTP-only cookie mechanisms where appropriate.

For Electron:

Use secure storage/controlled application mechanisms rather than browser localStorage for long-lived credentials.

Keep access credentials short-lived.

Do not expose refresh secrets to arbitrary renderer code.

21. Authentication Persistence

When the application restarts:

The user should remain authenticated only if a valid secure session mechanism exists.
Expired sessions must be rejected.
Invalid sessions must be cleared.

Do not blindly trust cached frontend user state.

The backend remains the authority.

22. Frontend Authentication Architecture

Create:

apps/web/src/

auth/
    components/
    hooks/
    pages/
    services/
    context/
    guards/
    types/

Use a centralized authentication state.

Avoid having each page independently check login state.

23. Authentication Pages

Create the following pages:

/login

Purpose:

Allow existing users to authenticate.

/register

Purpose:

Create a new Beyon account.

/verify-email

Purpose:

Handle email verification.

/forgot-password

Purpose:

Request password reset.

/reset-password

Purpose:

Set a new password using a valid reset token.

/select-role

Purpose:

Allow the user to select:

Student
Institution
Company

Admin accounts must NOT be freely selectable by public users.

24. Login UI

Follow the Beyon design system.

Background

Use:

#131313

Never use pure black.

Primary
#E1FB15
Secondary
#32D583
Error
#FF5C5C
Warning
#FFB020
25. Login Visual Style

Login should feel like Beyon.

Use:

Large rounded surfaces
32px+ card radius
Near-black background
Chartreuse primary CTA
General Sans body typography
Clash Grotesk headings
Subtle borders
Minimal glow

Do NOT turn authentication into a huge gamified dashboard.

The authentication experience should be premium and focused.

26. Registration UI

Use a structured form.

Fields:

Name
Email
Password
Confirm Password
Role

Use progressive disclosure if necessary.

Do not ask for:

CGPA
Skills
Resume
Company details
Institution details
Placement preference

Those belong to later onboarding phases.

27. Role Selection UI

Create three main cards:

Student

"Build skills. Earn Coins. Unlock opportunities."

Institution

"Develop talent. Track readiness. Connect with industry."

Company

"Find skilled talent. Assess. Recruit."

Use the Beyon visual system.

Admin must not appear as a public registration option.

28. Authentication Navigation

Unauthenticated users should see:

Home
Login
Register

Authenticated users should see the navigation appropriate to their role.

Do not implement full role dashboards yet.

For now, after authentication route users to a placeholder role landing page.

29. Protected Routes

Create a route guard.

Examples:

/dashboard
/student/*
/institution/*
/company/*
/admin/*

Unauthenticated users:

→ Redirect to /login

Authenticated users with the wrong role:

→ Show a proper unauthorized page.

Do not simply hide UI and assume security is handled.

30. Unauthorized Page

Create:

/403

Message:

You don't have permission to access this area.

Include:

Back button
Dashboard button where appropriate

Use #FF5C5C sparingly.

31. Session Loading State

While authentication state is being determined:

Do not flash:

Login page
Dashboard
Wrong role UI

Show a minimal Beyon loading state.

Keep it subtle.

Do not add excessive animations.

32. Authentication Error UX

Errors should be understandable.

Examples:

Invalid credentials:

Email or password is incorrect.

Expired session:

Your session has expired. Please sign in again.

Network failure:

We couldn't connect to Beyon. Please try again.

Do not expose:

SQL errors
Stack traces
Internal exceptions
Authentication implementation details
33. Form Validation

Frontend validation should provide immediate feedback.

Backend validation remains authoritative.

Validate:

Required fields
Email
Password
Confirm password
Role

Use accessible error messages.

Do not rely only on color to communicate validation errors.

34. Accessibility

Authentication forms must support:

Keyboard navigation
Visible focus states
Proper labels
Accessible error messages
Screen reader compatibility
Adequate contrast
Reduced motion

Buttons must have clear accessible names.

35. Responsive Design

Authentication must work on:

Desktop
Tablet
Mobile

Maintain Beyon's visual identity.

Avoid simply shrinking desktop forms.

36. Mobile Authentication

On mobile:

Use full-width form
Maintain large rounded surfaces
Keep adequate spacing
Keep primary CTA easy to reach
Avoid excessive decorative elements

The form must remain fast and readable.

37. Desktop Assessment Authentication

Prepare the Electron application for authentication.

Do NOT implement:

Assessment loading
Exam UI
Proctoring

Only establish:

Desktop App
    ↓
Authentication
    ↓
Authenticated Session

Use a secure Electron authentication architecture.

38. Backend Security

Use Spring Security or the project's selected security framework.

Implement:

Authentication filter/configuration
Authorization
Password hashing
Protected endpoints
Public endpoints
Security exception handling
CORS integration

Public endpoints:

/auth/register
/auth/login
/auth/verify-email
/auth/resend-verification
/auth/forgot-password
/auth/reset-password

Protected endpoint:

/auth/me
39. Security Headers

Configure appropriate security headers.

At minimum consider:

Content Security Policy
X-Content-Type-Options
Referrer Policy
Frame protections where appropriate

Do not introduce policies that break the application unnecessarily.

Document any CSP exceptions.

40. CSRF

Choose the appropriate CSRF strategy based on the authentication transport.

If cookie-based authentication is used, implement appropriate CSRF protection.

Do not disable security controls blindly.

Document the chosen approach.

41. CORS

Use the Phase 02 environment configuration.

Development:

Allow configured local frontend origins.

Production:

Allow only explicitly configured trusted origins.

Never use unrestricted wildcard CORS for authenticated production APIs.

42. Database Structure

Create only the identity-related PostgreSQL schema required for this phase.

Potential entities:

users
roles
user_roles (only if a multi-role architecture is chosen)
email_verification_tokens
password_reset_tokens
sessions / refresh_tokens

Choose the simplest architecture that supports the current requirements.

Do not create future business tables.

43. Identity Database Rules

Use:

UUID identifiers
Created timestamp
Updated timestamp
Appropriate indexes
Unique email constraint
Safe foreign keys
Appropriate deletion behavior

Email uniqueness must be enforced at the database level.

Do not rely only on application-level validation.

44. Token Storage

Do not store raw password-reset or verification tokens in the database if avoidable.

Prefer storing secure token hashes.

When a token is presented:

Hash/validate it.
Find the token record.
Check expiration.
Check whether it was already consumed.
Perform the action.
Mark it consumed.
45. Audit Foundation

Prepare basic authentication audit events.

Examples:

LOGIN_SUCCESS
LOGIN_FAILURE
LOGOUT
PASSWORD_RESET_REQUESTED
PASSWORD_RESET_COMPLETED
EMAIL_VERIFIED
EMAIL_VERIFICATION_REQUESTED

Do not store passwords or sensitive credentials in audit logs.

Do not build the complete audit dashboard yet.

46. Redis Usage

Use Upstash Redis only where appropriate.

Potential Phase 03 use:

Login rate limiting
Temporary authentication throttling
Short-lived security counters

Do not store the permanent user identity in Redis.

PostgreSQL remains the source of truth.

47. MongoDB Usage

Do not use MongoDB for the primary identity model.

Identity belongs in PostgreSQL because it is structured and transactional.

MongoDB remains reserved for future flexible/high-volume data.

48. Supabase Usage

PostgreSQL identity data should remain compatible with the project's Supabase architecture.

Do not bypass the agreed backend architecture by exposing unrestricted database operations to the frontend.

The frontend must communicate through the intended backend API unless a later phase explicitly establishes a different architecture.

49. API Documentation

Document authentication endpoints.

Update:

docs/api/authentication.md

Document:

Endpoint
Method
Request
Response
Authentication requirement
Error cases

Do not document secrets.

50. Testing Requirements

Create automated tests for:

Registration
Valid registration
Invalid email
Weak password
Duplicate email
Invalid role
Login
Valid credentials
Invalid credentials
Suspended account
Unverified account behavior
Authorization
Student access
Company access
Institution access
Admin access
Wrong-role access
Password
Reset request
Expired token
Used token
Successful reset
Verification
Valid token
Expired token
Reused token
51. Security Testing

Verify:

[ ] Passwords never appear in logs.

[ ] Password hashes are never returned.

[ ] Tokens are not exposed in URLs unnecessarily.

[ ] Users cannot select ADMIN during public registration.

[ ] Users cannot access another role's protected endpoint.

[ ] Suspended users cannot authenticate successfully.

[ ] Expired sessions are rejected.

[ ] Invalid tokens are rejected.

[ ] Authentication endpoints are rate-limited.

[ ] Database uniqueness prevents duplicate accounts.

52. UI/UX Design System

Follow the Beyon design system.

Core colors
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
Radius
--radius-sm: 12px;
--radius-md: 20px;
--radius-lg: 32px;
--radius-xl: 40px;
Typography

Display:

Clash Grotesk

Body:

General Sans

Fallback:

-apple-system, "Segoe UI", Inter, sans-serif
53. Authentication Visual Hierarchy

Use:

Primary yellow:

Main CTA
Selected role
Active state

Mint:

Verified
Success

Warning:

Pending verification

Error:

Invalid form
Security error

Do not use colors merely for decoration.

54. Texture Rules

Authentication pages should use significantly less texture than student dashboards.

Do NOT cover login/register forms with:

Hatch patterns
Dot patterns
Large charts

The signature texture system is primarily for:

Data visualizations
Rewards
Skill analytics
Gamification

Authentication should remain clean.

55. Glow Rules

Use subtle glow.

Primary:

0 0 60px rgba(225, 251, 21, 0.22)

Do not create excessive neon effects.

The product should feel premium rather than cyberpunk.

56. Motion

Authentication animations should be minimal.

Allowed:

Button hover
Card entrance
Loading indicator
Validation state transition

Respect:

prefers-reduced-motion

Do not use continuous background animation.

57. Components

Create reusable authentication components.

Examples:

AuthLayout
AuthCard
AuthHeader
AuthInput
PasswordInput
AuthButton
RoleCard
FormError
FormSuccess
VerificationNotice
AuthLoadingState
ProtectedRoute
RoleGuard

Do not duplicate login/register form styling.

58. Password Input

Password field should provide:

Show/hide password
Accessible label
Password validation
Strength indicator where appropriate

Do not reveal passwords by default.

59. Role Cards

Role selection cards should contain:

Student

Icon

Title

Short description

Institution

Icon

Title

Short description

Company

Icon

Title

Short description

Use Lucide Icons.

Avoid excessive illustrations.

60. Navigation After Authentication

For this phase, authenticated users may be routed to:

/student/home
/institution/home
/company/home
/admin/home

These pages should be simple placeholders only.

Example:

Welcome back, Gowtham.

Your Student workspace will appear here.

Do not build actual dashboards.

61. Admin Access

Admin accounts must not be created through normal public registration.

Admin creation should be handled through a secure administrative mechanism.

For development/testing, provide a documented seed strategy.

Never expose an "Admin" registration button.

62. Seed Data

Create development-only seed data if required.

Example:

One test student
One test company
One test institution
One test admin

Clearly mark these as development/test accounts.

Do not use real personal data.

Do not include real passwords in source code.

Use environment-controlled seed credentials.

63. Error Handling

Authentication errors must use the standardized backend error format established in Phase 01/02.

Frontend must translate technical errors into user-friendly messages.

Never display raw backend exceptions.

64. Performance

Authentication pages should load quickly.

Avoid:

Large images
Large animation libraries
Unnecessary dependencies
Huge background assets

Keep the first meaningful interaction fast.

65. Security Boundary

Remember:

Frontend authentication state is NOT security.

Backend authorization is the actual security boundary.

A malicious user must not gain access simply by modifying:

localStorage
React state
URL
browser devtools
frontend role state

Every protected backend operation must validate the authenticated identity and role.

66. Phase Boundary

Do NOT implement:

Student profile fields
CGPA
Placement willingness
Company information
Institution information
Skills
Skill assessment
Daily challenges
Weekend tests
Certifications
Beyon Coins
Leaderboards
Jobs
Internships
Company following
Institution following
Notifications
Recruitment
Proctored assessments
AI recommendations
Analytics

Those belong to later phases.

67. Definition of Done

Phase 03 is complete only when:

[ ] User identity model exists.

[ ] Role model exists.

[ ] Account status exists.

[ ] Registration works.

[ ] Login works.

[ ] Logout works.

[ ] Current-user endpoint works.

[ ] Email verification foundation works.

[ ] Password reset foundation works.

[ ] Secure password hashing works.

[ ] Authentication session/token strategy works.

[ ] RBAC works.

[ ] Protected routes work.

[ ] Role guards work.

[ ] Admin cannot be publicly registered.

[ ] Authentication rate limiting exists.

[ ] Authentication errors are standardized.

[ ] Database constraints exist.

[ ] Authentication audit foundation exists.

[ ] Redis is used appropriately for rate limiting/throttling.

[ ] Web authentication UI follows Beyon design system.

[ ] Mobile authentication works.

[ ] Electron authentication foundation exists.

[ ] Accessibility requirements are satisfied.

[ ] Automated tests pass.

[ ] Security tests pass.

[ ] Documentation is updated.

[ ] Phase 01 functionality remains intact.

[ ] Phase 02 functionality remains intact.

68. Final Verification

Before declaring completion:

Start all required services.
Register a test Student.
Login as Student.
Verify /auth/me.
Logout.
Attempt protected access without authentication.
Login as Company.
Verify Company authorization.
Login as Institution.
Verify Institution authorization.
Verify Admin access.
Verify normal users cannot register as Admin.
Test invalid credentials.
Test password reset.
Test email verification.
Test expired/invalid tokens.
Test rate limiting.
Test suspended account behavior.
Run frontend tests.
Run backend tests.
Run production builds.
Review security configuration.
Review database constraints.
Confirm no secrets were committed.
Confirm no future-phase features were implemented.
69. Agent Reporting Format

When finished, report exactly:

Phase 03 Status

COMPLETED or BLOCKED

Implemented
...
...
...
Authentication
Registration:
Login:
Logout:
Session:
Email verification:
Password reset:
RBAC
Student:
Institution:
Company:
Admin:
Database
Tables:
Constraints:
Migrations:
Security
Password hashing:
Rate limiting:
Token protection:
CORS:
CSRF:
Security headers:
UI
Login:
Register:
Role selection:
Verification:
Password reset:
Responsive behavior:
Tests
Passed:
Failed:
Remaining Issues
...
