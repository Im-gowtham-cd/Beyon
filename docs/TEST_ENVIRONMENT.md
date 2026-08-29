# Beyon — Test Environment Setup & Seeding Guide

This guide explains how to initialize, run, validate, and reset the Beyon local and staging test environments across all client platforms and services.

---

## 1. Local Development Orchestration

### Multi-Service Concurrency
You can run all core services concurrently with a single command:
```bash
bun run dev:all
```
This launches:
- **Web Frontend** on `http://localhost:5173`
- **Spring Boot API** on `http://localhost:8085`
- **FastAPI AI Microservice** on `http://localhost:8000`

### Individual Component Launchers
```bash
# 🌐 Web React SPA
bun run dev:web

# ⚡ Spring Boot Backend
bun run dev:backend

# 🖥️ Electron Desktop Lockdown Client
bun run dev:desktop

# 📱 Native Android Studio Emulator (Auto-boots emulator & deploys APK)
bun run dev:mobile

# 🗃️ Git-versioned Dolt SQL Server
bun run dev:dolt

# 🤖 FastAPI Python AI Service
bun run dev:ai
```

---

## 2. Seed System & Database Initialization

The seed system enforces strict safety checks. It will **refuse to execute** in production environments.

### Seed Commands
| Command | Description |
|---|---|
| `bun run seed:full` | Runs all seed modules sequentially with full referential integrity validation |
| `bun run seed:base` | Seeds 20 fixed test accounts, 25 institutions, 30 companies, and 109 skills taxonomy |
| `bun run seed:assessment` | Seeds question bank (MCQ, SQL, Coding) and proctored test sessions |
| `bun run seed:recruitment` | Seeds job opportunities, internships, placement drives, applications, coin ledger |
| `bun run seed:community` | Seeds social feed, discussion topics, direct messages, and reputation badges |
| `bun run seed:validate` | Performs foreign key and referential integrity audit without writing data |
| `bun run seed:reset` | Wipes seeded test accounts and entities matching `@example.beyon.test` |

### High-Volume Parameterized Seeding
```bash
cd scripts/seed
bun run seed.ts full --students=500 --questions=1000 --applications=2000
```

---

## 3. Test Accounts & Scenario Guides

- For complete login credentials for all 4 roles, see [docs/TEST_ACCOUNTS.md](file:///d:/SIH/26044/docs/TEST_ACCOUNTS.md).
- For step-by-step end-to-end user workflows, see [docs/TEST_SCENARIOS.md](file:///d:/SIH/26044/docs/TEST_SCENARIOS.md).
