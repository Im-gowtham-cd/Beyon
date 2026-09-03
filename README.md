# Beyon

**AI-Powered Unified Campus-to-Career Ecosystem & Secure Assessment Platform**

Beyon connects students, institutions, and enterprise recruiters through competency engineering, 109-node skill taxonomy intelligence, live computer vision proctored assessments, and automated placement pipelines.

---

## System Architecture

```
                                    BEYON MONOREPO
                                          │
    ┌───────────────────────────┬─────────┴──────────┬───────────────────────────┐
    ▼                           ▼                    ▼                           ▼
WEB APPLICATION        DESKTOP LOCKDOWN APP    NATIVE ANDROID APP       REACT NATIVE CLIENT
(React 19, TS 6, Vite) (Electron 43, React 19) (Kotlin, Android 34)     (Cross-Platform)
4 Role Portals         Hardware Kiosk Lock     Material 3, OkHttp       Practice, Taxonomy,
50+ Dynamic Routes     AI Proctoring (600ms)   10.0.2.2 Direct Gateway  Opportunities, Badges
    │                           │                    │                           │
    └───────────────────────────┼────────────────────┴───────────────────────────┘
                                ▼
                   HTTPS / REST API / JWT BEARER
                                │
    ┌───────────────────────────┴───────────────────────────────────────────────┐
    ▼                                                                           ▼
SPRING BOOT API GATEWAY (:8085)                                     FASTAPI AI SERVICE (:8000)
Java 21, Spring Security 6, Hibernate 6, JJWT                       Python 3.11, Uvicorn, Pydantic
├── Identity & Auth (JWT, BCrypt, Refresh)                          ├── NLP Text Analysis
├── 109 Skills Taxonomy & Graph Matrix                              ├── Skill Embedding Vectors
├── Practice MCQ Arena & Coin Economy (⚡)                          ├── Adaptive Challenge Engine
├── Desktop Assessment Orchestrator                                 └── Opportunity Matching AI
├── Recruitment Pipeline & Candidate Intelligence
├── Institution Batch Analytics & Placement Drives
└── Social Feed, Discussions & Verifications
                                │
    ┌───────────────────────────┼───────────────────────────┬───────────────────┐
    ▼                           ▼                           ▼                   ▼
POSTGRESQL 17 / DOLT        MONGODB ATLAS              UPSTASH REDIS      CLOUD STORAGE
(Supabase Prod / Dolt Dev)  (:27017)                   (:6379)            (Supabase / Appwrite)
91+ Tables, 27 Flyway Migr  Proctoring Telemetry Logs  Session Cache      Resume PDFs, Proofs,
60+ Composite Indexes       Submission Payloads        Leaderboards       Verified Certificates
```

---

## Technology Stack

| Layer | Technologies & Frameworks |
|---|---|
| **Web Frontend** | React 19.2, TypeScript 6.0, Vite 8.2, React Router DOM v7.18, Lucide React, CSS Modules, Vitest |
| **Desktop Lockdown** | Electron 43.4, React 19, TypeScript 7.0, Vite 8, WebRTC, Web Audio API, Canvas Computer Vision |
| **Mobile App (Native)** | Kotlin 1.8, Android SDK 34 (Android Studio), ViewBinding, Material 3, OkHttp 4.12, Gson, Coroutines |
| **Mobile App (Cross-Platform)** | React Native, Expo, TypeScript, React Context |
| **Backend API Gateway** | Java 21, Spring Boot 3.4.1, Spring Security 6, Spring Data JPA, Hibernate 6, JJWT 0.12, Flyway, Maven |
| **AI Microservice** | Python 3.11+, FastAPI 0.115+, Uvicorn, Pydantic v2 |
| **Primary Relational DB** | PostgreSQL 17 (Supabase hosted) / Dolt MySQL 3306 (Git-versioned SQL for local dev) |
| **Document Store** | MongoDB Atlas (:27017) for telemetry, proctoring streams, high-volume event logs |
| **Cache & Real-Time** | Upstash Redis (:6379) with Lettuce connection pooling, sliding window rate limiting |
| **Object Storage** | Supabase Storage / Appwrite Cloud Storage for resumes, verification artifacts, certificates |
| **Monorepo & Tooling** | Bun Workspaces, Concurrently, Oxlint, Vitest, JUnit 5, Mockito |

---

## Key Modules & Platform Features

### 1. Student Portal (`RoleGuard['STUDENT']`)
- **Practice Arena & Gamification**: 300+ MCQ, SQL & algorithmic challenges with instant technical explanations.
- **Coin & XP Economy**: Daily streak tracker, XP score levels, and Beyon Coins (⚡) ledger.
- **109 Verified Skill Taxonomy**: Multi-domain matrix (GPU & CUDA, Triton, Distributed Systems, Raft, LLM Fine-Tuning, vLLM).
- **Career Roadmap & Advisor**: Dynamic gap analysis, prerequisites graph, and context-aware career chat advisor.
- **Placement & Opportunities**: Direct 1-click applications with eligibility matching scores.
- **Digital Portfolio**: Verifiable credentials with cryptographic certificate lookup (`/verify/:certificateNumber`).
- **Community Hub**: Personalized feed, discussions, mentorship pairings, and collaborative project teams.

### 2. Desktop Assessment Client & Real-Time AI Proctoring
- **Kiosk Mode Lock**: Hardware-accelerated fullscreen enforcement, task switcher intercept, minimize prevention (auto-restore <50ms).
- **Biometric Skin Chrominance Filter**: Normalized $YC_bC_r$ color space analysis ($Y \in [35, 235], C_b \in [75, 130], C_r \in [130, 175]$) to eliminate background false positives.
- **Face Presence / Absence Detection**: Auto-terminates exam after 3 seconds of continuous face absence (`CRITICAL_ABSENCE_AUTO_TERMINATION`).
- **Acoustic Speech & Noise Detection**: 512-bin Fast Fourier Transform (FFT) Web Audio analyzer detecting room chatter and speech frequencies ($100\text{Hz} - 2500\text{Hz}$, RMS $>0.035$).
- **Mobile Phone / Device Detection**: Lower-viewport Sobel edge gradient density ($|\Delta\text{Lum}| > 50$) combined with high-contrast screen/bezel clustering.
- **Multi-Person Quadrant Scan**: Peripheral quadrant pixel distribution flagging unauthorized persons entering frame.
- **System Diagnostics Suite**: Automated pre-exam check for Camera, Microphone, Screen Capture, Network Latency, and Single Display status.

### 3. Native Android Application (`@beyon/mobile`)
- **Native Android Studio Project** (`mobile/android`) targeting Android SDK 34 with Kotlin and ViewBinding.
- **Bottom Navigation**: Interactive Home, Practice MCQ Arena, 109 Skills Matrix, Job Opportunities, and Candidate Profile.
- **Direct Backend Gateway**: `BackendTunnel.kt` using OkHttp coroutines communicating directly with `http://10.0.2.2:8085/api/v1` (native Android host mapping).
- **Desktop Lockdown Integration**: In-app token generation and 1-click session token copy for the Desktop Lockdown Exam Client.

### 4. Recruiter & Company Portal (`RoleGuard['COMPANY', 'ADMIN']`)
- **Candidate Intelligence**: Multi-parameter candidate matching engine (skills, CGPA, verified test scores).
- **Assessment Builder**: Custom test creation with configurable timing, cutoffs, and proctoring strictness.
- **Recruitment Funnel**: Applications $\rightarrow$ Proctored Assessment $\rightarrow$ Shortlist $\rightarrow$ Interview Scorecards $\rightarrow$ Offer.
- **Analytics Dashboard**: Department pass rates, candidate skill distributions, and hiring velocity.

### 5. Institution Portal (`RoleGuard['INSTITUTION', 'ADMIN']`)
- **Student Cohort Management**: Academic batch performance, skill progress, and placement eligibility tracking.
- **Placement Drive Coordination**: Campus recruitment drive scheduling and company eligibility management.
- **Curriculum Alignment Analytics**: Real-time industry skill demand vs. institution curriculum coverage.

---

## Monorepo Project Structure

```
├── backend/                             # Spring Boot 3.4 API Server
│   ├── src/main/java/com/beyon/
│   │   ├── identity/                    # JWT, BCrypt, Auth filter, User models
│   │   ├── profile/                     # Student, Company, Institution profiles
│   │   ├── practice/                    # Question bank, Practice sessions, Coins, Streaks
│   │   ├── assessment/                  # Lockdown test orchestration, Timer sync
│   │   ├── intelligence/                # Matching engine, Career advisor, Skill graphs
│   │   ├── recruitment/                 # Job opportunities, Applications, Scorecards
│   │   ├── institution/                 # Batch management, Placement drives, Analytics
│   │   ├── community/                   # Feed, Discussions, Direct messages, Mentorship
│   │   ├── platform/                    # Health probes, Audit logs, Redis cache, Rate limits
│   │   └── config/                      # Spring Security, CORS, Redis, JPA configuration
│   └── src/main/resources/
│       └── db/migration/                # 27 Flyway SQL migrations (V1–V27)
├── web/                                 # React 19 SPA (Vite + TypeScript)
│   └── src/
│       ├── app/                         # App routing (50+ routes, RoleGuard)
│       ├── components/                  # UI components, Layouts, Navigation
│       ├── services/api/                # Centralized typed HTTP client (api.get/post)
│       ├── student/                     # Student ecosystem & portfolio
│       ├── company/                     # Recruiter portal & assessment builder
│       └── institution/                 # University dashboard & placement drives
├── desktop/                             # Electron 43 Desktop Lockdown App
│   └── src/
│       ├── main/                        # Kiosk lock, Anti-minimize, Media permissions
│       ├── preload/                     # Secure window.beyon IPC bridge
│       └── renderer/                    # 8-step Exam lifecycle & AI Proctoring engine
├── mobile/                              # Mobile Applications Workspace
│   ├── android/                         # Native Android Studio Gradle Project (Kotlin, SDK 34)
│   │   └── app/src/main/
│   │       ├── java/com/beyon/app/      # MainActivity, Fragments, BackendTunnel
│   │       └── res/                     # Native XML layouts, Drawables, Bottom nav
│   ├── src/                             # React Native / Expo cross-platform client
│   └── run-android.ts                   # 1-command emulator build & launcher script
├── ai-service/                          # FastAPI Python AI Microservice
│   └── app/                             # NLP, LLM adaptation, Skill embedding endpoints
├── packages/                            # Shared Monorepo Packages
│   ├── shared-types/                    # Cross-platform TypeScript contracts (ApiResponse<T>)
│   └── shared-config/                   # Shared tsconfig base
└── scripts/seed/                        # Deterministic Database Seeder (Dolt / MySQL / Postgres)
```

---

## Database Architecture (27 Flyway Migrations, 91+ Tables)

| Migration | Domain | Key Tables & Entities |
|---|---|---|
| **V1** | Identity & Auth | `users`, `email_verifications`, `password_reset_tokens`, `refresh_tokens` |
| **V2 – V4** | Profiles | `student_profiles`, `skills`, `certifications`, `projects`, `education`, `experience` |
| **V5** | Skill Taxonomy | 109 Verified skill taxonomy nodes, domains, topics, subtopics |
| **V6** | Question Bank | `questions`, `options`, `test_cases`, `code_stubs`, `attempts` |
| **V7** | Placement & Drives | `institutions`, `placement_drives`, `companies`, `college_affiliations` |
| **V8** | Assessment Engine | `assessment_sessions`, `session_questions`, `candidate_answers`, `proctoring_policies` |
| **V9, V9_1, V16** | Intelligence & Matching | `matching_scores`, `career_paths`, `skill_gaps`, `interview_rounds`, `scorecards` |
| **V10, V11, V18** | Community & Social | `posts`, `comments`, `channels`, `direct_messages`, `reputation_badges`, `teams` |
| **V12, V20** | Performance & Audit | 60+ Composite performance indexes, `audit_logs`, privacy consent records |
| **V15, V17, V21, V24** | Gamification & Growth | `coin_wallets`, `transactions`, `streaks`, `achievements`, `verifiable_credentials` |
| **V26 – V27** | Production Schemas | Consolidated MySQL / Dolt / PostgreSQL schema synchronization |

---

## Local Development & Quick Start

### Prerequisites
- **Bun** `>=1.1.0` (or Node.js `>=20`)
- **Java JDK 21** & Maven
- **Android Studio** & Android SDK 34 (for mobile)
- **Python 3.11+** (for AI microservice)
- **Docker** (optional, for local PostgreSQL / MongoDB / Redis)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/Im-gowtham-cd/Beyon.git
cd Beyon

# Install all workspace dependencies
bun install
```

### 2. Running Services

```bash
# 🌐 Start Web Portal (localhost:5173)
bun run dev:web

# ⚡ Start Spring Boot Backend API (localhost:8085)
bun run dev:backend

# 🖥️ Start Desktop Lockdown Client (Electron)
bun run dev:desktop

# 📱 Start Native Android Mobile App (Builds APK & Launches Android Studio Emulator)
bun run dev:mobile

# 🤖 Start FastAPI AI Microservice (localhost:8000)
bun run dev:ai

# 🗃️ Start Local Dolt SQL Server (localhost:3306)
bun run dev:dolt

# 🚀 Start All Services Concurrently
bun run dev:all
```

---

## 🔐 Test Accounts & Quick Login Credentials

All test accounts share the universal password: **`BeyonTest!2026#Super`**

| Portal | URL Path | Login Email | Role | Notes |
|---|---|---|:---:|---|
| **Super Admin Portal** | `http://localhost:5173/admin/home` | `superadmin@example.beyon.test` | `ADMIN` | Full root access, metrics & audit log |
| **Institution (TPO) Portal** | `http://localhost:5173/institution/home` | `institution.admin@example.beyon.test` | `INSTITUTION` | Campus drives, student batch roster |
| **Corporate Recruiter Portal** | `http://localhost:5173/company/home` | `recruiter@example.beyon.test` | `COMPANY` | Microsoft IDC recruiter, pipeline |
| **Student Workspace** | `http://localhost:5173/student/home` | `student.strong@example.beyon.test` | `STUDENT` | High performer, CGPA 9.10, verified |
| **Direct Messaging Hub** | `http://localhost:5173/institution/messages` | `institution.admin@example.beyon.test` | Cross-Role | Real-time chat across all roles |

> For the complete directory of personas, exam candidates, college admins, and recruiters, see [docs/TEST_ACCOUNTS.md](docs/TEST_ACCOUNTS.md).

---

## Database Seeding Commands

```bash
# Seed complete dataset with integrity validation
bun run seed:full

# Seed specific modules
bun run seed:base           # Fixed test accounts, institutions, companies, taxonomy
bun run seed:assessment     # Question bank (MCQ, SQL, Coding) & assessments
bun run seed:recruitment    # Jobs, internships, drives, applications
bun run seed:community      # Feed posts, discussions, notifications

# Validate referential integrity
bun run seed:validate

# Reset test seed data
bun run seed:reset
```

---

## Quality Assurance & Testing

```bash
# Run typechecking across all workspaces (web, desktop, mobile)
bun run typecheck:all

# Run frontend unit tests (Vitest)
cd web && bun run test

# Run backend unit & integration tests (JUnit 5 + Mockito)
cd backend && ./mvnw test

# Build production bundles for all platforms
bun run build:all
```

---

## Security & Privacy Compliance
- **Stateless JWT Authentication**: 15-minute access tokens with cryptographic signatures and automatic refresh token rotation.
- **Hardware Lockdown & Anti-Cheating**: Window capture isolation, devtools block, keyboard shortcut suppression, and automatic minimize recovery.
- **Privacy & GDPR Controls**: Zero webcam transmission over the wire — biometric analysis is executed 100% on-device via WebAssembly/Canvas and Web Audio FFT.

---

## License
Proprietary — **Beyon Platform 2026**. All Rights Reserved.
