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

## Environment Setup

```bash
cp .env.example .env
cp web/.env.example web/.env
cp desktop/.env.example desktop/.env
cp ai-service/.env.example ai-service/.env
# Fill in values in each .env file
```

## Development Scripts

```bash
# Start all services
bun run dev:all

# Start individual services
bun run dev:web        # Web app (port 5173)
bun run dev:desktop   # Desktop app
bun run dev:backend   # Backend API (port 8080)
bun run dev:ai        # AI service (port 8001)

# Build & type-check
bun run build:all
bun run typecheck:all
```

## Health Endpoints

| Service    | URL                        | Method |
| ---------- | -------------------------- | ------ |
| Backend    | http://localhost:8080/actuator/health | GET    |
| AI Service | http://localhost:8001/health          | GET    |

## Current Status — Phase 02

- [x] Repository structure
- [x] Web application with design system & routing
- [x] Desktop application shell
- [x] Backend with exception handling & API response standard
- [x] AI service with health endpoint
- [x] Environment configuration system
- [x] CORS & request correlation
- [x] Config validation on startup
- [x] Centralized API client (web)
- [x] Documentation
