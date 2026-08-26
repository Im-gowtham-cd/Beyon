# Beyon — Master Migration Report
## Supabase → Appwrite + Dolt + Upstash Redis

**Date:** August 26, 2026
**Status:** IN PROGRESS
**Scope:** Full architecture migration from Supabase/PostgreSQL to Appwrite + Dolt

---

## Executive Summary

Beyon is a 220-phase AI-powered skill development, assessment, recruitment, and placement platform. The current backend uses PostgreSQL (via Supabase) as its primary database with Spring Boot JPA. The frontend uses a custom JWT-based auth flow with no direct Supabase SDK dependency. The migration replaces PostgreSQL/Supabase with **Appwrite** (identity, profiles, storage, realtime) + **Dolt** (relational SQL data, MySQL-compatible) while retaining **Upstash Redis** for caching.

### Key Finding: Supabase Dependency Is Minimal

The codebase has **zero direct Supabase SDK imports** in the frontend. The only Supabase references are:
- `beyon.supabase.*` config properties in `application.yml` (for potential direct API calls)
- The PostgreSQL JDBC driver and Flyway PostgreSQL extension in `pom.xml`

This makes the migration significantly cleaner — we're primarily swapping the SQL database driver (PostgreSQL → MySQL/Dolt) and adding Appwrite SDK integration.

---

## 1. Repository Inventory

### Project Structure
```
beyon/
├── web/           # React + TypeScript + Vite frontend (88+ pages)
├── backend/       # Spring Boot Java 21 backend (78+ controllers)
├── desktop/       # Electron desktop assessment app
├── ai-service/    # Python FastAPI AI/ML service
├── docs/          # Documentation
├── phases/        # 220 phase specifications
└── packages/      # Shared config and types
```

### Backend Stats
- **78 controllers** across 11 packages
- **50+ services**
- **80+ repositories** (JPA)
- **25 Flyway migrations** (V1–V25)
- **212+ database tables**

### Frontend Stats
- **88+ page components**
- **80+ routes** defined in App.tsx
- **11 page modules** (auth, assessment, community, intelligence, etc.)

### Migration Files
| Migration | Purpose |
|---|---|
| V1–V4 | Identity, profile, student profile |
| V5–V6 | Skill taxonomy, question bank |
| V7–V8 | Institution, recruitment, assessment system |
| V9–V9.1 | Recruitment intelligence, career paths seed |
| V10–V13 | Social/community, reputation, DB optimization, seed data |
| V14–V15 | Feedback stabilization, product analytics |
| V16–V17 | Advanced assessment/recruitment, learning gamification |
| V18–V19 | Community mentorship, platform trust/security |
| V20–V21 | Search/performance, AI career intelligence |
| V22–V25 | Recruitment intelligence, placement, certification, community teams |

---

## 2. Current Architecture

```
React Frontend (port 5173)
    ↓ Vite proxy /api → :8080
Spring Boot Backend (port 8080)
    ├── JWT Auth (custom filter)
    ├── PostgreSQL (Supabase) ← PRIMARY DATABASE
    ├── MongoDB ← secondary (unused/light)
    ├── Redis ← caching
    └── Python AI Service (port 8000)
```

### Authentication Flow
1. Frontend sends credentials to `/api/v1/auth/login`
2. Backend validates against PostgreSQL `users` table
3. Returns JWT access token
4. Frontend stores in `localStorage` as `beyon_token`
5. Subsequent requests include `Authorization: Bearer <token>`
6. `JwtAuthFilter` validates token and sets SecurityContext

### Database Driver
- **PostgreSQL JDBC** in `pom.xml`
- **Flyway PostgreSQL** extension
- All queries use JPA/Hibernate with PostgreSQL dialect

---

## 3. Target Architecture

```
React Frontend
    ↓ API calls + Appwrite Client SDK
Spring Boot Backend
    ├── Appwrite Server SDK ← Identity, Profiles, Storage
    ├── Dolt SQL (MySQL-compatible) ← Business Data
    ├── Upstash Redis ← Cache
    └── Python AI Service

Appwrite Services:
    ├── Auth ← Registration, Login, Sessions
    ├── TablesDB ← User profiles, preferences
    ├── Storage ← Files, documents, images
    ├── Realtime ← Live updates
    └── Messaging ← Notifications

Dolt SQL Server:
    ├── All relational business data
    ├── Companies, Institutions, Skills
    ├── Assessments, Applications
    ├── Coin ledger, XP, Achievements
    ├── Recruitment, Placements
    └── Analytics-ready data
```

---

## 4. Data Ownership Model

| Data Type | Current System | Target System | Migration Action |
|---|---|---|---|
| **User Identity** | PostgreSQL `users` | Appwrite Auth | Migrate |
| **User Sessions** | JWT in PostgreSQL | Appwrite sessions | Replace |
| **User Profiles** | PostgreSQL `student_profiles` | Appwrite TablesDB | Migrate |
| **Password Hashes** | PostgreSQL `users` | Appwrite Auth | Remove (Appwrite handles) |
| **Email Verification** | PostgreSQL tokens | Appwrite Auth | Remove |
| **Password Reset** | PostgreSQL tokens | Appwrite Auth | Remove |
| **Companies** | PostgreSQL | Dolt SQL | Keep in SQL |
| **Institutions** | PostgreSQL | Dolt SQL | Keep in SQL |
| **Skills/Taxonomy** | PostgreSQL | Dolt SQL | Keep in SQL |
| **Questions** | PostgreSQL | Dolt SQL | Keep in SQL |
| **Assessments** | PostgreSQL | Dolt SQL | Keep in SQL |
| **Applications** | PostgreSQL | Dolt SQL | Keep in SQL |
| **Coin Transactions** | PostgreSQL | Dolt SQL | Keep in SQL |
| **Achievements/Badges** | PostgreSQL | Dolt SQL | Keep in SQL |
| **Notifications** | PostgreSQL | Dolt SQL + Appwrite Messaging | Hybrid |
| **Files/Uploads** | Local/Supabase Storage | Appwrite Storage | Migrate |
| **Cache** | Redis | Upstash Redis | Keep |
| **Audit Logs** | PostgreSQL | Dolt SQL | Keep in SQL |

---

## 5. Critical Files to Modify

### Backend Changes
| File | Change |
|---|---|
| `pom.xml` | Replace `postgresql` + `flyway-database-postgresql` with `mysql-connector-j` + `flyway-mysql` |
| `application.yml` | Replace Supabase config with Appwrite + Dolt config |
| `SecurityConfig.java` | Add Appwrite token validation option |
| `JwtAuthFilter.java` | Add Appwrite session validation |
| `AuthService.java` | Integrate with Appwrite Auth server SDK |
| All `*Repository.java` | No change (JPA works with MySQL-compatible Dolt) |
| All `*Service.java` | Update to use Appwrite for user data |

### Frontend Changes
| File | Change |
|---|---|
| `web/src/auth/services/authApi.ts` | Integrate Appwrite Auth SDK |
| `web/src/auth/context/AuthContext.tsx` | Use Appwrite session management |
| `web/src/lib/appwrite.ts` | Already created ✅ |
| `web/src/services/api/client.ts` | Update auth headers for Appwrite tokens |

---

## 6. Migration Steps

### Phase 1: Database Driver Swap (PostgreSQL → Dolt/MySQL)
1. Update `pom.xml`: Replace PostgreSQL driver with MySQL connector
2. Update `pom.xml`: Replace `flyway-database-postgresql` with `flyway-mysql`
3. Update `application.yml`: Change datasource URL, driver class, dialect
4. Test all migrations run on Dolt
5. Verify all JPA queries work

### Phase 2: Appwrite Auth Integration
1. Add Appwrite Java SDK to backend
2. Create `AppwriteAuthService.java`
3. Update `AuthService.java` to use Appwrite for registration/login
4. Update `JwtAuthFilter.java` to validate Appwrite sessions
5. Update frontend `AuthContext.tsx` to use Appwrite SDK

### Phase 3: Appwrite Profile Storage
1. Create Appwrite database and tables for user profiles
2. Create `AppwriteProfileService.java`
3. Migrate profile data from PostgreSQL to Appwrite
4. Update `StudentProfileService.java` to read from Appwrite
5. Update `ProfileService.java` for profile management

### Phase 4: Appwrite File Storage
1. Create Appwrite storage buckets
2. Create `AppwriteStorageService.java`
3. Migrate file references
4. Update file upload/download endpoints

### Phase 5: Data Migration
1. Export all data from PostgreSQL
2. Transform data for Dolt schema
3. Import into Dolt
4. Migrate user data to Appwrite
5. Validate data counts and integrity

### Phase 6: Cleanup
1. Remove PostgreSQL driver from `pom.xml`
2. Remove Supabase config from `application.yml`
3. Remove all Supabase references
4. Update environment variables
5. Update documentation

---

## 7. Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Dolt SQL incompatibility | HIGH | Test all migrations and queries against Dolt |
| Data loss during migration | CRITICAL | Full backup before migration, validate counts |
| Auth session disruption | HIGH | Keep JWT fallback during transition |
| File storage migration | MEDIUM | Use Appwrite batch import |
| Flyway migration history | HIGH | Dolt supports Flyway MySQL adapter |
| JPA dialect issues | MEDIUM | Use MySQL8Dialect, test all queries |

---

## 8. Current Supabase References

### In Code (0 files)
No direct `@supabase` or `supabase-js` imports found in frontend or backend code.

### In Configuration
- `application.yml`: `beyon.supabase.url`, `beyon.supabase.anon-key`, `beyon.supabase.service-key`
- `pom.xml`: `org.postgresql:postgresql`, `flyway-database-postgresql`

### Action
- Remove `beyon.supabase.*` from `application.yml`
- Replace PostgreSQL driver with MySQL connector
- Replace Flyway PostgreSQL adapter with MySQL adapter

---

## 9. Verification Checklist

- [ ] All 25 Flyway migrations run on Dolt
- [ ] All JPA queries work with MySQL dialect
- [ ] Appwrite Auth integration works for registration
- [ ] Appwrite Auth integration works for login
- [ ] Appwrite session management works
- [ ] User profiles stored in Appwrite
- [ ] File uploads work via Appwrite Storage
- [ ] All 78 API endpoints functional
- [ ] All 88+ frontend pages render correctly
- [ ] Coin transactions are atomic
- [ ] Assessment workflow works end-to-end
- [ ] Desktop app authentication works
- [ ] No Supabase dependencies remain
- [ ] Environment variables updated
- [ ] Documentation updated

---

## 10. Execution Order

1. **Database driver swap** (lowest risk, highest impact)
2. **Test all migrations on Dolt**
3. **Add Appwrite SDK to backend**
4. **Integrate Appwrite Auth**
5. **Create Appwrite profile storage**
6. **Create Appwrite file storage**
7. **Migrate data**
8. **Update frontend auth flow**
9. **Remove Supabase references**
10. **Full verification**
