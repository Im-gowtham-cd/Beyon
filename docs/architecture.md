# Beyon Architecture

## Monorepo Structure

```
beyon/
├── web/              React + Vite + TypeScript
├── desktop/          Electron + React + TypeScript
├── backend/          Spring Boot + Maven
├── ai-service/       Python + FastAPI
├── packages/         Shared types & config
└── phases/           Implementation plans
```

## Communication Flow

```
Web (React)
  ↓
Spring Boot Backend
  ├── PostgreSQL (Supabase) — structured data
  ├── MongoDB Atlas — flexible/high-volume data
  ├── Upstash Redis — cache/temporary data
  ├── Supabase Storage — files
  └── FastAPI AI Service — ML/LLM

Desktop (Electron)
  ↓
Spring Boot Backend
```

## Data Storage

| Store | Purpose |
|---|---|
| PostgreSQL | Users, profiles, skills, recruitment, assessments |
| MongoDB | Questions, challenges, logs, proctoring events |
| Redis | Cache, leaderboards, rate limiting |
| Supabase Storage | Resumes, certificates, documents |

## Backend Module Structure

```
com.beyon
├── config/           CORS, properties, correlation
├── common/
│   ├── exception/    Global error handling
│   └── response/     API response format
└── modules/
    ├── identity/
    ├── student/
    ├── company/
    ├── institution/
    ├── skills/
    ├── learning/
    ├── gamification/
    ├── recruitment/
    ├── assessment/
    ├── notification/
    └── analytics/
```

## API Convention

Base path: `/api/v1`

Response: `{ "success": true, "data": {...}, "timestamp": "..." }`
Error: `{ "success": false, "error": { "code": "...", "message": "..." }, "timestamp": "..." }`
