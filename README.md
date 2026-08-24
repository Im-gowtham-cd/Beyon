# Beyon

**Learn → Practice → Prove → Earn → Qualify → Apply → Assess → Get Hired**

AI-powered skill development and recruitment ecosystem.

## Stack

| Component          | Technology                       |
| ------------------ | -------------------------------- |
| Web                | React, Vite, TypeScript, CSS     |
| Desktop Assessment | Electron, React, TypeScript      |
| Backend            | Java, Spring Boot, Maven        |
| AI Service         | Python, FastAPI                  |
| PostgreSQL         | Supabase                         |
| MongoDB            | MongoDB Atlas                    |
| Cache              | Upstash Redis                    |
| Runtime            | Bun                              |

## Structure

```
beyon/
├── web/              # React + Vite web app
├── desktop/          # Electron assessment app
├── backend/          # Spring Boot API
├── ai-service/       # Python FastAPI service
├── packages/         # Shared types & config
├── docs/
├── scripts/
└── phases/           # Phase implementation plans
```

## Quick Start

```bash
# Install dependencies
bun install

# Web
cd web && bun run dev

# Backend
cd backend && ./mvnw spring-boot:run

# AI Service
cd ai-service && pip install -r requirements.txt && uvicorn app.main:app --reload

# Desktop
cd desktop && bun run dev
```

## Environment

```bash
cp .env.example .env
# Fill in values
```

## Current Status — Phase 01

- [x] Repository structure
- [x] Web application scaffolded
- [x] Desktop application scaffolded
- [x] Backend scaffolded
- [x] AI service scaffolded
- [x] Shared packages
- [x] Design system foundation
