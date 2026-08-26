# Beyon — Changelog

## v1.0.0-rc.1 (Release Candidate)

### Core Platform
- Authentication & authorization (JWT, email verification, password reset)
- Role-based access control (Student, Institution, Company, Admin)
- Multi-step onboarding for all roles

### Student Ecosystem
- Student profile with skills, projects, certifications, links
- Skill taxonomy explorer with topics and subtopics
- Question bank with practice mode
- Daily challenges with streaks
- Coin economy (earn, spend, leaderboard)
- Career path recommendations with readiness scores
- Student portfolio with verified achievements

### Institution Ecosystem
- Institution dashboard with placement analytics
- Student management and academic tracking
- Placement drive management
- Institution ratings and reviews
- Department performance analytics

### Company Ecosystem
- Company profile and verification
- Job opportunity publishing with eligibility rules
- Coin-based application access
- Candidate intelligence and ranking
- Assessment creation and management
- Interview round configuration and scorecards
- Recruitment analytics dashboard

### Assessment & Proctoring
- Desktop assessment app (Electron)
- Proctored exam with fullscreen, focus, camera monitoring
- System check before exam launch
- Identity verification
- Real-time proctoring event reporting
- Auto-submit on timeout
- Assessment evaluation and skill scoring

### Intelligence Engine
- Student↔Opportunity matching with weighted scoring
- Skill gap analysis with recommendations
- Career roadmap with prerequisites
- Institution placement analytics
- Company recruitment analytics

### Community & Social
- Social feed with posts, comments, likes
- Discussion forums with categories, replies, solved marking
- Follow/unfollow system
- Direct messaging
- Verified achievements and reputation system

### Notifications & Personalization
- Smart notification engine with priorities (CRITICAL/HIGH/NORMAL/LOW)
- Notification preferences per type
- Personalized dashboard combining all intelligence

### Collaboration
- Academia–Industry collaboration hub
- Workshop, mentorship, project programs
- Registration and participation tracking

### Security & Infrastructure
- Rate limiting (Redis sliding window)
- Security audit logging
- Input validation and XSS/CSRF protection
- Security headers (CSP, X-Frame-Options, etc.)
- Request correlation IDs for distributed tracing
- Structured logging with logback
- Global exception handling with consistent API responses
- Coin economy fraud protection (duplicate prevention, balance locks)

### Database
- 12 Flyway migrations (V1–V12)
- 91+ tables
- 60+ performance indexes
- Redis caching layer (Upstash)
- Background job system with retry and exponential backoff

### Testing
- 29+ frontend unit tests (Vitest + Testing Library)
- Backend unit tests (JUnit 5 + Mockito)
- Cache, rate limiter, background job, coin security tests
- API response wrapper tests

### Production Readiness
- Health check and readiness endpoints
- JVM metrics and observability
- File and document management
- Privacy and consent controls (GDPR-style)
- Data export and account deletion
- CORS hardening
