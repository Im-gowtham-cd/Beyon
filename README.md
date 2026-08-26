# Beyon

**The Complete Campus-to-Career Platform**

Beyon connects students, institutions, and companies through skill development, proctored assessments, and intelligent matching — creating a transparent pathway from campus to career.

## Architecture

```
                         BEYON
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
     STUDENT           INSTITUTION          COMPANY
        │                  │                  │
   Learn & Practice    Manage Students    Recruit & Assess
        │                  │                  │
    Earn Coins          Placement Data    Assessments
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                    MATCHING ENGINE
                           │
                           ▼
                  PROCTORED ASSESSMENT
                           │
                           ▼
                      INTERVIEW
                           │
                           ▼
                    DIGITAL PORTFOLIO
                           │
                           ▼
                       COMMUNITY
                           │
                           ▼
                  CAREER DEVELOPMENT
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, React Router v7 |
| **Backend** | Spring Boot 3.4, Java 21, Spring Security, Spring Data JPA |
| **Database** | Supabase PostgreSQL 17 |
| **Cache** | Upstash Redis |
| **Desktop** | Electron, React |
| **Build** | Bun, Maven |
| **Testing** | Vitest, Testing Library, JUnit 5, Mockito |

## Features

### For Students
- **Practice System** — Daily challenges, question bank, topic-based practice
- **Coin Economy** — Earn coins through practice, spend on opportunities
- **Skill Intelligence** — Unified skill profile with confidence scores, evidence, trends
- **Career Roadmap** — Personalized career paths with prerequisite tracking
- **Opportunities** — Company assessments with eligibility matching
- **Digital Portfolio** — Verified achievements, projects, certifications
- **Community** — Social feed, discussion forums, messaging
- **Personalized Dashboard** — AI-powered recommendations based on your profile

### For Institutions
- **Student Management** — Track academic performance and placement preferences
- **Placement Drives** — Coordinate company visits and student eligibility
- **Analytics** — Department performance, skill demand, placement rates
- **Industry Collaboration** — Workshops, mentorships, live projects

### For Companies
- **Candidate Intelligence** — Search, filter, rank candidates by match score
- **Assessment Engine** — Create assessments with configurable policies
- **Desktop Proctoring** — Fullscreen lock, camera monitoring, focus detection
- **Recruitment Pipeline** — Applications → Assessment → Shortlist → Interview → Hire
- **Analytics** — Application funnel, institution performance, skill distribution

## Getting Started

### Prerequisites
- Java 21
- Bun (or npm/yarn)
- Docker (for local PostgreSQL)

### Local Development

```bash
# Start local PostgreSQL
docker run -d --name beyon-postgres -e POSTGRES_PASSWORD=beyon123 -e POSTGRES_DB=beyon -p 5432:5432 postgres:17

# Start backend
bun run dev:backend

# Start frontend (new terminal)
bun run dev:frontend

# Start desktop app (new terminal)
bun run dev:desktop
```

### Environment Variables

Create `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=beyon
DB_USERNAME=postgres
DB_PASSWORD=beyon123
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key-here-min-256-bits
```

## Project Structure

```
├── backend/                    # Spring Boot API
│   ├── src/main/java/com/beyon/
│   │   ├── identity/          # Auth, JWT, users
│   │   ├── profile/           # Student/company/institution profiles
│   │   ├── practice/          # Questions, coins, challenges, leaderboard
│   │   ├── assessment/        # Proctored assessment system
│   │   ├── intelligence/      # Matching, career paths, gaps, analytics
│   │   ├── institution/       # Institution portal
│   │   ├── social/            # Follow system
│   │   ├── community/         # Feed, discussions, messaging, notifications
│   │   ├── platform/          # Health, caching, jobs, files, security
│   │   ├── notification/      # Notification system
│   │   ├── recruitment/       # Application pipeline
│   │   ├── config/            # Security, CORS, Redis, logging
│   │   └── common/            # ApiResponse, exceptions
│   └── src/main/resources/
│       └── db/migration/      # Flyway V1–V13
├── web/                        # React SPA
│   └── src/
│       ├── auth/              # Login, register, forgot password
│       ├── student/           # Student profile, skills
│       ├── practice/          # Practice, challenges, leaderboard
│       ├── assessment/        # Assessment flow
│       ├── intelligence/      # Skill profile, career paths, analytics
│       ├── community/         # Feed, discussions, portfolio, dashboard
│       ├── institution/       # Institution dashboard
│       └── app/               # App routing
├── desktop/                    # Electron Desktop Assessment App
│   └── src/
│       ├── main/              # Electron main process
│       ├── preload/           # Secure IPC bridge
│       └── renderer/          # Assessment UI
└── phases/                     # Implementation roadmap
```

## Database

12 Flyway migrations, 91+ tables:

| Migration | Tables |
|-----------|--------|
| V1 | Users, email verification, password reset |
| V2 | Student profiles, skills, certifications, projects |
| V3 | Profile status fields |
| V4 | Skills taxonomy, topics, subtopics |
| V5 | Questions, options, test cases, attempts |
| V6 | Coin wallets, transactions, streaks, leaderboard |
| V7 | Company opportunities, applications, eligibility |
| V8 | Assessment sessions, answers, proctoring, policies |
| V9 | Intelligence: matching, career paths, gaps, interviews, analytics |
| V10 | Social: posts, comments, discussions, messaging, content |
| V11 | Reputation, verification, smart notifications |
| V12 | 60+ performance indexes, background jobs, audit log, privacy |
| V13 | Staging seed data |

## API

100+ REST endpoints under `/api/v1/`:

- `/auth/*` — Registration, login, verification, password reset
- `/profile/*` — Student/company/institution profiles
- `/skills/*` — Skill taxonomy explorer
- `/questions/*` — Question bank
- `/practice/*` — Practice sessions
- `/coins/*` — Coin wallet and transactions
- `/daily-challenge/*` — Daily challenges
- `/gamification/*` — Streaks, achievements, leaderboard
- `/opportunities/*` — Company opportunities
- `/applications/*` — Job applications
- `/institution/*` — Institution management
- `/recruitment/*` — Recruitment pipeline
- `/assessment/*` — Proctored assessment
- `/proctoring/*` — Proctoring events
- `/evaluation/*` — Assessment evaluation
- `/matching/*` — Candidate matching
- `/career-paths/*` — Career roadmap
- `/interviews/*` — Interview management
- `/analytics/*` — Institution & company analytics
- `/collaboration/*` — Academia-industry programs
- `/social/*` — Social feed
- `/discussions/*` — Discussion forums
- `/achievements/*` — Verified achievements
- `/messages/*` — Direct messaging
- `/dashboard/*` — Personalized dashboard, notifications, reputation
- `/feedback/*` — Beta feedback
- `/privacy/*` — Privacy settings, consent, data export
- `/verifications/*` — Project & entity verification
- `/health` — Health check
- `/ready` — Readiness probe
- `/metrics` — JVM & service metrics
- `/monitoring/dashboard` — Production monitoring

## Testing

```bash
# Frontend tests
cd web && bun run test

# Backend tests
cd backend && ./mvnw test
```

## Deployment

See [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) for full deployment guide.

## License

Proprietary — Beyon 2026
