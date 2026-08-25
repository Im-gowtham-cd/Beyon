# Beyon — Phase 05 Implementation Prompt

## 1. Phase Objective

Build the complete authentication and authorization foundation for Beyon.

The system must securely handle:

- Login
- Logout
- Session persistence
- Session restoration
- Password recovery
- Email verification
- Role-based access
- Protected routes
- Unauthorized access
- Profile completion checks
- Role-specific dashboard routing

Supported roles:

- STUDENT
- INSTITUTION
- COMPANY
- ADMIN

ADMIN must never be available through public registration.

---

# 2. Existing System

Phase 04 already provides:

Register
→ Role Selection
→ Role-Specific Onboarding
→ Profile Review
→ Profile Creation

Do not break this flow.

Phase 05 connects authentication with the completed profiles.

---

# 3. Authentication Architecture

Use Supabase Auth for authentication.

Supabase handles:

- Email/password authentication
- Session management
- Email verification
- Password reset
- Secure authentication tokens

PostgreSQL/Supabase stores:

- User application profile
- Role
- Profile status
- Verification status
- Onboarding status

Do NOT duplicate passwords inside application tables.

---

# 4. User Identity Model

The authenticated Supabase user ID is the primary identity.

Application user record:

```text
users
├── id
├── auth_user_id
├── role
├── profile_status
├── email
├── created_at
└── updated_at

Use the authenticated user ID as the ownership reference.

Do not trust a user ID sent from the frontend.

5. Roles

Use an enum/reference architecture:

STUDENT
INSTITUTION
COMPANY
ADMIN

Future roles must be extendable without rewriting the entire authorization system.

6. Profile Status

Create a clear profile lifecycle.

Example:

INCOMPLETE
COMPLETED
PENDING_VERIFICATION
VERIFIED
SUSPENDED
REJECTED

Not every role needs every state.

Example:

Student:

INCOMPLETE
COMPLETED
SUSPENDED

Institution:

INCOMPLETE
PENDING_VERIFICATION
VERIFIED
REJECTED
SUSPENDED

Company:

INCOMPLETE
PENDING_VERIFICATION
VERIFIED
REJECTED
SUSPENDED
7. Login Page

Create:

/login

Design must use the Beyon design system.

Do NOT create a tiny generic authentication card.

Use a balanced split/full-width layout.

Example:

┌──────────────────────────────────────────────────────────────┐
│ BEYON                                                        │
│                                                              │
│  Welcome back                         Sign in                │
│  Continue building your              Email                   │
│  skills and opportunities.            [................]      │
│                                      Password                │
│                                      [................]      │
│                                      Forgot password?         │
│                                      [ SIGN IN ]              │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Keep it spacious.

8. Login Fields

Required:

Email
Password

Optional future support:

OAuth providers

Do not implement social login unless already supported by the existing architecture.

9. Login Validation

Validate:

Email format
Required password

Do not expose whether an email exists in the system through overly specific error messages.

Use safe authentication errors.

10. Login States

Implement:

Default
Sign In
Loading
Signing in...
Error
Unable to sign in.
Please check your credentials and try again.
Success

Redirect based on role.

11. Role-Based Redirect

After successful authentication:

STUDENT
→ /student/dashboard

INSTITUTION
→ /institution/dashboard

COMPANY
→ /company/dashboard

ADMIN
→ /admin/dashboard

Do not allow the frontend to arbitrarily choose the destination.

Determine the role from the authenticated backend/application profile.

12. Onboarding Redirect

If a user has authenticated but has not completed onboarding:

/login
    ↓
Authenticated
    ↓
Profile incomplete
    ↓
/onboarding/{role}

Example:

Student authenticated
+
student profile incomplete
↓
/onboarding/student
13. Verification Redirect

Institution/company accounts requiring verification:

PENDING_VERIFICATION
        ↓
/verification-pending

Show:

Your account is under verification.

You can update your submitted information if permitted.

Do not allow restricted company/institution functionality before verification.

14. Suspended Account

If:

profile_status = SUSPENDED

redirect to:

/account-suspended

Show:

Account status
General reason if allowed
Support/contact option

Do not expose internal moderation information.

15. Email Verification

After registration:

Check your email

We've sent a verification link to:
example@email.com

Provide:

Resend verification email

Implement rate limiting/cooldown on resend.

Example:

Resend available in 45s
16. Password Recovery

Create:

/forgot-password

Flow:

Enter email
↓
Send reset email
↓
Open reset link
↓
/reset-password
↓
Enter new password
↓
Confirm password
↓
Password updated
↓
Login

Do not reveal whether an account exists.

Use a generic success message.

17. Password Requirements

Implement reasonable password requirements.

At minimum:

Minimum length
Confirmation match

Do not unnecessarily force complicated password rules that harm usability.

Never store passwords manually.

Supabase Auth remains responsible for password handling.

18. Logout

Provide logout from all authenticated application layouts.

Logout must:

Clear the active authentication session.
Clear client-side user state.
Clear temporary protected application state.
Redirect to /login.

After logout, protected pages must no longer be accessible.

19. Session Restoration

When the application reloads:

Browser refresh
↓
Check Supabase session
↓
Load application user
↓
Load role
↓
Load profile status
↓
Determine destination

Avoid displaying the login page briefly while a valid session is being restored.

Use an authentication loading/splash state.

20. Auth Provider

Create a central authentication state manager.

Example conceptual structure:

AuthProvider
├── user
├── session
├── role
├── profile
├── loading
├── signIn()
├── signOut()
├── refreshProfile()
└── isAuthenticated

Do not duplicate authentication logic across individual pages.

21. Protected Route System

Create reusable route protection.

Conceptually:

ProtectedRoute
├── authentication check
├── role check
├── profile status check
└── authorization result

Examples:

/student/*
    → STUDENT only

/institution/*
    → INSTITUTION only

/company/*
    → COMPANY only

/admin/*
    → ADMIN only
22. Prevent Cross-Role Access

Student attempting:

/company/dashboard

must receive:

403 / unauthorized

or be redirected to their own dashboard.

Company attempting:

/institution/dashboard

must be blocked.

Institution attempting:

/admin/dashboard

must be blocked.

Frontend route guards are NOT enough.

Backend authorization is mandatory.

23. Unauthorized Page

Create:

/unauthorized

Design:

Access restricted.

You don't have permission to access this area.

[ Go to Dashboard ]

Keep it consistent with Beyon's visual system.

24. Not Found Page

Create:

/404

Example:

404

This page doesn't exist.

[ Back to Beyon ]
25. Role-Aware Navigation

Navigation must dynamically depend on role.

Student:

Dashboard
Practice
Assessments
Opportunities
Portfolio
Leaderboard

Institution:

Overview
Students
Companies
Placements
Analytics

Company:

Overview
Drives
Candidates
Institutions
Analytics

Admin:

Overview
Users
Institutions
Companies
Moderation
Analytics

Only display routes the user can access.

26. Profile Menu

Authenticated users should have:

Avatar
Name
Role
Profile
Settings
Logout

Example:

┌────────────────────────────┐
│ Gotamu                     │
│ Student                    │
├────────────────────────────┤
│ View Profile               │
│ Settings                   │
│ Security                   │
├────────────────────────────┤
│ Sign Out                   │
└────────────────────────────┘
27. Account Settings

Create a basic:

/settings

with:

Account
Name
Email
Role
Security
Change password
Email verification status
Session
Logout

Do not implement advanced security features in this phase unless already available.

28. Email Change

If supported by Supabase:

Allow email change through the secure verification flow.

Do not immediately replace the existing email without confirmation.

29. Application User API

Create a secure endpoint such as:

GET /api/v1/me

Response concept:

{
  "id": "...",
  "role": "STUDENT",
  "profileStatus": "COMPLETED",
  "profile": {}
}

Never return:

Password
Auth secrets
Private tokens
Internal security data
30. Backend Authorization Middleware

Create reusable authorization middleware.

Conceptually:

requireAuth()
requireRole("STUDENT")
requireRole("COMPANY")
requireRole("INSTITUTION")
requireRole("ADMIN")

Support multiple roles when needed:

requireRole("COMPANY", "INSTITUTION")
31. Database Security

If using Supabase directly from the frontend, configure Row Level Security carefully.

Users should only be able to access their own private profile data.

Conceptually:

user.id == authenticated_user.id

Do not create policies that allow:

everyone → read everything

Sensitive documents must remain protected.

32. Profile Visibility

Separate profile data into:

Private

Examples:

Phone
Email
Documents
Resume
Verification documents
Internal application data
Public/Discoverable

Future examples:

Display name
Skills
Projects
Certifications
Portfolio

Do not expose private fields through public profile endpoints.

33. Authentication API Error Handling

Standardize errors.

Example:

{
  "success": false,
  "code": "AUTH_INVALID_CREDENTIALS",
  "message": "Unable to sign in with the provided credentials."
}

Use consistent frontend handling.

34. Security Requirements

Implement:

Authentication checks
Authorization checks
Ownership checks
Input validation
Secure session handling
Protected API endpoints
Protected file access
Rate limiting where appropriate
Generic authentication error messages

Never trust:

Role from request body
User ID from request body
Profile ownership from request body
35. Role Tampering Prevention

This is critical.

A user must NOT be able to send:

{
  "role": "ADMIN"
}

and become an administrator.

Admin role assignment must happen through a secure administrative mechanism.

Public registration can only create:

STUDENT
INSTITUTION
COMPANY
36. Account Creation Rules
Student

Can register directly.

Institution

Can register, then verification is required.

Company

Can register, then verification is required.

Admin

Cannot register publicly.

37. Duplicate Accounts

Handle duplicate email addresses gracefully.

Do not create duplicate application users for the same authentication identity.

Use database constraints.

38. Database Constraints

Add appropriate constraints for:

Auth user ID uniqueness
Email uniqueness where appropriate
Role validity
Profile ownership
Required relationships

Avoid relying only on frontend validation.

39. Authentication Loading UX

Create a Beyon loading state.

Example:

B
Restoring your session...

Keep it minimal.

Do not show a dashboard until authentication/profile state is known.

40. Route Transition Logic

Handle:

Unauthenticated
Authenticated
Incomplete profile
Pending verification
Verified
Suspended

as separate application states.

Do not create one giant conditional inside every page.

Centralize this logic.

41. State Diagram

Implement the conceptual state machine:

                 ┌───────────────┐
                 │ Unauthenticated│
                 └───────┬───────┘
                         │ Login
                         ▼
                 ┌───────────────┐
                 │ Authenticated │
                 └───────┬───────┘
                         │
              ┌──────────┼───────────┐
              ▼          ▼           ▼
         Incomplete   Pending      Active
         Profile      Verify       Profile
              │          │           │
              ▼          ▼           ▼
        Onboarding   Verification  Dashboard

Suspended accounts branch to:

/account-suspended
42. Do NOT Implement

Do NOT implement:

Beyon Coins
Daily challenges
Weekend challenges
Skill assessments
Company job posting
Recruitment drives
Company application purchase
Following
Notifications
Leaderboards
Proctored assessments
AI recommendation engine
Institution rating calculation

These belong to later phases.

43. Testing

Test at minimum:

Authentication

[ ] Register
[ ] Login
[ ] Logout
[ ] Session restoration
[ ] Password reset
[ ] Email verification

Roles

[ ] Student login
[ ] Institution login
[ ] Company login
[ ] Admin login

Authorization

[ ] Student cannot access institution routes
[ ] Student cannot access company routes
[ ] Student cannot access admin routes

[ ] Institution cannot access company routes
[ ] Institution cannot access admin routes

[ ] Company cannot access institution routes
[ ] Company cannot access admin routes

[ ] Non-admin cannot access admin routes

Profile state

[ ] Incomplete profile redirects to onboarding
[ ] Completed student goes to dashboard
[ ] Pending company goes to verification page
[ ] Pending institution goes to verification page
[ ] Suspended user is blocked

Security

[ ] User cannot modify another user's profile
[ ] User cannot change their own role
[ ] User cannot become admin
[ ] Private documents are protected
[ ] Backend authorization works independently of frontend guards

44. UI/UX Testing

Check:

[ ] Login page alignment
[ ] Forgot-password page
[ ] Reset-password page
[ ] Verification page
[ ] Unauthorized page
[ ] Suspended page
[ ] Session loading screen
[ ] Profile menu
[ ] Settings page

Desktop:

[ ] No cramped layout
[ ] Correct spacing
[ ] Correct typography

Mobile:

[ ] No horizontal scrolling
[ ] Inputs full width
[ ] Buttons accessible
[ ] Navigation usable

45. Definition of Done

Phase 05 is complete only when:

[ ] Supabase authentication is integrated.

[ ] Login works.

[ ] Logout works.

[ ] Session restoration works.

[ ] Password recovery works.

[ ] Email verification works.

[ ] Role is securely associated with the application user.

[ ] Role-based redirects work.

[ ] Profile completion redirects work.

[ ] Institution/company verification states work.

[ ] Suspended accounts are blocked.

[ ] Protected routes work.

[ ] Backend authorization works.

[ ] Cross-role access is blocked.

[ ] Admin cannot be created through public registration.

[ ] Profile ownership is enforced.

[ ] Private documents remain protected.

[ ] Navigation is role-aware.

[ ] Settings page works.

[ ] Unauthorized page works.

[ ] 404 page works.

[ ] Authentication loading state works.

[ ] Existing Phase 04 onboarding continues to work.

[ ] Production build succeeds.

[ ] Tests pass.

46. Agent Completion Report

When finished, report:

Phase 05 Status

COMPLETED / BLOCKED

Authentication
Supabase Auth:
Login:
Logout:
Session:
Password Reset:
Email Verification:
Authorization
RBAC:
Route Protection:
Backend Middleware:
Ownership:
Roles
Student:
Institution:
Company:
Admin:
Profile States
Incomplete:
Pending Verification:
Completed:
Suspended:
Security
RLS:
API Authorization:
Role Tampering:
Private Files:
UI
Login:
Reset:
Verification:
Unauthorized:
Settings:
Tests
Passed:
Failed:
