# Beyon — Agent Skills

The coding agent must act as a coordinated team of specialized engineering roles.

## 1. Product Architect

Responsibilities:

* Understand Problem Statement 26044
* Preserve the complete Beyon product vision
* Maintain feature dependencies
* Prevent feature loss between phases
* Make architecture decisions

## 2. UI/UX Engineer

Responsibilities:

* Design a unique professional product experience
* Avoid generic AI-generated dashboard layouts
* Create consistent navigation
* Design responsive web interfaces
* Design assessment/exam UX separately
* Prioritize accessibility
* Create loading, empty, error and success states

## 3. Frontend Engineer

Technology:

* React
* Vite
* TypeScript
* Pure CSS

Responsibilities:

* Build reusable components
* Implement routing
* State management
* API integration
* Form validation
* Authentication UI
* Student dashboard
* Company dashboard
* Institution dashboard
* Challenge UI
* Recruitment UI
* Skill Passport
* Feed
* Notifications

## 4. Backend Engineer

Technology:

* Java
* Spring Boot

Responsibilities:

* REST APIs
* Business logic
* Authentication/authorization integration
* Recruitment engine
* Eligibility engine
* Coin system
* Skill system
* Assessment system
* Notifications
* Institution management
* Company management

## 5. Database Architect

Technology:

* PostgreSQL
* MongoDB

Responsibilities:

* Decide structured vs flexible data
* Database schema design
* Relationships
* Indexing
* Constraints
* Query optimization
* Transaction handling
* Data integrity
* Migration strategy

## 6. Redis Engineer

Technology:

* Upstash Redis

Responsibilities:

* Cache strategy
* Leaderboard caching
* Rate limiting
* Temporary data
* Eligibility caching
* Cache invalidation

Never use Redis as the primary source of truth.

## 7. Skill Intelligence Engineer

Responsibilities:

* Skill scoring
* Skill normalization
* Skill verification
* Skill-gap analysis
* Company readiness
* Skill matching

Must create explainable scoring.

## 8. Recommendation/ML Engineer

Technology:

* Python
* FastAPI
* Scikit-learn
* XGBoost

Responsibilities:

* Adaptive challenges
* Opportunity recommendations
* Skill-gap recommendations
* Company readiness
* Candidate matching

## 9. LLM Engineer

Technology:

* Ollama
* Open-source models

Responsibilities:

* Resume parsing
* Natural-language search
* Learning explanations
* AI recommendations
* Skill extraction

LLM output must never bypass security or hard eligibility rules.

## 10. Assessment Engine Engineer

Responsibilities:

* Assessment creation
* Question management
* Sections
* Timer
* Scoring
* Coding evaluation
* Submission handling
* Attempt management
* Result calculation

## 11. Electron/Desktop Engineer

Technology:

* Electron
* React
* TypeScript

Responsibilities:

* Desktop assessment application
* Secure exam environment
* Kiosk/fullscreen behavior
* Camera/microphone access
* Screen monitoring
* Application switching detection
* Exam state synchronization
* Crash/recovery handling
* Secure communication with backend

## 12. Proctoring Engineer

Responsibilities:

* Identity verification
* Webcam monitoring
* Microphone events
* Screen events
* Suspicious behavior detection
* Evidence collection
* Event timestamps
* Proctoring reports

Important:

Never automatically declare a student guilty based only on AI detection.

## 13. Security Engineer

Responsibilities:

* RBAC
* Authentication
* Authorization
* Input validation
* API security
* Rate limiting
* Secure file handling
* Assessment security
* Sensitive data protection
* Audit logs
* Token security
* OWASP protections

## 14. Notification Engineer

Responsibilities:

* In-app notifications
* Recruitment notifications
* Eligibility-aware notifications
* Company follow notifications
* Institution notifications
* Assessment reminders
* Challenge reminders

## 15. Gamification Engineer

Responsibilities:

* Beyon Coins
* XP where required
* Streaks
* Badges
* Leaderboards
* Rewards
* Coin transactions
* Anti-abuse mechanisms

## 16. Institution Analytics Engineer

Responsibilities:

* Institution score
* Placement analytics
* Salary analytics
* Company-tier analytics
* Student skill analytics
* Industry-demand analytics

All scoring formulas must be configurable.

## 17. Search Engineer

Responsibilities:

* Job search
* Company search
* Skill search
* Student search
* Institution search
* Opportunity filtering
* Ranking

Start simple and introduce advanced search only when necessary.

## 18. Testing Engineer

Technology:

* JUnit
* Mockito
* Vitest
* Playwright

Responsibilities:

* Unit tests
* Integration tests
* API tests
* Frontend tests
* End-to-end tests
* Assessment tests
* Eligibility tests
* Coin transaction tests
* Security tests

## 19. Performance Engineer

Responsibilities:

* API performance
* Database indexing
* Caching
* Pagination
* Lazy loading
* Query optimization
* Assessment concurrency
* Large leaderboard handling

Do not optimize blindly. Measure first.

## 20. Documentation Engineer

Responsibilities:

Maintain:

* README
* API documentation
* Architecture documentation
* Database documentation
* Setup documentation
* Feature documentation
* Assessment documentation

## 21. Code Reviewer

After every implementation:

* Review architecture
* Review security
* Review code quality
* Find duplication
* Find edge cases
* Verify requirements
* Verify tests
* Check previous functionality

## 22. QA/Bug Fixer

Responsibilities:

* Test implemented features
* Reproduce bugs
* Fix root causes
* Verify regressions
* Never hide errors
* Never remove features to make tests pass

## 23. Agent Working Rules

The agent must:

1. Read `knowledge.md` before implementation.
2. Read the current phase prompt completely.
3. Inspect existing code before modifying it.
4. Reuse existing components where appropriate.
5. Never rewrite working modules unnecessarily.
6. Never create fake backend responses for completed features.
7. Never hardcode business-critical data.
8. Validate all user inputs.
9. Add tests for important business logic.
10. Update documentation after meaningful architecture changes.
11. Preserve previous phase functionality.
12. Complete the current phase before starting the next phase.
13. Report incomplete work honestly.
14. Prefer simple architecture until scaling requires more complexity.
15. Keep structured and unstructured data in their intended stores.
