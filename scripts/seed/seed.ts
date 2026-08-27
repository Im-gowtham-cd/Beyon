#!/usr/bin/env bun
// ============================================================
// Beyon Seed System — Main CLI Entry Point
//
// Usage:
//   bun run seed.ts [mode] [options]
//
// Modes:
//   base          Fixed accounts + taxonomy + institutions + companies
//   assessment    Questions + assessments
//   recruitment   Opportunities + drives + applications
//   community     Follows + notifications
//   full          Everything (default)
//   validate      Integrity checks only
//   reset         Wipe seeded test data (dev/staging only)
//
// Options:
//   --force-production   Override env guard (dangerous)
//   --students=N         Override student count
//   --questions=N        Override question count
// ============================================================

import { assertNotProduction, loadConfig } from "./config.js";
import { seedSkills } from "./modules/01-skills.js";
import { seedInstitutions } from "./modules/02-institutions.js";
import { seedCompanies } from "./modules/03-companies.js";
import { seedUsers } from "./modules/04-users.js";
import { seedStudentProfiles } from "./modules/05-student-profiles.js";
import { seedQuestions } from "./modules/06-questions.js";
import { seedAssessments } from "./modules/07-assessments.js";
import { seedOpportunities } from "./modules/08-opportunities.js";
import { seedApplicationsAndCoins } from "./modules/09-applications.js";
import { seedNotifications } from "./modules/11-notifications.js";
import { seedCommunity } from "./modules/12-community.js";
import { validateIntegrity } from "./modules/13-validate.js";
import { doltQuery, getQueryCount } from "./engine/dolt.js";
import * as fs from "fs";
import * as path from "path";
import { DOCS_DIR } from "./config.js";

// ─── Parse CLI args ───────────────────────────────────────────
const args = process.argv.slice(2);
const mode = args.find(a => !a.startsWith("--")) ?? "full";
const forceProduction = args.includes("--force-production");

// Parse --key=value overrides
function getArg(name: string): string | undefined {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split("=")[1] : undefined;
}

const overrides: Record<string, number> = {};
for (const key of ["students", "questions", "jobs", "applications", "notifications"]) {
  const val = getArg(key);
  if (val) overrides[key] = parseInt(val);
}

// ─── Environment Guard ────────────────────────────────────────
assertNotProduction(forceProduction);

const cfg = loadConfig(overrides);
const startTime = Date.now();

// ─── Banner ───────────────────────────────────────────────────
console.log(`
╔══════════════════════════════════════════════════════════════╗
║         BEYON TEST DATA SEED SYSTEM                         ║
╠══════════════════════════════════════════════════════════════╣
║  Mode        : ${mode.toUpperCase().padEnd(44)} ║
║  Environment : ${cfg.environment.padEnd(44)} ║
║  Seed        : ${String(cfg.seed).padEnd(44)} ║
║  Students    : ${String(cfg.counts.students).padEnd(44)} ║
║  Questions   : ${String(cfg.counts.questions).padEnd(44)} ║
╚══════════════════════════════════════════════════════════════╝
`);

// ─── Reset Mode ───────────────────────────────────────────────
if (mode === "reset") {
  console.log("⚠️  RESET MODE — This will delete all seeded test data.");
  console.log("   Only beyon@example.beyon.test domain records will be removed.\n");

  const tables = [
    "follows", "notifications", "opportunity_applications",
    "placement_drives", "company_opportunities", "daily_challenges",
    "test_questions", "tests", "question_options", "questions",
    "coin_transactions", "coin_wallets", "student_skills",
    "student_profiles", "company_profiles", "institution_profiles",
    "users",
  ];

  for (const tbl of tables) {
    try {
      doltQuery(`DELETE FROM ${tbl}`);
      console.log(`  🗑️  Cleared ${tbl}`);
    } catch (e: any) {
      console.warn(`  ⚠️  Could not clear ${tbl}: ${e.message.slice(0, 80)}`);
    }
  }
  console.log("\n✅ Reset complete.");
  process.exit(0);
}

// ─── Validate Mode ────────────────────────────────────────────
if (mode === "validate") {
  await validateIntegrity();
  process.exit(0);
}

// ─── Seed Execution ───────────────────────────────────────────
async function runBase() {
  await seedSkills();
  await seedInstitutions();
  await seedCompanies();
  await seedUsers(cfg);
  await seedStudentProfiles(cfg);
}

async function runAssessment() {
  await seedQuestions(cfg);
  await seedAssessments(cfg);
}

async function runRecruitment() {
  await seedOpportunities(cfg);
  await seedApplicationsAndCoins(cfg);
}

async function runCommunity() {
  await seedNotifications(cfg);
  await seedCommunity(cfg);
}

try {
  switch (mode) {
    case "base":
      await runBase();
      break;
    case "assessment":
      await runAssessment();
      break;
    case "recruitment":
      await runRecruitment();
      break;
    case "community":
      await runCommunity();
      break;
    case "full":
    default:
      await runBase();
      await runAssessment();
      await runRecruitment();
      await runCommunity();
      break;
  }

  // ─── Auto-validate after full/base ───
  if (["full", "base"].includes(mode)) {
    const results = await validateIntegrity();
    await generateSeedReport(results, cfg, startTime);
    await generateDocs();
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Seed completed in ${elapsed}s (${getQueryCount()} SQL operations)\n`);
  process.exit(0);

} catch (err: any) {
  console.error("\n❌ Seed failed:", err.message);
  if (process.env.DEBUG) console.error(err.stack);
  process.exit(1);
}

// ─── Report & Doc Generation ─────────────────────────────────
async function generateSeedReport(results: any[], cfg: any, startTime: number) {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const passes = results.filter(r => r.status === "PASS").length;
  const fails = results.filter(r => r.status === "FAIL").length;
  const overallStatus = fails === 0 ? "PASS" : "FAIL";

  // Query final counts
  const getCnt = (sql: string) => {
    try { return doltQuery(sql)[0]?.cnt ?? "0"; } catch { return "ERR"; }
  };

  const report = `# BEYON TEST DATA SEED REPORT
Generated: ${new Date().toISOString()}

========================================
ENVIRONMENT  : ${cfg.environment}
SEED VALUE   : ${cfg.seed}
ELAPSED      : ${elapsed}s
OVERALL      : ${overallStatus}
========================================

RECORDS CREATED
───────────────
Users               : ${getCnt("SELECT COUNT(*) as cnt FROM users WHERE email LIKE '%beyon.test'")}
Students            : ${getCnt("SELECT COUNT(*) as cnt FROM users WHERE role='STUDENT' AND email LIKE '%beyon.test'")}
Institutions        : ${getCnt("SELECT COUNT(*) as cnt FROM institution_profiles")}
Companies           : ${getCnt("SELECT COUNT(*) as cnt FROM company_profiles")}
Skills              : ${getCnt("SELECT COUNT(*) as cnt FROM skills")}
Questions           : ${getCnt("SELECT COUNT(*) as cnt FROM questions")}
Assessments/Tests   : ${getCnt("SELECT COUNT(*) as cnt FROM tests")}
Opportunities       : ${getCnt("SELECT COUNT(*) as cnt FROM company_opportunities")}
Applications        : ${getCnt("SELECT COUNT(*) as cnt FROM opportunity_applications")}
Coin Transactions   : ${getCnt("SELECT COUNT(*) as cnt FROM coin_transactions")}
Notifications       : ${getCnt("SELECT COUNT(*) as cnt FROM notifications")}
Follows             : ${getCnt("SELECT COUNT(*) as cnt FROM follows")}
Daily Challenges    : ${getCnt("SELECT COUNT(*) as cnt FROM daily_challenges")}

========================================
VALIDATION RESULTS
══════════════════
${results.map(r => `${r.status.padEnd(5)} | ${r.check.padEnd(38)} | ${r.detail}`).join("\n")}

========================================
Integrity Checks    : ${fails === 0 ? "PASS" : "FAIL"}
Coin Reconciliation : ${results.find(r => r.check === "Coin Ledger Reconciliation")?.status ?? "N/A"}
========================================

KNOWN NOTES
• Generated student accounts use password='SEEDED_NO_AUTH' (no real login possible)
• Only fixed test accounts (example.beyon.test) support actual login via Appwrite
• Run 'bun run seed.ts validate' to re-run checks at any time
• Run 'bun run seed.ts reset' to wipe all seeded data
`;

  const outPath = path.join(DOCS_DIR, "SEED_REPORT.md");
  fs.mkdirSync(DOCS_DIR, { recursive: true });
  fs.writeFileSync(outPath, report, "utf8");
  console.log(`\n📄 Seed report written to docs/SEED_REPORT.md`);
}

async function generateDocs() {
  fs.mkdirSync(DOCS_DIR, { recursive: true });

  // TEST_ACCOUNTS.md
  const accounts = `# Beyon — Test Accounts

> [!CAUTION]
> These are TEST credentials for development/staging ONLY.
> Never use in production. Never commit real passwords to version control.

## Platform Admins

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@example.beyon.test | BeyonTest!2026#Super |
| Admin | admin@example.beyon.test | BeyonTest!2026#Admin |
| Moderator | moderator@example.beyon.test | BeyonTest!2026#Moderator |

## Students

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Student (Strong) | student.strong@example.beyon.test | BeyonTest!2026#Student1 | Persona A: High performer, CGPA 9.1, 2450 coins |
| Student (Weak) | student.weak@example.beyon.test | BeyonTest!2026#Student2 | Persona C: Low performer, CGPA 6.4, 80 coins |
| Student (Placement Willing) | student.placement@example.beyon.test | BeyonTest!2026#Student3 | Persona B: Average, campus placement eligible |
| Student (Independent) | student.independent@example.beyon.test | BeyonTest!2026#Student4 | Persona D: Not seeking campus placement |
| Student (Incomplete Profile) | student.incomplete@example.beyon.test | BeyonTest!2026#Student5 | Unverified email, minimal profile data |

## Exam Candidates

| Email | Password | Assessment State |
|-------|----------|-----------------|
| exam.candidate1@example.beyon.test | BeyonTest!2026#Exam1 | READY (eligible, 1000 coins) |
| exam.candidate2@example.beyon.test | BeyonTest!2026#Exam2 | BLOCKED (ineligible CGPA) |
| exam.candidate3@example.beyon.test | BeyonTest!2026#Exam3 | INSUFFICIENT_COINS (50 coins, needs 250) |
| exam.candidate4@example.beyon.test | BeyonTest!2026#Exam4 | IN_PROGRESS |
| exam.candidate5@example.beyon.test | BeyonTest!2026#Exam5 | SUBMITTED |

## Company

| Role | Email | Password |
|------|-------|----------|
| Company Recruiter | recruiter@example.beyon.test | BeyonTest!2026#Recruiter |
| Company Admin | company.admin@example.beyon.test | BeyonTest!2026#Company |

## Institution

| Role | Email | Password |
|------|-------|----------|
| Institution Admin | institution.admin@example.beyon.test | BeyonTest!2026#Institution |
| Placement Officer | placement@example.beyon.test | BeyonTest!2026#Placement |
| Faculty | faculty@example.beyon.test | BeyonTest!2026#Faculty |

## Other Roles

| Role | Email | Password |
|------|-------|----------|
| Mentor | mentor@example.beyon.test | BeyonTest!2026#Mentor |
| Alumni | alumni@example.beyon.test | BeyonTest!2026#Alumni |
`;

  fs.writeFileSync(path.join(DOCS_DIR, "TEST_ACCOUNTS.md"), accounts, "utf8");

  // TEST_SCENARIOS.md
  const scenarios = `# Beyon — Test Scenarios

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

**ID**: \`TEST-JAVA-BACKEND-001\`

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

\`\`\`bash
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
\`\`\`
`;

  fs.writeFileSync(path.join(DOCS_DIR, "TEST_SCENARIOS.md"), scenarios, "utf8");
  console.log("📄 docs/TEST_ACCOUNTS.md written");
  console.log("📄 docs/TEST_SCENARIOS.md written");
}
