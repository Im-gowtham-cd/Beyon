# 🛡️ Beyon 4-Tier Scoped RBAC & Domain Data Ownership Specification

> **Platform Architecture Specification**: Multi-Tier Authorization, Organization Scoping, Domain Boundaries, Beyon AI Engine, and Unified Spring Boot Security.

---

## 1. Executive Summary & Core Principles

Beyon operates on a **4-tier access model** rather than flat monolithic roles. The guiding architectural principle is **Domain Ownership**:
> *Each role owns its domain and cannot directly modify another role's authoritative data.*

| Level | Role / Tier | Scope | Domain Authority |
|---|---|---|---|
| **Level 1** | **Super Admin** | Platform-Wide | Platform governance, approvals, moderation, audit, global catalogs. (Audit/Override model — never direct arbitrary data tampering). |
| **Level 2** | **Institution** | `institution_id` | Academic ecosystem: departments, batches, student enrollment verification, campus drives, and placement reports. (Cannot alter AI skill scores). |
| **Level 3** | **Company** | `company_id` | Industry & recruitment ecosystem: job definitions, required skill thresholds, candidate shortlisting, interviews, offers, and learning programs. |
| **Level 4** | **Student / User** | `user_id` (Candidate) | Candidate experience: skill proficiency, adaptive learning paths, daily challenges, portfolio, verified projects, and job applications. |
| **Service** | **Beyon AI Engine** | Central Platform Service | Cross-tier intelligence engine calculating skill gaps, priority skills, readiness matching, and adaptive recommendations. |

---

## 2. Role Responsibility Split Matrix

| Area | Super Admin | Institution Admin | Company Admin / Recruiter | Student / User |
|---|---|---|---|---|
| **Platform Settings** | ✅ Full control | ❌ None | ❌ None | ❌ None |
| **Approve Institutions** | ✅ Authoritative | ❌ None | ❌ None | ❌ None |
| **Approve Companies** | ✅ Authoritative | ❌ None | ❌ None | ❌ None |
| **Manage Students** | Full Audit/Suspend | Institution students only | ❌ None | Own profile & settings |
| **Verify Student Records** | Platform oversight | ✅ Department/Academic proof | ❌ None | ❌ None |
| **Skills Catalog & Taxonomy** | Full global management | View / verify course linkage | Define job requirements | Own skills & portfolio |
| **Skill Proficiency Scores** | Audit calculation rules | ❌ Cannot manually alter | ❌ Cannot manually alter | Earned via AI Engine |
| **Skill Assessments** | Configure global templates | Assign / recommend to batch | Create company assessments | Take & submit |
| **Courses & Programs** | Manage global catalog | Recommend to students | Add industry-led programs | Learn & earn certs |
| **Jobs & Opportunities** | Moderate / Flag | View for students | Create & manage | Search & apply |
| **Internships** | Moderate / Flag | View for students | Create & manage | Search & apply |
| **Placement Drives** | Global oversight | Create & manage | Participate & shortlist | Register & attend |
| **Applications** | Audit & compliance | Institution students | Company candidates | Own applications |
| **Interviews** | Compliance audit | Coordinate campus rounds | Schedule & evaluate | Attend & receive feedback |
| **Offers** | Compliance audit | View placement outcomes | Issue & track offers | View & accept/decline |
| **Placement Status** | Full audit | Verify & certify status | Report hiring outcome | View own status |
| **Analytics** | Global Platform Analytics | Institution & Department | Company & Campaign | Personal Growth & Skill Gaps |
| **Notifications** | Platform broadcast | Institution students | Applicants & followers | Personal alerts |
| **Reports** | System-wide compliance | Accreditation & NAAC/NIRF | Hiring & Pipeline velocity | Personal progress & certs |
| **Platform Moderation** | ✅ Authoritative | ❌ None | ❌ None | ❌ Report abuse |

---

## 3. Detailed Tier Breakdown & Sub-Roles

### Level 1: Super Admin (Platform Authority)

Super Admin governs the platform ecosystem through an **Audit / Approve / Suspend / Override** model rather than direct data mutation.

```
Super Admin
├── Dashboard (System Health, Signups, Active Sessions)
├── Institution Management (Approve, Reject, Audit, Suspend)
├── Company Management (Approve, Reject, Verify KYC, Suspend)
├── User Management (Global Search, Roles, Account States)
├── Verification Center (Pending Institutions, Companies, Flagged Proofs)
├── Skill & Career Management (Global Taxonomy, Roles, Ontology)
├── Assessment Management (Templates, Standardized Rubrics, Proctoring Policies)
├── Course & Learning Management (Catalog, Accredited Providers)
├── Job & Internship Moderation (Fraud/Spam Detection, Approvals)
├── Platform Analytics (Growth, Verification Rates, Placement Trends)
├── Reports & Complaints (Abuse Reports, Security Incidents)
├── Audit Logs (Tamper-Proof Ledger, Dolt Commit Auditing)
├── System Configuration (Feature Flags, Rate Limits, Storage Keys)
└── Security & Access Control (RBAC Policies, API Keys)
```

---

### Level 2: Institution Ecosystem (Academia Side)

The institution controls its academic and placement operations scoped to `institution_id`:

```
Institution (e.g., Kongu Engineering College)
├── Institution Admin (Full college governance, departments, staff access)
├── Placement Officer (Drives, company liaisons, shortlists, offers, verification)
├── Faculty / Department Coordinator (Department students, skill gap tracking, course suggestions)
└── Institution Viewer (Read-only analytics and reports)
```

**Student Management Boundary**:
- Institution **can**: Add/import students, verify enrollment, assign department/batch, verify academic credentials (CGPA, marksheet, bona fide), verify internship and project submissions, view skill profiles.
- Institution **CANNOT**: Manually edit or override student skill proficiency scores. Proficiency is authoritative to the student assessment + AI Skill Engine.

---

### Level 3: Company Ecosystem (Industry & Hiring Side)

The company controls talent discovery, assessment, and hiring scoped to `company_id`:

```
Company (e.g., Tata Consultancy Services)
├── Company Admin (Organization profile, billing, user provisioning, global hiring policies)
├── Recruiter (Post jobs/internships, manage pipelines, shortlist, schedule interviews)
├── Hiring Manager (Define role skill criteria, review portfolios, make hiring decisions)
├── Interviewer (Access assigned candidate briefs, score rubrics, submit evaluation notes)
└── Learning Manager (Publish industry workshops, certifications, project challenges)
```

**Skill Requirement Matching**:
A job post defines:
- Required Skills + Minimum Proficiencies (e.g., `Java ≥ 70%`, `DSA ≥ 65%`, `SQL ≥ 60%`)
- Preferred Skills (e.g., `Docker`, `AWS`, `React`)
- Education, Experience, Location, and Application Deadlines.

---

### Level 4: Student / Candidate Experience

The candidate experience is centered around career acceleration and skill mastery:

```
Student
├── Dashboard (Readiness Score, Daily Streak, Quick Actions)
├── My Skill Profile (109-node taxonomy, mastery meters, radar graph)
├── Skill Assessment (Adaptive tests, automated coding challenges, proctoring)
├── Daily Challenges & Practice (Targeted practice, streaks, XP rewards)
├── Learning Path (Generated dynamic path based on target job role gaps)
├── Recommended Courses & Certifications
├── Career Explorer & Role Intelligence
├── Job & Internship Recommendations (Matched by Skill Gap Engine)
├── Applications & Pipeline Tracker
├── Interview Room & Feedback Reviews
├── Portfolio & Showcase (Verified projects, GitHub sync, credential badges)
├── Beyon Coins & Gamification Economy
└── Settings & Privacy Controls
```

---

## 4. Scoped RBAC & Permission Engine

### The Scope Boundary Rule
Roles are combined with **Organization Scopes**:
```
Authenticated User = (Identity, Role, Scope)
Where Scope = { institution_id, company_id, department_id }
```

- An **Institution Admin** with `institution_id = 'KEC'` can only access:
  ```sql
  SELECT * FROM students WHERE institution_id = 'KEC';
  ```
  Attempting to view or verify a student where `institution_id = 'PSG'` results in `403 FORBIDDEN`.
- A **Company Recruiter** with `company_id = 'TCS'` can only access candidates who applied to TCS jobs or public opt-in profiles, never another company's private evaluation notes.

### Granular `Resource:Action` Permissions

```
RESOURCE        ACTION              PERMITTED ROLES
student         read                SUPER_ADMIN, INSTITUTION_*, COMPANY_RECRUITER (applicants), STUDENT (self)
student         verify              INSTITUTION_ADMIN, INSTITUTION_PLACEMENT_OFFICER, SUPER_ADMIN
student         update              STUDENT (self), INSTITUTION_ADMIN (academic only)

skill           read                ALL
skill           create              SUPER_ADMIN
skill           update              SUPER_ADMIN

assessment      create              SUPER_ADMIN, COMPANY_ADMIN, COMPANY_RECRUITER, INSTITUTION_ADMIN
assessment      publish             SUPER_ADMIN, COMPANY_ADMIN, COMPANY_RECRUITER
assessment      evaluate            SYSTEM, INTERVIEWER, HIRING_MANAGER
assessment      take                STUDENT

job             create              COMPANY_ADMIN, COMPANY_RECRUITER
job             publish             COMPANY_ADMIN, COMPANY_RECRUITER
job             update              COMPANY_ADMIN, COMPANY_RECRUITER
job             close               COMPANY_ADMIN, COMPANY_RECRUITER
job             moderate            SUPER_ADMIN

application     read                COMPANY_*, INSTITUTION_PLACEMENT_OFFICER (inst students), STUDENT (self)
application     shortlist           COMPANY_ADMIN, COMPANY_RECRUITER, COMPANY_HIRING_MANAGER
application     reject              COMPANY_ADMIN, COMPANY_RECRUITER, COMPANY_HIRING_MANAGER

interview       schedule            COMPANY_ADMIN, COMPANY_RECRUITER
interview       evaluate            COMPANY_INTERVIEWER, COMPANY_HIRING_MANAGER
interview       attend              STUDENT

offer           create              COMPANY_ADMIN, COMPANY_RECRUITER, COMPANY_HIRING_MANAGER
offer           update              COMPANY_ADMIN, COMPANY_RECRUITER
offer           read                COMPANY_*, STUDENT (self), INSTITUTION_PLACEMENT_OFFICER (summary)

placement       verify              INSTITUTION_ADMIN, INSTITUTION_PLACEMENT_OFFICER, SUPER_ADMIN
placement       report              COMPANY_*, INSTITUTION_*

course          create              SUPER_ADMIN, COMPANY_LEARNING_MANAGER, INSTITUTION_ADMIN
course          publish             SUPER_ADMIN, COMPANY_LEARNING_MANAGER

institution     approve             SUPER_ADMIN
company         approve             SUPER_ADMIN
```

---

## 5. Beyon AI Engine Architecture

The **Beyon AI Engine** is a centralized platform service that operates independently of any single company or college:

```
                  ┌──────────────────────────────┐
                  │       BEYON AI ENGINE        │
                  └──────────────┬───────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
  Skill Analysis          Career Analysis         Industry Demand
  (Assessment telemetry,   (Target roles,          (Live job requirements,
   code runner, accuracy)   career pathways)        emerging technologies)
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                     Personalization Engine
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
  Daily Questions         Learning Path           Targeted Courses
  (Spaced repetition,     (Curated modules        (Bridge high-priority
   difficulty scaling)     for target roles)       skill deficits)
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                     Candidate Readiness Match
                     (Calculated % match against
                      company job requirements)
```

---

## 6. Single Backend & Segregated Frontend Topology

```
                                [Browser / Mobile / Desktop]
                                             │
             ┌───────────────────────────────┼───────────────────────────────┐
             ▼                               ▼                               ▼
    /admin/* Portal                /institution/* Portal           /company/* Portal
  (Platform Governance)            (Academic & Placement)          (Recruiter & Hiring)
             │                               │                               │
             └───────────────────────────────┼───────────────────────────────┘
                                             ▼
                                /student/* Candidate Experience
                                             │
                                             ▼ (REST / HTTPS with Bearer JWT)
                             ┌───────────────────────────────┐
                             │  Spring Boot 3.4 API Gateway  │
                             │   Centralized RBAC + Scoping  │
                             └───────────────┬───────────────┘
                                             │
                      ┌──────────────────────┼──────────────────────┐
                      ▼                      ▼                      ▼
               com.beyon.identity      com.beyon.platform     com.beyon.institution
               (JWT, Claims, Scope)    (Permissions, Matrix)   (Scoped students/drives)
                      ▼                      ▼                      ▼
               com.beyon.recruitment   com.beyon.intelligence  com.beyon.practice
               (Jobs, Shortlists)      (Beyon AI Engine API)   (Questions, Challenges)
```

**Benefits of Single Backend Architecture**:
1. **Zero Data Drift**: Unified database transactions, consistent foreign keys, and Dolt version-controlled audit hashes.
2. **Centralized Security Enforcement**: All RBAC rules, token validations, and scope checks execute in one audited filter chain.
3. **Simplified Deployment & Scalability**: Single container artifact (`backend.jar`) scaling horizontally behind Nginx/Cloudflare.
