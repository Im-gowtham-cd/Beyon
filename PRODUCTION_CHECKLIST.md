# Beyon — Production Deployment Checklist

## Pre-Deployment

### Environment Variables
- [ ] `SPRING_PROFILES_ACTIVE=prod`
- [ ] `DATABASE_URL` — Supabase PostgreSQL connection string
- [ ] `REDIS_URL` — Upstash Redis connection string
- [ ] `JWT_SECRET` — Strong random secret (256+ bits)
- [ ] `CORS_ALLOWED_ORIGINS` — Production domain(s)
- [ ] `SUPABASE_URL` — For file storage
- [ ] `SUPABASE_KEY` — For file storage
- [ ] `EMAIL SMTP` credentials (if email notifications enabled)

### Database
- [ ] Run all Flyway migrations (V1–V12)
- [ ] Verify all indexes created
- [ ] Run V9_1 seed data (career paths)
- [ ] Verify database backups configured
- [ ] Set up point-in-time recovery on Supabase

### Redis
- [ ] Verify Upstash Redis connection
- [ ] Set up Redis persistence
- [ ] Configure memory limits

### Security
- [ ] Change all default passwords
- [ ] Enable HTTPS on all endpoints
- [ ] Verify CORS origins restricted to production domain
- [ ] Verify rate limiting configured
- [ ] Verify security headers present
- [ ] Run security audit (Phase 79)
- [ ] Review audit log access controls

### Monitoring
- [ ] Set up health check monitoring
- [ ] Configure error alerting
- [ ] Set up log aggregation
- [ ] Monitor Redis hit rate
- [ ] Monitor database query performance

### Testing
- [ ] All frontend tests passing (29+)
- [ ] All backend tests passing
- [ ] Performance tests completed
- [ ] Desktop app tested on Windows/Mac/Linux
- [ ] Accessibility audit completed

## Deployment

### Backend (Spring Boot)
- [ ] Build with `./mvnw clean package -DskipTests`
- [ ] Deploy JAR to server
- [ ] Verify health endpoint responds
- [ ] Verify all API endpoints accessible

### Frontend (React/Vite)
- [ ] Build with `bun run build`
- [ ] Deploy dist/ to CDN or static host
- [ ] Verify SPA routing works (fallback to index.html)
- [ ] Verify API calls reach backend

### Desktop App (Electron)
- [ ] Build with `bun run build`
- [ ] Package with electron-builder
- [ ] Test on Windows, Mac, Linux
- [ ] Verify auto-update mechanism

## Post-Deployment

### Smoke Tests
- [ ] Register new student account
- [ ] Complete onboarding
- [ ] Practice questions
- [ ] Earn coins
- [ ] Apply to opportunity
- [ ] Take assessment
- [ ] Check notifications
- [ ] Visit community feed
- [ ] Check personalized dashboard

### Monitoring
- [ ] Watch error rates for first 24 hours
- [ ] Monitor API response times
- [ ] Check database connection pool
- [ ] Verify Redis cache hit rate > 80%

### Rollback Plan
- [ ] Database migration rollback scripts ready
- [ ] Previous JAR version accessible
- [ ] CDN cache invalidation plan
- [ ] Communication plan for users

## Environment URLs
- Development: http://localhost:5173 (frontend) + http://localhost:8080 (backend)
- Staging: TBD
- Production: TBD
