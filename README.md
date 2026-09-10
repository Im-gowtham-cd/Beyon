# Beyon

**Enterprise-Grade AI-Powered Campus-to-Career Ecosystem & DualView Proctoring Platform**

Beyon is a comprehensive, multi-tenant recruitment and assessment infrastructure connecting students, higher-education institutions, and enterprise recruiters. It unifies verified competency engineering (109-node skill graph), real-time multi-angle computer vision proctoring, hardware-enforced desktop lockdown, and automated candidate shortlisting pipelines.

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Why This Tech Stack? (Technical Trade-off Analysis)](#why-this-tech-stack-technical-trade-off-analysis)
3. [Core Technical Innovations & Approaches](#core-technical-innovations--approaches)
   - [DualView 360° Proctoring & Rule Engine](#1-dualview-360-proctoring--rule-engine)
   - [Structured Evidence Storage Hierarchy](#2-structured-evidence-storage-hierarchy)
   - [Competency Graph & 109-Node Taxonomy](#3-competency-graph--109-node-taxonomy)
   - [Hardware Lockdown Assessment Client](#4-hardware-lockdown-assessment-client)
4. [Monorepo Workspace Layout](#monorepo-workspace-layout)
5. [Database Architecture & Flyway Migrations](#database-architecture--flyway-migrations)
6. [Installation & Developer Setup](#installation--developer-setup)
7. [Default Test Accounts & Credentials](#default-test-accounts--credentials)
8. [Quality Assurance & Build Scripts](#quality-assurance--build-scripts)
9. [Future Roadmap & Upcoming Technologies](#future-roadmap--upcoming-technologies)
10. [License](#license)

---

## High-Level Architecture

```
                                      BEYON ECOSYSTEM
                                             │
    ┌───────────────────────────┬────────────┴───────────┬───────────────────────────┐
    ▼                           ▼                        ▼                           ▼
WEB APPLICATION        DESKTOP LOCKDOWN APP      NATIVE ANDROID APP         MOBILE STREAMER
(React 19, TS 6, Vite) (Electron 43, React 19)   (Kotlin, Android 34)       (Camera QR Pair)
4 Role Portals         Hardware Kiosk Lock       Material 3, OkHttp         WebRTC / Frame Stream
50+ Dynamic Routes     250ms Client CV Loop      10.0.2.2 Gateway           Side-angle AI Feed
    │                           │                        │                           │
    └───────────────────────────┼────────────────────────┴───────────────────────────┘
                                ▼
                   HTTPS / REST API / JWT BEARER / SSE
                                │
    ┌───────────────────────────┴───────────────────────────────────────────────┐
    ▼                                                                           ▼
SPRING BOOT CORE GATEWAY (:8085)                                    FASTAPI AI SERVICE (:8000)
Java 21, Spring Security 6, Hibernate 6, JJWT                       Python 3.11, PyTorch, YOLO11, OpenCV
├── Identity & RBAC (STUDENT, COMPANY, INSTITUTION, ADMIN)          ├── YOLO11 Nano Object & Device Detector
├── DualView Session Orchestration & SSE Incident Push              ├── Geometric Screen & Bezel Classifier
├── Structured Evidence Storage Engine                              ├── CNN Behavioral Cheat Detector
├── 109-Node Skill Graph & Competency Matrix                        ├── Skin Blob Presence Fallback
├── Assessment Question Bank & Timer Synchronizer                   └── Candidate-Opportunity Matching Vectors
└── Recruitment Pipeline & Cohort Analytics
                                │
    ┌───────────────────────────┼───────────────────────────┬───────────────────┐
    ▼                           ▼                           ▼                   ▼
RELATIONAL DB (PORT 3306)   DOCUMENT STORE             UPSTASH REDIS       STRUCTURED STORAGE
PostgreSQL 17 / Dolt SQL    MongoDB Atlas (:27017)     (:6379)             uploads/evidence/
91+ Tables, 27 Flyway Migr  Telemetry Log Streams      Rate Limiting       {test}/{student}/
Composite B-Tree Indexes    Audit Trails               Leaderboard Cache   {warning}_{time}.jpg
```

---

## Why This Tech Stack? (Technical Trade-off Analysis)

Every framework and tool in Beyon was selected after rigorous benchmarking against common industry alternatives:

| Architectural Component | Chosen Technology | Alternative Considered | Why Chosen Over Alternative? |
|---|---|---|---|
| **Core Backend Gateway** | **Java 21 + Spring Boot 3.4** | Node.js / Express or Django | • **Virtual Threads (Project Loom)** handle high-concurrency exam telemetry without blocking event loops.<br>• Strict compile-time typing, declarative transactions (`@Transactional`), and enterprise JPA auditing ensure zero database state corruption during high-stakes assessments.<br>• Production-grade security through Spring Security 6 filter chains. |
| **AI Computer Vision Service** | **Python 3.11 + FastAPI + YOLO11** | TensorFlow.js in Node or Flask | • Native C++ PyTorch bindings and CUDA/DirectML GPU acceleration provide sub-50ms inference per frame.<br>• FastAPI leverages Python `asyncio` and `uvicorn` with Pydantic v2 validation, outperforming Flask and standard WSGI servers by 300%.<br>• YOLO11 Nano offers state-of-the-art multi-person and cell phone detection accuracy at minimal footprint. |
| **Desktop Lockdown Client** | **Electron 43 + React 19 + TypeScript** | Pure Browser Fullscreen API or Tauri | • Browser Fullscreen API can be bypassed easily with OS shortcuts (Alt+Tab, Windows Key, task manager, multi-monitor dragging).<br>• Electron provides native OS hooks (`user32.dll` / native APIs) to prevent minimization, intercept keyboard chords, block screen recording software, and query connected display topologies.<br>• Tauri has smaller binary sizes, but Electron provides mature WebRTC media pipeline control and universal camera/mic device stability. |
| **Web Frontend** | **React 19 + TypeScript 6 + Vite 8** | Next.js SSR or Angular | • Single Page Application (SPA) architecture delivers instant client-side transitions across 50+ role-guarded routes without server round-trip latency.<br>• Vite 8 delivers lightning-fast HMR and optimized Rolldown/ESBuild bundling.<br>• Pure CSS Modules eliminate CSS-in-JS runtime style re-computation overhead. |
| **Primary Database** | **PostgreSQL 17 / Dolt SQL (Dev)** | Pure MongoDB or Firebase | • High-stakes recruitment requires strict ACID guarantees, foreign key integrity, and relational joins across 91+ tables.<br>• **Dolt SQL** enables Git-like branching, versioning, and cell-level rollback for schema evolution and deterministic test fixtures.<br>• 27 Flyway migrations guarantee repeatable production schema deployments. |
| **Telemetry & Incident Stream** | **Server-Sent Events (SSE)** | WebSockets or Long Polling | • SSE is unidirectional and HTTP/2-multiplexed, drastically reducing connection overhead for recruiter real-time dashboards.<br>• Reconnects automatically with built-in `Last-Event-ID` tracking, unlike fragile raw WebSocket reconnect loops. |
| **Proctoring Telemetry Architecture** | **Hybrid Edge-CV + Server Snapshot** | Full Continuous Video Streaming | • Streaming 10,000 concurrent 1080p video feeds consumes ~30 Gbps of bandwidth, crashing institution networks.<br>• Beyon's hybrid model runs 250ms lightweight computer vision analysis on-device, only transmitting lightweight telemetry signals and targeted evidence snapshots when an anomaly occurs. |

---

## Core Technical Innovations & Approaches

### 1. DualView 360° Proctoring & Rule Engine

Single-camera proctoring systems have fatal blind spots: candidates can place phones, secondary monitors, or notes directly behind or beneath the laptop screen. Beyon solves this with **DualView**:

1. **Frontal Laptop Camera**:
   - **Sampling Rate**: High-speed 250ms evaluation loop (4 frames per second).
   - **Skin Chrominance Filter**: Normalized $YC_bC_r$ color space segmentation ($Y \in [35, 235], C_b \in [75, 130], C_r \in [130, 175]$) with $r > g > b$ delta gates to eliminate background room interference.
   - **Gaze Deviation**: Continuous centroid vector tracking calculating horizontal ($x_{\text{offset}} > 0.38$) and vertical ($y_{\text{offset}} > 0.45$) off-screen gaze sustained over 2 seconds.
   - **Acoustic Speech Analyzer**: 512-bin Fast Fourier Transform (FFT) Web Audio context measuring root-mean-square energy ($\text{RMS} > 0.07$) and voice-band frequency concentration ($\text{VoiceAvg} > 35$) sustained over 1.25s.
2. **Mobile Side Camera**:
   - The candidate scans an ephemeral QR code on mobile (`http://<ip>:5173/proctoring/mobile-stream?token=...`).
   - The mobile device streams camera frames at 45° to 90° angle, capturing the candidate, laptop screen, desk surface, and hands.
   - AI service analyzes frames with YOLO11 for cell phone presence, unauthorized second persons, and camera obstruction.
3. **Strict Policy Rule Engine**:
   - **Termination Policy**: Only a **confirmed second person** entering the room triggers test termination (1 warning grace period $\rightarrow$ 2nd occurrence auto-submits exam).
   - **Warning-Only Policy**: Looking away, noise/speech, temporary absence, and phone detections display instant, dismissible candidate warning modals and log audit evidence without terminating the assessment.
   - **Independent Per-Category Cooldown**: Each violation category maintains an isolated 12-second debounce timer, preventing sound notices from blocking absence or device alerts.

```
+-----------------------------------------------------------------------------------+
|                            BEYON PROCTORING ENGINE                                |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [Laptop Camera]  ──(250ms)─► Skin Segmentation ─► Gaze/Absence Streak (2s)       |
|  [Microphone]     ──(250ms)─► 512-bin FFT Audio ─► RMS > 0.07 / Voice > 35        |
|  [Mobile QR Cam]  ──(1.5s)──► YOLO11 Detector   ─► Phone / Second Person          |
|                                                                                   |
|                                      │                                            |
|                                      ▼                                            |
|                         [RULE ENGINE EVALUATOR]                                   |
|                                      │                                            |
|          ┌───────────────────────────┴───────────────────────────┐                |
|          ▼                                                       ▼                |
|  Category == PERSON ?                                   Category != PERSON ?      |
|  ├─ Strike 1: Final Warning Notice                      └─ Warning Notice Modal   |
|  └─ Strike 2: IMMEDIATE AUTO-TERMINATION                   (Sound, Gaze, Absence) |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

### 2. Structured Evidence Storage Hierarchy

When an incident or warning is triggered, a cryptographic evidence snapshot is captured and stored in a transparent, human-auditable directory structure:

```
backend/uploads/evidence/
└── <Test_Name>/
    └── <Student_Name>/
        ├── CANDIDATE_ABSENT_1741249823123.jpg
        ├── SUSPICIOUS_SPEECH_1741249835412.jpg
        ├── LOOKING_AWAY_1741249842890.jpg
        ├── SECOND_PERSON_1741249855102.jpg
        └── PHONE_DETECTED_1741249868774.jpg
```

- **Path Sanitization**: Names are dynamically cleaned (`[^\w\.\-]` replaced with underscores) to prevent path traversal attacks and ensure cross-platform Windows/Linux compatibility.
- **Auto-Resolution**: If test name or student name is omitted in the payload, the backend resolves them via relational foreign keys (`proctoring_sessions` $\rightarrow$ `users` & `company_opportunities`).
- **Audit-Ready Evidence Controller**: Served securely via wildcard endpoint `GET /api/v1/evidence/**` with role-based JWT access controls for recruiters and institution auditors.

---

### 3. Competency Graph & 109-Node Taxonomy

Beyon moves beyond binary "pass/fail" testing to continuous multidimensional skill modeling:

- **109 Standardized Skill Nodes**: Covering High-Performance Computing (CUDA, Triton, OpenMP), Distributed Systems (Raft, Paxos, Kafka, gRPC), Cloud & DevOps (Kubernetes, Terraform), ML/AI (PyTorch, vLLM, TensorRT-LLM, LoRA), and Core Engineering (Data Structures, Algorithms, System Design, SQL).
- **Competency Graph Matrix**: Calculates prerequisite dependencies, knowledge gaps, and recommendation vectors based on candidate assessment performance.
- **XP & Coin Economy**: Practice challenge completions award XP and Beyon Coins (⚡) with daily streak multipliers, incentivizing continuous student practice.

---

### 4. Hardware Lockdown Assessment Client

The desktop assessment application (`desktop/`) provides full isolation:

- **Kiosk Mode Lock**: Intercepts Windows task switcher (`Alt+Tab`, `Win+Tab`), disables system key combinations (`Ctrl+Alt+Del` detection, `Alt+F4`, `Ctrl+W`).
- **Anti-Minimize Guardian**: Detects blur or minimize events and immediately forces the window back into fullscreen focus in under 50ms.
- **Multi-Monitor Guard**: Detects secondary external monitors and blocks test entry until extra displays are disconnected.
- **Isolated IPC Preload Bridge**: Context isolation and node integration disabled; renderer accesses system APIs exclusively via strongly typed `window.beyon` channels.

---

## Monorepo Workspace Layout

```
d:/SIH/26044/
├── backend/                             # Spring Boot 3.4 API Server
│   ├── src/main/java/com/beyon/
│   │   ├── identity/                    # User authentication, JWT filter, RBAC
│   │   ├── profile/                     # Student, Company, Institution profiles
│   │   ├── practice/                    # Question bank, Challenges, Coins, Streaks
│   │   ├── assessment/                  # DualView proctoring, Evidence storage, Timer
│   │   ├── intelligence/                # Matching engine, Career roadmap, Taxonomy
│   │   ├── recruitment/                 # Job opportunities, Applications, Funnels
│   │   ├── institution/                 # Cohort analytics, Placement drives
│   │   ├── community/                   # Posts, Comments, Discussions, Mentorship
│   │   └── config/                      # Security, CORS, Redis, JPA configuration
│   └── src/main/resources/
│       └── db/migration/                # 27 Flyway SQL migrations (V1–V27)
├── web/                                 # React 19 SPA (Vite + TypeScript)
│   └── src/
│       ├── app/                         # App routes (50+ pages, RoleGuard)
│       ├── components/                  # Design tokens, Navbar, Modals
│       ├── student/                     # Practice arena, Roadmap, Portfolio
│       ├── company/                     # Candidate pipeline, Proctoring reports
│       └── institution/                 # Placement drives, Batch analytics
├── desktop/                             # Electron 43 Desktop Lockdown App
│   └── src/
│       ├── main/                        # Kiosk lock, Display queries, Window guard
│       ├── preload/                     # window.beyon IPC bridge
│       └── renderer/                    # Exam client & 250ms CV proctoring engine
├── mobile/                              # Mobile Applications Workspace
│   ├── android/                         # Native Android Studio project (Kotlin, SDK 34)
│   └── src/                             # React Native / Expo cross-platform client
├── ai-service/                          # FastAPI Python AI Microservice
│   ├── app/routers/                     # Mobile & laptop frame analysis endpoints
│   ├── app/services/                    # YOLO11 detector, CNN cheat classifier
│   └── yolo11n.pt                       # Ultralytics neural network model weights
└── scripts/seed/                        # Deterministic Database Seeder
```

---

## Database Architecture & Flyway Migrations

The relational schema spans **91+ tables** managed via **27 Flyway Migrations**:

| Migration | Domain | Description & Key Entities |
|---|---|---|
| **V1** | Identity & Auth | `users`, `email_verifications`, `password_reset_tokens`, `refresh_tokens` |
| **V2 – V4** | Profiles | `student_profiles`, `skills`, `certifications`, `projects`, `education` |
| **V5** | Skill Taxonomy | 109 Verified skill taxonomy nodes, domain relations, topics |
| **V6** | Question Bank | `questions`, `options`, `test_cases`, `code_stubs`, `attempts` |
| **V7** | Placement Drives | `institutions`, `placement_drives`, `companies`, `college_affiliations` |
| **V8** | Assessment Engine | `assessment_sessions`, `session_questions`, `candidate_answers`, `proctoring_policies` |
| **V9, V16** | Matching & Intelligence | `matching_scores`, `career_paths`, `skill_gaps`, `interview_scorecards` |
| **V10, V18** | Social & Community | `posts`, `comments`, `channels`, `direct_messages`, `reputation_badges` |
| **V12, V20** | Performance & Audit | 60+ Composite B-Tree indexes, `audit_logs`, privacy consent records |
| **V15, V21, V24**| Gamification | `coin_wallets`, `transactions`, `streaks`, `verifiable_credentials` |
| **V26 – V27** | Production Sync | Final schema parity across Dolt, MySQL, and PostgreSQL |

---

## Installation & Developer Setup

### Prerequisites
- **Bun** `>= 1.1.0` (or Node.js `>= 20`)
- **Java JDK 21** & Maven 3.9+
- **Python 3.11+** with PyTorch & OpenCV
- **Android Studio** & Android SDK 34 (for mobile)
- **Dolt** (for local SQL server) or **PostgreSQL 17**

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/Im-gowtham-cd/Beyon.git
cd Beyon

# Install all monorepo dependencies
bun install
```

### 2. Environment Configuration
Create `.env` in the root directory (or use default development fallbacks):
```env
DATABASE_URL=jdbc:mysql://127.0.0.1:3306/beyon
DATABASE_USERNAME=root
DATABASE_PASSWORD=
JWT_SECRET=beyon-dev-secret-key-change-in-production-minimum-32-chars
AI_SERVICE_URL=http://localhost:8000
SERVER_PORT=8085
```

### 3. Launching Services

```bash
# 1. Start Local Dolt SQL Server (Port 3306)
dolt sql-server --host=127.0.0.1 --port=3306

# 2. Start FastAPI AI Service (Port 8000)
cd ai-service && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# 3. Start Spring Boot Backend API (Port 8085)
cd backend && ./mvnw spring-boot:run

# 4. Start React Web Portal (Port 5173)
cd web && bun run dev

# 5. Start Electron Lockdown Desktop App
cd desktop && bun run dev
```

---

## Default Test Accounts & Credentials

All development test accounts share the universal password: **`BeyonTest!2026#Super`**

| Portal | URL Path | Login Email | Role |
|---|---|---|:---:|
| **Super Admin Portal** | `http://localhost:5173/admin/home` | `superadmin@example.beyon.test` | `ADMIN` |
| **Institution (TPO) Portal** | `http://localhost:5173/institution/home` | `institution.admin@example.beyon.test` | `INSTITUTION` |
| **Corporate Recruiter Portal** | `http://localhost:5173/company/home` | `recruiter@example.beyon.test` | `COMPANY` |
| **Student Workspace** | `http://localhost:5173/student/home` | `student.strong@example.beyon.test` | `STUDENT` |

---

## Quality Assurance & Build Scripts

```bash
# Typecheck all packages
bun run typecheck:all

# Run Frontend Unit Tests (Vitest)
cd web && bun run test

# Run Backend Tests (JUnit 5 + Mockito)
cd backend && ./mvnw test

# Compile Production Desktop App
cd desktop && bun run build
```

---

## Future Roadmap & Upcoming Technologies

As Beyon evolves toward international campus-to-career scale, the following technical architectural milestones are planned:

```
                                  FUTURE ARCHITECTURE ROADMAP
                                               │
    ┌───────────────────────────┬──────────────┴────────────┬───────────────────────────┐
    ▼                           ▼                           ▼                           ▼
WEBRTC SFU LIVE CLUSTERS  ON-DEVICE WEBGPU AI        W3C VERIFIABLE CREDENTIALS   MICROVM CODE SANDBOXES
(LiveKit / Mediasoup)     (ONNX Runtime Web)         (Polygon / Hedera DID)       (Firecracker / WASM)
Low-latency audio/video   Zero server GPU inference  Tamper-proof certificates    Instant secure polyglot
human proctor takeover    100% on-device YOLO        Decentralized transcript     live code execution
```

### 1. WebRTC SFU Live Proctoring Grid (LiveKit / Mediasoup)
- **What**: Integrate a dedicated Selective Forwarding Unit (SFU) cluster using **LiveKit** or **Mediasoup**.
- **Why**: Allows human proctors to observe up to 50 active assessment sessions simultaneously on a live video wall with sub-200ms latency, enabling live voice intervention or proctor take-overs for suspicious sessions.

### 2. On-Device WebGPU & ONNX Runtime Edge Inference
- **What**: Port YOLO object detection and gaze tracking directly to the Electron client using **ONNX Runtime Web** and **WebGPU**.
- **Why**: Eliminates server-side frame transmission entirely. Assessment clients will run hardware-accelerated deep neural network models locally on the candidate's GPU/NPU, reducing backend AI server compute costs to zero while preserving total privacy.

### 3. Decentralized Identifiers (DID) & W3C Verifiable Credentials
- **What**: Anchor verified skill badges, assessment percentile scores, and degree certifications onto a public L2 ledger (e.g., **Polygon** or **Hedera**).
- **Why**: Enables cryptographically verifiable, non-forgeable resumes. Candidates can share portable digital diplomas with global recruiters without requiring manual university registrar validation.

### 4. MicroVM Code Execution Sandbox (Firecracker & WebAssembly)
- **What**: Deploy an isolated ephemeral execution sandbox for coding assessments using **AWS Firecracker MicroVMs** or **WebAssembly (Wasmtime)**.
- **Why**: Provides sub-10ms container cold starts with kernel-level isolation, allowing candidates to run multi-language code (C++, Rust, Python, Java, Go) safely with strict memory and CPU quotas.

### 5. Multilingual Whisper Acoustic Diarization
- **What**: Embed lightweight **OpenAI Whisper** or **Moonshine ASR** models to perform real-time speech transcription and speaker diarization.
- **Why**: Detects subtle whisper-based cheating and cross-references spoken text against exam questions in multiple regional languages.

---

## License

Proprietary — **Beyon Platform 2026**. All Rights Reserved.
