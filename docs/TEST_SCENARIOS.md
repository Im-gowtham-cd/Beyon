# Beyon — Test Scenarios

## Account → Scenario Matrix

| Account | Purpose / Test Scenario |
|---------|------------------------|
| student.strong@... | High performer: full profile, 2450 coins, eligible for all assessments |
| student.weak@... | Low performer: minimal skills, 80 coins, ineligible for most assessments |
| student.placement@... | Campus placement flow: drive participation, application tracking |
| student.independent@... | Independent hiring: can apply publicly but not via campus drives |
| student.incomplete@... | Onboarding flow: empty profile, triggers completion prompts |
| exam.candidate1@... | Happy path: login → eligible → coins sufficient → start assessment |
| exam.candidate2@... | Eligibility gate: login → CGPA check fails → blocked |
| exam.candidate3@... | Coin gate: login → eligible → insufficient coins → wallet top-up flow |
| exam.candidate4@... | Resume session: assessment already in progress → desktop resume |
| exam.candidate5@... | Submitted result: assessment done → score/result screen |
| recruiter@... | Post opportunity, review applications, shortlist candidates |
| company.admin@... | Company dashboard, manage assessment creation, view analytics |
| institution.admin@... | Institution dashboard, student overview, placement tracking |
| placement@... | Placement officer: drive management, student eligibility view |
| faculty@... | Faculty portal: student progress, skill overview |
| mentor@... | Mentorship requests, session scheduling |
| alumni@... | Alumni network, referral posting |
| moderator@... | Community moderation, post review, report management |
| admin@... | Admin panel: user management, audit logs, analytics |
| superadmin@... | Full platform control, role management, system settings |

## Assessment Test Fixture

**ID**: `TEST-JAVA-BACKEND-001`

| Section | Questions | Marks |
|---------|-----------|-------|
| Java Fundamentals | 10 | 20 |
| SQL | 5 | 10 |
| Coding | 3 | 40 |
| Backend Concepts | 10 | 30 |
| **Total** | **28** | **100** |

- Duration: 90 minutes
- Coin Cost: 250
- Passing Score: 65%

## Proctoring Fixtures

| Session | Violations | Risk | Decision |
|---------|-----------|------|----------|
| Clean | 0 | LOW | CLEAR |
| Warning | FACE_NOT_DETECTED | MEDIUM | REVIEW |
| Multiple | FOCUS_LOST + FULLSCREEN_EXIT | HIGH | REVIEW |
| Critical | MULTIPLE_FACE + SCREEN_CAPTURE | HIGH | REVIEW_REQUIRED |

## Eligibility Test Cases

| Case | Skills | CGPA | Coins | Drive Type | Expected |
|------|--------|------|-------|-----------|---------|
| 1 | ✅ | ✅ | ✅ | Any | ELIGIBLE |
| 2 | ❌ | ✅ | ✅ | Any | INELIGIBLE |
| 3 | ✅ | ❌ | ✅ | Any | INELIGIBLE |
| 4 | ✅ | ✅ | ❌ | Any | CANNOT_APPLY |
| 5 | ✅ | N/A | ✅ | Public | CAN_APPLY_INDEPENDENTLY |
| 6 | ✅ | N/A | ✅ | Campus Drive | NOT_ELIGIBLE_FOR_CAMPUS_DRIVE |

## Commands

```bash
# Run full seed
bun run seed.ts full

# Run only base (accounts + taxonomy)
bun run seed.ts base

# Run only assessments
bun run seed.ts assessment

# Run only recruitment
bun run seed.ts recruitment

# Run validation
bun run seed.ts validate

# Reset test data
bun run seed.ts reset

# Override counts
bun run seed.ts full --students=100 --questions=1000
```
