// ============================================================
// Module 08 — Opportunities Seeder
// Creates job/internship opportunities from company users
// ============================================================

import { doltBatch, esc, escNum, doltQuery } from "../engine/dolt.js";
import { COMPANIES } from "../data/companies.js";
import { companyUserIds } from "./03-companies.js";
import { testIds } from "./07-assessments.js";
import { SeededRandom } from "../utils/faker.js";
import type { SeedConfig } from "../config.js";

export const opportunityIds: string[] = [];
export const driveIds: string[] = [];

async function ensureCompanyIds(): Promise<void> {
  if (Object.keys(companyUserIds).length > 0) return;
  const rows = doltQuery("SELECT id FROM users WHERE role='COMPANY_ADMIN' AND id LIKE 'beyon-comp-user-%'");
  let i = 0;
  for (const row of rows) {
    (companyUserIds as any)[`COMP_${String(i + 1).padStart(4, "0")}`] = row.id;
    i++;
  }
  if (testIds.length === 0) {
    const trows = doltQuery("SELECT id FROM tests WHERE id LIKE 'beyon-test-%' LIMIT 20");
    for (const r of trows) testIds.push(r.id);
  }
}

const JOB_TITLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "Java Developer",
  "Python Developer", "Data Analyst", "Data Scientist", "ML Engineer",
  "DevOps Engineer", "Cloud Engineer", "QA Engineer", "Software Engineer",
  "Senior Java Developer", "Junior JavaScript Developer", "Java Spring Engineer",
  "Database Administrator", "Cybersecurity Engineer", "Android Developer", "Flutter Developer",
  "Node.js Backend Engineer", "React Frontend Engineer", "Python ML Engineer",
];

const OPTY_TYPES = ["FULL_TIME", "FULL_TIME", "FULL_TIME", "INTERNSHIP", "INTERNSHIP", "CONTRACT"] as const;
const STATUSES = ["PUBLISHED", "PUBLISHED", "PUBLISHED", "CLOSING_SOON", "CLOSED"] as const;

export async function seedOpportunities(cfg: SeedConfig): Promise<void> {
  console.log("\n💼 Seeding opportunities & drives...");

  await ensureCompanyIds();

  const rng = new SeededRandom(cfg.seed + 4000);
  const optyStmts: string[] = [];
  const driveStmts: string[] = [];

  const compKeys = Object.keys(companyUserIds);
  const instKeys = Object.keys(companyUserIds); // reused as placeholder

  // ─── Company Opportunities ───
  for (let i = 0; i < cfg.counts.jobs; i++) {
    const compKey = compKeys[i % compKeys.length];
    const compUserId = companyUserIds[compKey];
    const comp = COMPANIES.find(c => c.key === compKey);
    const id = `beyon-opty-${i}`;
    opportunityIds.push(id);

    const title = rng.pick(JOB_TITLES);
    const optyType = rng.pick(OPTY_TYPES);
    const status = rng.pick(STATUSES);
    const minCgpa = rng.float(6.0, 8.0);
    const coinCost = rng.pick([0, 50, 100, 150, 250, 500]);
    const testId = rng.bool(0.6) ? rng.pick(testIds) : null;
    const skills = comp ? rng.pickN(comp.hiringSkills, 2).join(",") : "SKILL_JAVA,SKILL_SQL";

    optyStmts.push(
      `INSERT IGNORE INTO company_opportunities
        (id, company_user_id, title, description, opportunity_type, location, is_remote,
         min_cgpa, required_skills, min_beyon_coins, assessment_id, status, created_at, updated_at)
       VALUES (
         ${esc(id)}, ${esc(compUserId)},
         ${esc(title)},
         ${esc(`${title} position at a leading technology company. Strong problem-solving and communication skills required.`)},
         ${esc(optyType)},
         ${esc(comp?.city ?? "Bangalore")},
         ${rng.bool(0.4) ? 1 : 0},
         ${escNum(Math.round(minCgpa * 100) / 100)},
         ${esc(skills)},
         ${coinCost},
         ${esc(testId)},
         ${esc(status)},
         NOW(), NOW()
       );`
    );
  }

  // ─── Placement Drives ───
  // Need institution_id from institution_profiles table
  for (let i = 0; i < 20; i++) {
    const compKey = compKeys[i % compKeys.length];
    const compUserId = companyUserIds[compKey];
    const optyId = opportunityIds[i % opportunityIds.length];
    // Use a stable institution user id
    const instUserId = `beyon-inst-user-beyon-inst-inst_${String(i % 25 + 1).padStart(4, "0")}`;
    const driveId = `beyon-drive-${i}`;
    driveIds.push(driveId);

    const driveDate = new Date();
    driveDate.setDate(driveDate.getDate() + rng.int(-30, 60));
    const driveDateStr = driveDate.toISOString().split("T")[0];

    const status = rng.pick(["PENDING", "ACTIVE", "COMPLETED", "ACTIVE"]);

    driveStmts.push(
      `INSERT IGNORE INTO placement_drives
        (id, opportunity_id, institution_id, company_user_id, title, description, status,
         eligible_student_count, drive_date, created_at, updated_at)
       VALUES (
         ${esc(driveId)}, ${esc(optyId)}, ${esc(instUserId)}, ${esc(compUserId)},
         ${esc(`Campus Drive ${i + 1}`)},
         'Campus recruitment drive for eligible students.',
         ${esc(status)}, ${rng.int(20, 200)}, ${esc(driveDateStr)}, NOW(), NOW()
       );`
    );
  }

  doltBatch(optyStmts, 50);
  doltBatch(driveStmts);

  console.log(`  ✅ ${optyStmts.length} job/internship opportunities`);
  console.log(`  ✅ ${driveStmts.length} placement drives`);
}
