# BEYON — PHASE 01
# Project Architecture & Repository Setup

## Phase Objective

Create the initial production-oriented repository and establish the architectural foundation for Beyon.

This phase must create a clean monorepo structure for:

1. Beyon Web Application
2. Beyon Backend
3. Beyon Desktop Assessment Application
4. Beyon AI Service
5. Shared documentation/configuration

Do NOT implement business features such as recruitment, coins, challenges, assessments, proctoring, AI recommendations, or dashboards in this phase.

The goal is to create a stable foundation that all future phases can extend without restructuring the project.

---

# 1. READ PROJECT KNOWLEDGE FIRST

Before doing anything:

1. Read `knowledge.md`.
2. Read `skills.md`.
3. Understand the complete Beyon architecture.
4. Identify the technologies defined by the project.
5. Do not replace the selected technologies without a strong technical reason.
6. Do not simplify the architecture by removing planned components.
7. Do not implement future-phase functionality.

`knowledge.md` is the source of truth for product requirements.

`skills.md` is the source of truth for the engineering roles and development standards.

---

# 2. PROJECT TECHNOLOGY

Use the following stack.

## Web

- React
- Vite
- TypeScript
- Pure CSS

Do NOT use:

- Tailwind CSS
- Bootstrap
- Material UI as the primary design system

Create a custom Beyon design system using reusable CSS variables and components.

---

## Backend

- Java
- Spring Boot
- Maven

Use a modular monolith architecture.

Do NOT create dozens of microservices.

The backend must be structured so modules can later be separated if scaling requires it.

---

## Structured Database

- Supabase PostgreSQL

Use PostgreSQL for relational/transactional data.

---

## Flexible Data

- MongoDB Atlas

Use MongoDB for flexible/high-volume data.

---

## Cache

- Upstash Redis

Redis must never be treated as the primary source of truth.

---

## File Storage

- Supabase Storage

---

## AI Service

- Python
- FastAPI

Do not implement AI functionality yet.

Only establish the service structure.

---

## Desktop Assessment

- Electron
- React
- TypeScript

Do not implement the assessment system yet.

Only establish the desktop application foundation.

---

# 3. MONOREPO STRUCTURE

Create the following high-level structure:

Beyon/

    apps/
        web/
        desktop-assessment/

    services/
        backend/
        ai-service/

    packages/
        shared-types/
        shared-config/

    docs/

    scripts/

    .github/

    knowledge.md
    skills.md
    README.md
    .gitignore
    .editorconfig

Use a structure that allows each application/service to be developed independently while sharing common configuration/types where appropriate.

---

# 4. WEB APPLICATION

Create:

`apps/web`

Initialize:

- React
- Vite
- TypeScript

Configure:

- Strict TypeScript
- ESLint
- Prettier
- Development environment
- Production build

Create a minimal application shell.

The application should start successfully with:

npm run dev

and production build must succeed.

Do not build the actual Beyon dashboard yet.

---

# 5. WEB APPLICATION ARCHITECTURE

Prepare the following structure:

apps/web/src/

    app/
    components/
    layouts/
    pages/
    routes/
    hooks/
    services/
    lib/
    utils/
    types/
    styles/
    assets/

Purpose:

### app/

Application-level configuration.

### components/

Reusable UI components.

### layouts/

Reusable page layouts.

### pages/

Route-level pages.

### routes/

Routing configuration.

### hooks/

Reusable React hooks.

### services/

API communication.

### lib/

Third-party integrations and shared utilities.

### utils/

Generic helper functions.

### types/

Frontend-specific TypeScript types.

### styles/

Global styles and design tokens.

### assets/

Static frontend assets.

Do not create huge files.

---

# 6. BACKEND APPLICATION

Create:

`services/backend`

Initialize a Spring Boot application using Maven.

Use:

- Java
- Spring Boot
- Spring Web
- Validation
- Actuator
- PostgreSQL driver
- MongoDB driver
- Redis client/support
- Lombok only if genuinely useful

Do not add unnecessary dependencies.

---

# 7. BACKEND PACKAGE ARCHITECTURE

Use a modular package structure similar to:

services/backend/src/main/java/.../

    BeyonApplication.java

    config/
    common/
        exception/
        response/
        validation/
        security/

    modules/
        identity/
        student/
        company/
        institution/
        skills/
        learning/
        gamification/
        recruitment/
        assessment/
        notification/
        analytics/

At this stage, these modules should be architectural placeholders only.

Do not implement their business logic.

---

# 8. MODULAR MONOLITH RULE

The backend must follow this principle:

Each domain module should have clear boundaries.

Future modules include:

Identity
Student
Company
Institution
Skills
Learning
Gamification
Recruitment
Assessment
Notification
Analytics

Avoid creating one giant:

`controller/`
`service/`
`repository/`

structure containing everything.

Organize business logic by domain.

---

# 9. BACKEND LAYERS

Each future domain should be capable of using:

Controller
    ↓
Application/Service
    ↓
Domain
    ↓
Repository
    ↓
Database

Do not put business logic inside controllers.

Controllers should handle HTTP concerns.

Services should handle application/business operations.

Repositories should handle persistence.

---

# 10. API FOUNDATION

Establish API conventions.

Base API:

`/api/v1`

Example future endpoints:

`/api/v1/auth/...`

`/api/v1/students/...`

`/api/v1/companies/...`

`/api/v1/institutions/...`

`/api/v1/challenges/...`

`/api/v1/recruitment/...`

Do not implement these business endpoints yet.

Only establish the convention.

---

# 11. API RESPONSE STANDARD

Create a common response strategy.

Success responses should have a predictable structure.

Errors should have:

- HTTP status
- application error code
- message
- timestamp
- request/trace identifier where available
- optional validation details

Example conceptual structure:

{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid request",
        "details": []
    },
    "timestamp": "...",
    "traceId": "..."
}

Do not expose stack traces or internal exceptions to clients.

---

# 12. GLOBAL EXCEPTION HANDLING

Create centralized exception handling.

Handle at least:

- Validation errors
- Illegal arguments
- Resource not found
- Unauthorized access
- Forbidden access
- Conflict
- Unexpected server errors

Return consistent JSON responses.

---

# 13. CONFIGURATION MANAGEMENT

Do not hardcode:

- Database URLs
- Database passwords
- API keys
- Redis credentials
- Supabase credentials
- MongoDB credentials
- AI keys
- JWT secrets
- Storage credentials

Use environment variables.

Create:

`.env.example`

Include placeholders such as:

DATABASE_URL=
DATABASE_USERNAME=
DATABASE_PASSWORD=

MONGODB_URI=

REDIS_URL=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

AI_SERVICE_URL=

JWT_SECRET=

Never commit actual secrets.

---

# 14. ENVIRONMENT SEPARATION

Prepare support for:

- Development
- Test
- Production

Use appropriate Spring configuration files.

Example:

application.yml

application-dev.yml

application-test.yml

application-prod.yml

Do not create production credentials.

Only create the configuration structure.

---

# 15. DATABASE CONFIGURATION

Prepare PostgreSQL connectivity.

Do not create the complete Beyon database schema yet.

Only establish:

- Configuration
- Connection mechanism
- Migration strategy
- Health checking

Use a database migration tool such as Flyway.

The database schema will be implemented in later phases.

---

# 16. MONGODB CONFIGURATION

Prepare MongoDB configuration.

Do not create question/challenge/proctoring collections yet.

Only establish:

- Configuration
- Connection mechanism
- Health checking
- Repository architecture

---

# 17. REDIS CONFIGURATION

Prepare Upstash Redis integration.

Do not implement:

- Coins
- Leaderboards
- Notifications
- Eligibility cache

yet.

Only establish the connection/configuration layer.

Redis must be treated as a cache/temporary data layer.

---

# 18. AI SERVICE FOUNDATION

Create:

`services/ai-service`

Use:

- Python
- FastAPI

Create a minimal service.

Include:

- Application entry point
- Configuration
- Health endpoint
- Requirements/dependency file
- Environment configuration

Example:

GET `/health`

Response:

{
    "status": "ok",
    "service": "beyon-ai"
}

Do not implement machine learning or LLM functionality.

---

# 19. DESKTOP APPLICATION FOUNDATION

Create:

`apps/desktop-assessment`

Use:

- Electron
- React
- TypeScript

The application should launch successfully.

Create a minimal desktop shell.

Do NOT implement:

- Proctoring
- Camera
- Microphone
- Exam timer
- Assessment questions
- Coding editor
- Anti-cheat
- Screen monitoring

Those belong to later phases.

---

# 20. SHARED TYPES

Create:

`packages/shared-types`

This package is intended for types that genuinely need to be shared between applications.

Do not duplicate everything into shared types.

Only place cross-application contracts here when necessary.

Prepare the package structure but avoid prematurely defining the entire domain model.

---

# 21. SHARED CONFIGURATION

Create:

`packages/shared-config`

Use this for shared development configuration where useful.

Examples:

- TypeScript base configuration
- Formatting conventions
- ESLint shared configuration

Do not force sharing where it creates unnecessary coupling.

---

# 22. CODE QUALITY

Configure:

- ESLint
- Prettier
- EditorConfig
- TypeScript strict mode

Use consistent naming.

Recommended:

Classes → PascalCase

Functions → camelCase

Variables → camelCase

Constants → UPPER_SNAKE_CASE where appropriate

React components → PascalCase

Files should have predictable naming.

---

# 23. GIT CONFIGURATION

Create a strong `.gitignore`.

Ignore:

- node_modules
- build output
- dist
- target
- .env
- IDE files
- OS-generated files
- Python virtual environments
- logs
- temporary files

Never commit secrets.

---

# 24. DOCUMENTATION

Create:

`README.md`

The README should explain:

1. What Beyon is
2. Main technologies
3. Repository structure
4. Prerequisites
5. How to run the web app
6. How to run the backend
7. How to run the AI service
8. How to run the desktop app
9. Environment configuration
10. Current implementation status

Do not claim features that haven't been implemented.

---

# 25. DEVELOPMENT COMMANDS

The repository should make it straightforward to run:

Web:

npm run dev

Desktop:

npm run dev

Backend:

./mvnw spring-boot:run

AI:

uvicorn app.main:app --reload

The exact commands may differ slightly depending on the chosen project structure, but they must be documented.

---

# 26. HEALTH CHECKS

Establish basic health checks.

Backend:

`GET /actuator/health`

AI:

`GET /health`

Later phases may expose infrastructure health through the backend.

Do not expose sensitive infrastructure information.

---

# 27. INITIAL WEB UI

Create only a minimal Beyon application shell.

It should include:

- Beyon logo/name
- Basic navigation placeholder
- Main content area
- Theme foundation
- Responsive layout foundation

Do not create:

- Student dashboard
- Company dashboard
- Institution dashboard
- Challenge page
- Recruitment page

Those belong to later phases.

The UI should already feel like the beginning of a professional product rather than a default Vite template.

---

# 28. DESIGN FOUNDATION

Create CSS variables for:

- Background
- Surface
- Primary text
- Secondary text
- Border
- Primary accent
- Success
- Warning
- Error
- Information
- Spacing
- Border radius
- Shadows
- Typography scale

Do not overdesign the system yet.

The goal is consistency for future phases.

---

# 29. ARCHITECTURAL RULES

The agent MUST follow these rules:

1. Do not create unnecessary microservices.
2. Do not duplicate business logic.
3. Do not put secrets in source code.
4. Do not use mock APIs as permanent implementations.
5. Do not hardcode business rules.
6. Do not implement future features prematurely.
7. Do not introduce unnecessary libraries.
8. Keep modules independently understandable.
9. Keep code testable.
10. Prefer maintainability over cleverness.
11. Do not delete existing functionality.
12. Do not rewrite unrelated files.
13. Do not make architectural changes without documenting them.

---

# 30. TESTING

At minimum:

### Web

Verify:

- TypeScript compilation
- Production build
- Application startup

### Backend

Verify:

- Compilation
- Application startup
- Health endpoint
- Global exception handling

### AI

Verify:

- Service startup
- Health endpoint

### Desktop

Verify:

- Electron application starts
- Renderer loads correctly

Do not create extensive business tests because business functionality does not exist yet.

---

# 31. DEFINITION OF DONE

Phase 01 is complete only when ALL of the following are true:

[ ] Monorepo structure exists.

[ ] Web application starts.

[ ] Web production build succeeds.

[ ] Backend starts successfully.

[ ] Backend health endpoint works.

[ ] Backend has modular domain structure.

[ ] PostgreSQL configuration exists.

[ ] MongoDB configuration exists.

[ ] Upstash Redis configuration exists.

[ ] Environment variables are externalized.

[ ] `.env.example` exists.

[ ] AI service starts successfully.

[ ] AI health endpoint works.

[ ] Electron assessment application starts.

[ ] Shared packages are configured.

[ ] ESLint/Prettier/TypeScript configuration exists.

[ ] `.gitignore` is configured.

[ ] README exists.

[ ] No real secrets are committed.

[ ] No future business functionality has been falsely implemented.

[ ] Project structure is documented.

---

# 32. FINAL VERIFICATION

Before declaring completion:

1. Run every application.
2. Verify every build.
3. Verify every health endpoint.
4. Check environment configuration.
5. Check for hardcoded secrets.
6. Check for unnecessary dependencies.
7. Check repository structure.
8. Check TypeScript strictness.
9. Check backend compilation.
10. Check that no future phase functionality was accidentally implemented.

If something is incomplete, fix it before reporting completion.

---

# 33. PHASE BOUNDARY

STOP after Phase 01.

Do NOT implement:

- Authentication
- Student registration
- Company registration
- Institution registration
- Student dashboard
- Skills
- Challenges
- Coins
- Jobs
- Recruitment
- Follow system
- Notifications
- Assessments
- Desktop proctoring
- AI recommendations
- Analytics

These will be implemented in subsequent phases.

---

# FINAL RESPONSE REQUIRED FROM AGENT

After implementation, report:

1. What was created
2. Repository structure
3. Technologies configured
4. Commands used to verify each application
5. Tests/builds passed
6. Any remaining issues
7. Files that should be reviewed before Phase 02

Do not claim Phase 01 is complete if any Definition of Done item is failing.