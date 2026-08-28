# Beyon — Test Environment Setup & Seeding Guide

This guide explains how to initialize, run, validate, and reset the Beyon local and staging test environments.

---

## 1. Safety Guard & Environment Rules

The seed system enforces strict environment checks. It will **refuse to execute** if any of:
- `SPRING_PROFILES_ACTIVE=prod` or `production`
- `NODE_ENV=production`
- `APP_ENV=production`

To run in development:
```bash
bun run seed:full
```

---

## 2. Seed Modes

| Command | Action |
|---|---|
| `bun run seed:base` | Seeds 20 fixed accounts, 25 institutions, 30 companies, skills taxonomy |
| `bun run seed:assessment` | Seeds question bank (MCQ, SQL, Coding) and tests |
| `bun run seed:recruitment` | Seeds jobs, internships, placement drives, applications, coin ledger |
| `bun run seed:community` | Seeds follow relationships, in-app notifications |
| `bun run seed:full` | Runs all modules sequentially and performs integrity validation |
| `bun run seed:validate` | Runs only the validation & referential integrity checks |
| `bun run seed:reset` | Wipes seeded test data cleanly (matching `@example.beyon.test`) |

---

## 3. High Volume Overrides

You can scale seed counts on demand via CLI arguments:
```bash
cd scripts/seed
bun run seed.ts full --students=500 --questions=1000 --applications=2000
```

---

## 4. Fixed Test Accounts

Refer to [docs/TEST_ACCOUNTS.md](file:///d:/SIH/26044/docs/TEST_ACCOUNTS.md) for all login credentials.
For test scenario flows, see [docs/TEST_SCENARIOS.md](file:///d:/SIH/26044/docs/TEST_SCENARIOS.md).
