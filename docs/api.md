# Academia–Industry Collaboration Portal — REST & WebSocket API Specification

## 1. Global API Standards

- **Base URL**: `http://localhost:8085/api/v1` (Backend) / `http://localhost:8000/api/v1` (AI Service)
- **Authentication**: `Authorization: Bearer <jwt_access_token>`
- **Response Format**:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null,
    "timestamp": "2026-09-20T08:00:00.000Z",
    "traceId": "req-98f21a4e"
  }
  ```

---

## 2. API Endpoint Catalog by Module

### 2.1 Authentication & Identity
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register student, faculty, institution, or industry account |
| `POST` | `/auth/login` | Public | Authenticate and obtain access + refresh tokens |
| `POST` | `/auth/refresh-token` | Public | Refresh expired JWT access token |
| `GET` | `/auth/me` | Authenticated | Fetch authenticated user context and profile status |
| `POST` | `/auth/force-change-password` | Temporary Users | Force initial password reset for bulk-imported accounts |

### 2.2 Institution & Department Monitoring
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/institution/dashboard` | Institution Admin/HOD | Top-level KPIs: placement rate, verified students, drive count |
| `GET` | `/institution/students` | Institution Admin/HOD | Paginated student cohort roster with search & filter |
| `POST` | `/institution/students/bulk-import` | Institution Admin | Bulk upload student roster CSV with credential generation |
| `GET` | `/institution/students/{studentId}/monitoring` | Institution / Faculty | Complete student monitoring dossier (skills, gaps, tests, drives) |
| `GET` | `/institution/hierarchy` | Institution Admin | Full organizational hierarchy (Depts, Faculty, Batches) |

### 2.3 Skill Assessment & Verification
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/skills` | Public / Student | List master skill taxonomy categorized by domain |
| `GET` | `/skills/{skillSlug}` | Public / Student | Retrieve skill breakdown, learning topics, and rank distribution |
| `POST` | `/assessments/start` | Student | Initialize a timed skill verification assessment session |
| `POST` | `/assessments/{sessionId}/submit` | Student | Submit assessment answers for automated grading |
| `GET` | `/assessments/{sessionId}/result` | Student / Recruiter | View normalized score (1-10), verification status, and weak topics |
| `POST` | `/assessments/{sessionId}/proctoring-event` | Proctored App | Ingest real-time face, gaze, audio, or tab-switch telemetry |

### 2.4 Skill Gap Analysis & Adaptive Learning
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/intelligence/skill-gap` | Student | Calculate skill gaps against selected target career role |
| `GET` | `/intelligence/recommendations` | Student | AI recommendations for courses, videos, challenges, and mentors |
| `GET` | `/intelligence/career-roadmap` | Student | Step-by-step milestone learning path to reach target role |

### 2.5 Practice Arena & Challenges
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/practice/questions` | Student | Filter practice questions by skill, topic, and difficulty |
| `POST` | `/practice/questions/{id}/submit` | Student | Submit solution code / answer and earn XP/Coins |
| `GET` | `/practice/daily-challenge` | Student | Fetch today's 3-problem curated daily challenge |
| `POST` | `/practice/daily-challenge/submit` | Student | Submit daily challenge problem and increment streak count |
| `GET` | `/practice/revised-challenges` | Student | Retrieve personalized challenges generated from weak assessment areas |
| `GET` | `/leaderboard` | Authenticated | Global, institutional, and contest XP leaderboards |

### 2.6 Opportunities & Transparent Matching
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/recruitment/opportunities` | Authenticated | Browse active job openings, internships, and hackathons |
| `POST` | `/recruitment/opportunities` | Industry Recruiter | Create new hiring opportunity with required skill thresholds |
| `GET` | `/recruitment/opportunities/{id}/match-score` | Student | Get real-time transparent match percentage and skill fit breakdown |
| `POST` | `/recruitment/opportunities/{id}/apply` | Student | Submit application with verified skill dossier |
| `GET` | `/recruitment/opportunities/{id}/candidates` | Recruiter | Candidate ATS pipeline with match score ranking |

### 2.7 Faculty Hub & Mentorship
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/mentorship/sessions` | Authenticated | List available 1:1 and group mentorship sessions |
| `POST` | `/mentorship/sessions` | Faculty / Mentor | Create a new mentorship availability slot or workshop |
| `POST` | `/mentorship/sessions/{id}/book` | Student | Book a session slot with mentor |

### 2.8 Collaborative Projects Marketplace
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/community/projects` | Authenticated | List industry and academic collaborative projects |
| `POST` | `/community/projects` | Authenticated | Create a project proposal looking for student contributors |
| `POST` | `/community/projects/{id}/apply` | Student | Apply to join a project team with verified skill credentials |
