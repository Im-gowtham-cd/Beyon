# Beyon — Production Deployment Checklist

## 1. Pre-Deployment Configuration

### Environment Variables
- [ ] `SPRING_PROFILES_ACTIVE=prod`
- [ ] `SERVER_PORT=8085`
- [ ] `DATABASE_URL` — Supabase PostgreSQL 17 connection string with connection pooler
- [ ] `MONGODB_URI` — MongoDB Atlas connection string for telemetry and event logs
- [ ] `REDIS_URL` — Upstash Redis URL with password authentication
- [ ] `JWT_SECRET` — Minimum 256-bit cryptographically secure HMAC secret
- [ ] `CORS_ALLOWED_ORIGINS` — Production frontend domain(s)
- [ ] `AI_SERVICE_URL` — Production URL of the FastAPI AI microservice
- [ ] `SUPABASE_URL` & `SUPABASE_KEY` — Production object storage credentials

### Database Readiness
- [ ] Run all Flyway migrations (V1–V27)
- [ ] Verify 91+ tables and 60+ composite indexes exist
- [ ] Ensure point-in-time recovery (PITR) is active on Supabase PostgreSQL
- [ ] Verify MongoDB Atlas collection indexes for proctoring telemetry

### Cache & Session Layer
- [ ] Verify Upstash Redis connectivity with Lettuce connection pooling
- [ ] Test rate limiting sliding window under load (100 req/min)
- [ ] Confirm active leaderboard keys and TTL policies

---

## 2. Platform Build & Packaging

### Backend (Spring Boot 3.4.1 / Java 21)
- [ ] Compile production JAR: `./mvnw clean package -DskipTests`
- [ ] Verify JAR execution with production profile
- [ ] Confirm `/health`, `/ready`, and `/metrics` probe responses

### Web Frontend (React 19 / Vite 8)
- [ ] Build production assets: `bun run build:web`
- [ ] Deploy `web/dist/` to CDN / edge static host
- [ ] Verify SPA routing fallback (`index.html`)

### Desktop Lockdown Client (Electron 43)
- [ ] Build renderer bundle: `bun run build:desktop`
- [ ] Package native installer with `electron-builder` (Windows NSIS / macOS DMG / Linux AppImage)
- [ ] Test kiosk mode, anti-minimize hook, and media device permissions on target hardware

### Native Android Mobile App (Kotlin / Android SDK 34)
- [ ] Build release APK / App Bundle: `cd mobile/android && ./gradlew.bat assembleRelease`
- [ ] Sign APK with production release keystore
- [ ] Verify direct API connectivity against production gateway

### AI Microservice (FastAPI / Python 3.11)
- [ ] Install dependencies with `pip install -r ai-service/requirements.txt`
- [ ] Launch Uvicorn workers: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4`
- [ ] Verify `/health` endpoint response

---

## 3. Post-Deployment Smoke Tests

- [ ] Register new Student, Company, and Institution test accounts
- [ ] Complete multi-step role onboarding
- [ ] Solve practice question in Practice Arena and verify Coin/XP ledger update
- [ ] Launch Desktop Lockdown client with session token and verify AI proctoring initialization
- [ ] Submit assessment and verify instant automated scoring in PostgreSQL
- [ ] Check MongoDB Atlas telemetry records for proctoring event logs
- [ ] Open Native Android app and verify live API connectivity and profile sync
- [ ] Test public certificate verification endpoint (`/verify/:certificateNumber`)

---

## 4. Production Service Ports & URLs

| Component | Target URL / Port | Protocol |
|---|---|---|
| **Web Portal** | `https://app.beyon.in` | HTTPS |
| **Backend API** | `https://api.beyon.in` (:8085) | HTTPS / REST |
| **AI Microservice** | `https://ai.beyon.in` (:8000) | HTTPS / gRPC |
| **PostgreSQL** | Supabase Managed Cloud (:5432) | PostgreSQL Wire |
| **MongoDB Atlas** | Atlas Managed Cluster (:27017) | MongoDB Wire |
| **Upstash Redis** | Upstash Serverless (:6379) | RESP / TLS |
