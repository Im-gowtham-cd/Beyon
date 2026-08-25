# BEYON — PHASE 02
# Environment, Configuration & Local Infrastructure

## 1. PHASE OBJECTIVE

Build the complete environment and configuration layer for Beyon.

Phase 01 established the repository and application skeleton.

Phase 02 must now make the following systems properly configurable and connectable:

- React Web
- Spring Boot Backend
- PostgreSQL / Supabase
- MongoDB Atlas
- Upstash Redis
- Supabase Storage
- FastAPI AI Service
- Electron Desktop Assessment App

The goal is to make the project easy to run locally and easy to configure for staging/production later.

Do NOT implement authentication, authorization, student profiles, companies, institutions, skills, challenges, coins, recruitment, assessments, or proctoring.

---

# 2. REQUIRED PROJECT KNOWLEDGE

Before implementation:

1. Read `knowledge.md`.
2. Read `skills.md`.
3. Read `phases/phase-001.md`.
4. Inspect the actual repository produced by Phase 01.
5. Do not assume Phase 01 was implemented perfectly.
6. Fix Phase 01 issues that directly prevent Phase 02 from working.
7. Do not rewrite working architecture unnecessarily.

`knowledge.md` remains the product source of truth.

`skills.md` remains the engineering source of truth.

---

# 3. ENVIRONMENT ARCHITECTURE

Beyon must support:

Development
Testing
Production

Use environment-specific configuration.

Conceptually:

Development
    ↓
Local developer environment
    ↓
Development Supabase / MongoDB / Redis

Testing
    ↓
Automated tests
    ↓
Isolated test configuration

Production
    ↓
Hosted services
    ↓
Production Supabase / MongoDB / Redis

Never mix development and production credentials.

---

# 4. ENVIRONMENT VARIABLES

Create a clear environment variable strategy.

Never hardcode:

- Database credentials
- Supabase keys
- MongoDB URI
- Redis credentials
- JWT secrets
- AI API keys
- Storage credentials
- Encryption secrets

Create/update:

`.env.example`

Document every variable.

---

# 5. WEB ENVIRONMENT

Configure the React application to support environment-specific API URLs.

Example conceptual variables:

VITE_API_BASE_URL=

VITE_APP_ENV=

VITE_APP_NAME=Beyon

Do not expose secret backend credentials through Vite.

Important:

Any variable prefixed with `VITE_` must be considered publicly visible.

Never place:

- database passwords
- service role keys
- private tokens
- JWT secrets

inside frontend environment variables.

---

# 6. BACKEND ENVIRONMENT

Configure Spring Boot using environment variables.

The backend should support:

- Application name
- Server port
- Active profile
- PostgreSQL configuration
- MongoDB configuration
- Redis configuration
- Supabase configuration
- AI service URL
- Logging configuration

Use Spring profiles:

application.yml
application-dev.yml
application-test.yml
application-prod.yml

Avoid duplicating configuration unnecessarily.

---

# 7. DATABASE CONFIGURATION

Configure PostgreSQL/Supabase as the primary structured database.

The configuration should support:

- JDBC URL
- Username
- Password
- Connection pool settings
- SSL where required
- Migration configuration

Do NOT create business tables in this phase.

Do NOT create:

- users
- students
- companies
- institutions
- skills
- jobs
- assessments

Those belong to future phases.

---

# 8. POSTGRESQL MIGRATION STRATEGY

Use Flyway.

Create the migration directory and configuration.

Example structure:

src/main/resources/db/migration/

Future migrations will follow:

V1__...
V2__...
V3__...

Do not create business schema migrations yet.

Create only the migration infrastructure if required.

---

# 9. MONGODB CONFIGURATION

Configure MongoDB Atlas connectivity.

Environment variables should contain the MongoDB connection information.

Prepare:

- MongoDB URI
- Database name
- Connection settings

Create a clean abstraction for MongoDB access.

Do not create actual business collections yet.

Future MongoDB use includes:

- Question bank
- Challenges
- Submission metadata
- Activity logs
- Proctoring events
- AI analysis
- Assessment events

---

# 10. UPSTASH REDIS CONFIGURATION

Configure Upstash Redis.

Use environment variables.

Prepare the backend to support:

- Redis URL
- Redis authentication
- Connection configuration

Do not implement caching business logic yet.

Do not create:

- coin cache
- leaderboard cache
- notification cache
- eligibility cache

Those belong to later phases.

---

# 11. REDIS DESIGN RULE

Redis is a secondary/temporary system.

PostgreSQL or MongoDB remains the source of truth.

Never design the application so that permanent critical data exists only in Redis.

Examples:

Incorrect:

Coin balance exists only in Redis.

Correct:

Coin balance is stored in PostgreSQL.

Redis may cache the balance.

---

# 12. SUPABASE CONFIGURATION

Configure Supabase integration.

The project will eventually use Supabase for:

- PostgreSQL
- Storage
- Potential authentication integration if selected later

For this phase:

- Configure Supabase URL
- Configure required server-side credentials
- Configure storage endpoint information where necessary
- Verify connectivity

Do not implement authentication yet.

Do not expose service-role credentials to the frontend.

---

# 13. SUPABASE STORAGE CONFIGURATION

Prepare storage configuration for future files:

- Resumes
- Certificates
- Profile documents
- Project documents
- Assessment-related files

Do not implement upload UI yet.

Do not create student/company file workflows yet.

Prepare only the configuration/service abstraction.

---

# 14. AI SERVICE CONFIGURATION

Configure the FastAPI AI service.

Environment variables should support:

- Service environment
- Service port
- Model configuration
- Backend callback URL if required
- Future model/API configuration

Do not implement:

- Resume parsing
- Skill extraction
- Recommendations
- LLM chat
- ML models

Only establish configuration and health infrastructure.

---

# 15. AI SERVICE COMMUNICATION

Prepare the architecture for:

Spring Boot
    ↓
AI Service
    ↓
FastAPI

The backend should know the AI service base URL through configuration.

Do not hardcode:

`http://localhost:8000`

Use an environment variable.

Example:

AI_SERVICE_URL=

The actual local value can be documented in `.env.example`.

---

# 16. DESKTOP ENVIRONMENT

Configure the Electron application for:

- Development
- Production build
- Backend API URL

The desktop app must never hardcode production API URLs.

Example conceptual variable:

ASSESSMENT_API_URL=

For Electron security:

- Use context isolation.
- Disable unsafe Node integration in renderer where possible.
- Use preload scripts for controlled native capabilities.
- Do not expose the entire Node API to the renderer.

Do not implement proctoring yet.

---

# 17. DESKTOP SECURITY FOUNDATION

Prepare Electron security defaults.

Ensure:

- `contextIsolation: true`
- `nodeIntegration: false` for renderer
- Controlled preload bridge
- Secure IPC design
- No arbitrary remote code execution
- No loading unknown remote pages

The assessment application will eventually handle sensitive examination information, so security must be established from the beginning.

---

# 18. CONFIGURATION VALIDATION

The backend must validate required environment variables during startup.

If a required production secret is missing:

The application should fail clearly with an understandable configuration error.

Do not allow mysterious runtime failures.

Example conceptual error:

`Missing required environment variable: MONGODB_URI`

Do not print secret values in logs.

---

# 19. SECRET PROTECTION

Search the repository for accidental secrets.

Verify:

- No passwords committed
- No API keys committed
- No Supabase service keys committed
- No MongoDB credentials committed
- No Redis credentials committed
- No JWT secrets committed

Only `.env.example` may contain placeholder values.

---

# 20. LOGGING CONFIGURATION

Create a clean logging strategy.

Development:

- Human-readable logs
- Useful debugging information

Production:

- Structured logs where appropriate
- No secrets
- No passwords
- No tokens
- No sensitive student information

Never log:

- Authentication tokens
- Passwords
- API keys
- Database credentials
- Full sensitive documents
- Webcam/video data
- Private assessment answers unnecessarily

---

# 21. REQUEST CORRELATION

Prepare the backend for request tracing.

Every API request should eventually support a correlation/trace ID.

Conceptually:

Client
  ↓
Request ID
  ↓
Spring Boot
  ↓
Logs
  ↓
External services

If the client provides a valid request ID, handle it safely.

Otherwise generate one.

Do not expose internal infrastructure information.

---

# 22. CORS FOUNDATION

Configure CORS through environment-specific settings.

Development may allow:

Local web application origin

Production must allow only configured trusted origins.

Do NOT use:

`Access-Control-Allow-Origin: *`

for authenticated production APIs.

Do not hardcode production domains.

---

# 23. FRONTEND API CLIENT

Create a centralized API client abstraction.

Do not allow components to directly call `fetch()` everywhere.

Example conceptual structure:

services/
    api/
        client.ts
        config.ts

Future modules can use:

studentApi
companyApi
institutionApi
recruitmentApi
assessmentApi

Do not implement those APIs yet.

---

# 24. BACKEND HTTP CLIENT FOUNDATION

Prepare a standard mechanism for backend-to-service communication.

Future communication includes:

Backend
    ↓
AI Service

Backend
    ↓
Supabase

Backend
    ↓
MongoDB

Backend
    ↓
Redis

Use configurable timeouts.

Avoid infinite waits.

---

# 25. TIMEOUTS

External service calls must have reasonable timeouts.

Do not allow a failed external dependency to hang the entire backend indefinitely.

Prepare configuration for:

- Connection timeout
- Read timeout
- Request timeout

Actual values may be environment-specific.

---

# 26. FAILURE HANDLING

Establish predictable behavior when external services are unavailable.

Examples:

PostgreSQL unavailable:

→ Backend should fail startup if the primary database is required.

Redis unavailable:

→ Application should degrade gracefully if the requested operation is cache-only.

AI service unavailable:

→ Core platform should remain functional where AI is optional.

MongoDB unavailable:

→ Features requiring MongoDB should report dependency failure clearly.

Do not silently lose important data.

---

# 27. HEALTH CHECK DESIGN

Health checks should distinguish:

Application status
Dependency status

Conceptually:

Backend
├── Application
├── PostgreSQL
├── MongoDB
├── Redis
└── AI Service

Do not expose sensitive connection details.

Health responses should only reveal safe status information.

---

# 28. LOCAL DEVELOPMENT DOCUMENTATION

Update README with clear setup instructions.

Required sections:

## Prerequisites

- Node.js
- npm
- Java
- Maven or Maven Wrapper
- Python
- pip
- Git
- MongoDB access
- Supabase project
- Upstash Redis database

## Setup

Clone repository.

Install dependencies.

Configure `.env`.

Start services.

## Running

Web

Backend

AI Service

Desktop Assessment

---

# 29. ENVIRONMENT TEMPLATE

Create clear example files.

Possible structure:

.env.example

apps/web/.env.example

services/backend/.env.example

services/ai-service/.env.example

apps/desktop-assessment/.env.example

Avoid unnecessary duplication.

If a centralized environment strategy is used, document it clearly.

The final approach must be easy for a new developer to understand.

---

# 30. LOCAL SERVICE STARTUP

Verify all applications can run independently.

Required:

### Web

Application loads successfully.

### Backend

Spring Boot starts.

### AI

FastAPI starts.

### Desktop

Electron starts.

The applications do not need complete functionality yet.

---

# 31. DEVELOPMENT SCRIPTING

Create useful root-level scripts where appropriate.

Examples:

- install
- dev
- build
- test
- lint

Do not create scripts that hide errors.

A failed child process should cause the overall command to fail when appropriate.

---

# 32. DEPENDENCY REVIEW

Review dependencies from Phase 01.

Remove unnecessary dependencies.

Do not add libraries simply because they are popular.

Every major dependency should have a clear purpose.

Prefer:

- Mature
- Maintained
- Well-documented
- Open-source
- Lightweight

solutions.

---

# 33. DATABASE CONNECTION TESTS

Create basic integration/connection verification where practical.

Verify:

PostgreSQL connection

MongoDB connection

Redis connection

Do not write business data.

Use safe health/connection checks.

---

# 34. TEST PROFILE

Create a test environment that does not accidentally connect to production.

Important:

Tests must never use production credentials.

Create a safe test configuration.

If external test infrastructure is unavailable, document the limitation rather than silently using production resources.

---

# 35. FRONTEND ENVIRONMENT TEST

Verify:

- Development API URL is loaded correctly.
- Production build uses the correct configured variable.
- Secret environment variables cannot accidentally be imported into frontend code.

---

# 36. DESKTOP ENVIRONMENT TEST

Verify:

- API URL configuration works.
- Renderer cannot access Node APIs directly.
- Preload bridge works.
- Development application launches.

---

# 37. CONFIGURATION DOCUMENTATION

Create:

`docs/configuration.md`

Document:

- All environment variables
- Which application uses them
- Whether they are public/private
- Development usage
- Production usage
- Secret handling

Example:

| Variable | Service | Public? | Purpose |
|---|---|---|---|
| VITE_API_BASE_URL | Web | Yes | Backend URL |
| DATABASE_URL | Backend | No | PostgreSQL |
| MONGODB_URI | Backend | No | MongoDB |
| REDIS_URL | Backend | No | Upstash |
| SUPABASE_URL | Backend | Depends | Supabase |
| SUPABASE_SERVICE_KEY | Backend | No | Server-side access |
| AI_SERVICE_URL | Backend | No | AI service |

Use the actual variables implemented in the project.

---

# 38. ARCHITECTURE DOCUMENTATION

Create/update:

`docs/architecture.md`

Document:

- Monorepo
- Web application
- Backend
- AI service
- Desktop application
- PostgreSQL
- MongoDB
- Redis
- Storage
- Communication boundaries

Keep the diagram simple.

Example:

Web
 ↓
Spring Boot
 ├── PostgreSQL
 ├── MongoDB
 ├── Redis
 ├── Storage
 └── FastAPI AI

Desktop
 ↓
Spring Boot

---

# 39. IMPORTANT DATA RULE

Use the correct storage for the correct purpose.

Structured transactional data:

→ PostgreSQL

Flexible/high-volume event/content data:

→ MongoDB

Temporary/cache data:

→ Redis

Files:

→ Supabase Storage

Do not put everything into one database.

Do not put permanent business data into Redis.

---

# 40. SCALABILITY FOUNDATION

Do not implement actual horizontal scaling yet.

Prepare the architecture so it can scale later.

The backend should remain stateless wherever possible.

Do not store:

- user sessions
- assessment state
- coin balances
- application state

only in local server memory.

Persistent state belongs in appropriate databases.

---

# 41. NO PREMATURE DEVOPS

Do NOT add:

- Kubernetes
- EKS
- Docker Swarm
- Kafka
- Service mesh
- Terraform
- Complex CI/CD infrastructure

in this phase.

The project should remain easy to develop locally.

DevOps/deployment can be introduced when the application has enough functionality to justify it.

---

# 42. SECURITY BASELINE

Apply basic secure development principles:

- No secrets in Git
- Input validation
- Safe error responses
- Secure CORS
- Secure Electron configuration
- Dependency review
- No unsafe eval
- No arbitrary code execution
- No sensitive logging

Do not implement complete authentication security yet.

That belongs to the identity phase.

---

# 43. TESTING

Run:

## Web

- npm install
- lint
- typecheck
- build

## Backend

- compile
- tests
- startup
- health check

## AI

- dependency installation
- startup
- health check

## Desktop

- dependency installation
- startup/build

## Infrastructure

- PostgreSQL connection
- MongoDB connection
- Redis connection

---

# 44. DEFINITION OF DONE

Phase 02 is complete only when:

[ ] Environment strategy is documented.

[ ] `.env.example` files exist where required.

[ ] No real secrets exist in the repository.

[ ] Web environment configuration works.

[ ] Backend environment configuration works.

[ ] PostgreSQL configuration works.

[ ] MongoDB configuration works.

[ ] Upstash Redis configuration works.

[ ] Supabase configuration is prepared.

[ ] Storage configuration is prepared.

[ ] AI service configuration works.

[ ] Electron configuration works.

[ ] Backend validates required configuration.

[ ] Backend has environment-specific profiles.

[ ] CORS is environment-aware.

[ ] Frontend has centralized API configuration.

[ ] Backend has external-service configuration.

[ ] Timeout configuration exists.

[ ] Safe logging configuration exists.

[ ] Health checks work.

[ ] Request correlation foundation exists.

[ ] Documentation is updated.

[ ] Development startup is documented.

[ ] Tests/builds pass.

[ ] No future business functionality was implemented.

---

# 45. FINAL VERIFICATION

Before declaring completion:

1. Start the web application.
2. Start the backend.
3. Start the AI service.
4. Start the desktop application.
5. Verify backend health.
6. Verify AI health.
7. Verify database connectivity.
8. Verify Redis connectivity.
9. Verify environment variable loading.
10. Verify no secrets are exposed.
11. Run linting.
12. Run tests.
13. Run production builds.
14. Review the repository for unnecessary changes.
15. Confirm Phase 01 functionality remains intact.

If anything fails, fix it before completion.

---

# 46. PHASE BOUNDARY

STOP after Phase 02.

Do NOT implement:

- Authentication
- Login
- Registration
- OAuth
- Student profiles
- Company profiles
- Institution profiles
- Skills
- Challenges
- Coins
- Jobs
- Recruitment
- Follows
- Notifications
- Assessments
- Proctoring
- AI recommendations
- Analytics

These belong to later phases.

---

# 47. FINAL RESPONSE FROM AGENT

After implementation, report:

1. Environment architecture created
2. Files/configuration created
3. Services successfully started
4. Database connectivity status
5. Redis connectivity status
6. Health-check status
7. Tests/builds executed
8. Security checks performed
9. Any unresolved issues
10. Confirmation that Phase 03 can begin

Do not claim completion if any Definition of Done item is failing.
