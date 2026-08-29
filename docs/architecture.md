# Beyon — System Architecture & Design Specification

## 1. Multi-Platform Monorepo Architecture

Beyon is engineered as a unified **Bun multi-package monorepo** comprising four client presentation platforms, an enterprise API gateway, an AI microservice, and a hybrid multi-database persistence tier:

```
beyon/
├── web/                   React 19 + TypeScript 6 + Vite 8 + React Router DOM v7
├── desktop/               Electron 43 + React 19 + AI Proctoring Engine
├── mobile/                Native Android (Kotlin, SDK 34) + React Native client
├── backend/               Spring Boot 3.4.1 + Java 21 + Spring Security 6 + JPA
├── ai-service/            Python 3.11 + FastAPI 0.115 + Uvicorn + Pydantic v2
├── packages/
│   ├── shared-types/      Cross-platform TypeScript contracts (ApiResponse<T>, UserRole, etc.)
│   └── shared-config/     Shared base TypeScript configurations
└── scripts/seed/          Deterministic Database Seeder (Dolt / MySQL / Postgres)
```

---

## 2. End-to-End Communication Flow

```
[Web Application] (Port 5173)         [Desktop Lockdown] (Electron)      [Native Android] (Emulator / Device)
       │                                     │                                     │
       │ (REST / HTTPS)                      │ (REST / HTTPS)                      │ (OkHttp Direct Gateway: 10.0.2.2)
       └─────────────────────────────┬───────┴─────────────────────────────────────┘
                                     ▼
                      Spring Boot API Gateway (Port 8085)
                                     │
              ┌──────────────────────┼──────────────────────┐
              ▼                      ▼                      ▼
    PostgreSQL 17 / Dolt       MongoDB Atlas          Upstash Redis
    (Relational Core :3306)    (Telemetry :27017)     (Cache & Sessions :6379)
              │                      │                      │
              └──────────────────────┼──────────────────────┘
                                     ▼
                       FastAPI AI Microservice (Port 8000)
                          (NLP, Skill Graph, Embeddings)
```

---

## 3. Data Tier Strategy

| Store | Engine | Port | Purpose & Data Domain |
|---|---|---|---|
| **Primary Relational DB** | PostgreSQL 17 (Prod) / Dolt MySQL (Dev) | `5432` / `3306` | Identity, Users, 109-node Skills taxonomy, Profiles, Opportunities, Assessment sessions, Applications, Interviews (91+ tables, 27 Flyway migrations, 60+ composite indexes) |
| **Document Store** | MongoDB Atlas | `27017` | High-volume proctoring telemetry streams, test question submission payloads, LLM chat conversation logs |
| **In-Memory Cache** | Upstash Redis | `6379` | Active session tokens, gamification leaderboards, sliding window rate-limiting buckets |
| **Object Storage** | Supabase Storage / Appwrite | `443` | Resume PDFs, verified certification credentials, student project verification media |

---

## 4. Real-Time AI Proctoring Architecture (`desktop/`)

The proctoring subsystem runs client-side in the Electron renderer at **600ms intervals** without transmitting raw video feeds over the network:

1. **Normalized $YC_bC_r$ Biometric Skin Filter**:
   $$\text{Valid Skin Pixel}: \quad Y \in [35, 235], \quad C_b \in [75, 130], \quad C_r \in [130, 175], \quad R > G, \quad R > B$$
   Rejects ambient lighting, doors, and wooden background surfaces.
2. **Persistent Absence Auto-Termination**: Continuous face absence exceeding **3.0 seconds** immediately triggers auto-submission (`CRITICAL_ABSENCE_AUTO_TERMINATION`).
3. **Web Audio FFT Acoustic Analyzer**: 512-bin Fast Fourier Transform measuring room noise (RMS $>0.035$) and vocal frequency spectrum ($100\text{Hz} - 2500\text{Hz}$).
4. **Sobel Edge Handheld Device Detector**: High-contrast lower-viewport edge gradient ($|\Delta\text{Lum}| > 50$) flagging smartphone screens and chassis in hand.
5. **Kiosk Security Hook**: Hardware fullscreen lock, automatic window restore on minimize (<50ms), and system shortcut suppression.

---

## 5. Mobile Direct Gateway Tunneling (`mobile/`)

- **Host Alias Mapping**: Android Studio emulator routes `http://10.0.2.2:8085/api/v1` directly to host machine's `127.0.0.1:8085`.
- **`BackendTunnel.kt`**: High-performance OkHttp coroutine client with live latency pinging (`/health`) and token management.
- **Desktop Lockdown Handshake**: In-app session token copying allowing students to transition seamlessly to the Desktop Client for proctored examinations.

---

## 6. Standardized API Response Protocol

Every backend endpoint strictly adheres to the unified response contract:

### Success Response (`HttpStatus.OK` / `HttpStatus.CREATED`):
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-08-28T15:30:00.000Z",
  "traceId": "req-98f21a4e"
}
```

### Error Response (`HttpStatus.BAD_REQUEST` / `HttpStatus.UNAUTHORIZED` / `HttpStatus.INTERNAL_SERVER_ERROR`):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "The provided username or password is incorrect."
  },
  "timestamp": "2026-08-28T15:30:00.000Z",
  "traceId": "req-98f21a4e"
}
```
