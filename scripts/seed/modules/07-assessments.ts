// ============================================================
// Module 07 — Assessments Seeder
// Creates tests (assessment fixtures) with questions
// ============================================================

import { doltBatch, doltExec, esc, escNum, doltQuery } from "../engine/dolt.js";
import { skillIds, skillTopicIds } from "./01-skills.js";
import { questionIds } from "./06-questions.js";
import { companyUserIds } from "./03-companies.js";
import { SeededRandom } from "../utils/faker.js";
import type { SeedConfig } from "../config.js";

export const testIds: string[] = [];
export const assessmentSessionIds: string[] = [];

/** Ensure skillIds and companyUserIds are populated from DB if running standalone */
async function ensureRefsLoaded(): Promise<void> {
  if (Object.keys(skillIds).length === 0) {
    const rows = doltQuery("SELECT id, slug FROM skills WHERE id LIKE 'beyon-skill-%'");
    for (const row of rows) {
      // Map slug back to key form
      const key = "SKILL_" + row.slug.replace(/-/g, "_").toUpperCase();
      (skillIds as any)[key] = row.id;
    }
  }
  if (Object.keys(companyUserIds).length === 0) {
    const rows = doltQuery("SELECT id FROM users WHERE role='COMPANY_ADMIN' AND id LIKE 'beyon-comp-user-%'");
    let i = 0;
    for (const row of rows) {
      (companyUserIds as any)[`COMP_${String(i + 1).padStart(4, "0")}`] = row.id;
      i++;
    }
  }
  if (questionIds.length === 0) {
    const rows = doltQuery("SELECT id FROM questions WHERE id LIKE 'beyon-q-%' LIMIT 500");
    for (const row of rows) questionIds.push(row.id);
  }
}

export async function seedAssessments(cfg: SeedConfig): Promise<void> {
  console.log("\n📝 Seeding assessments...");

  await ensureRefsLoaded();

  const rng = new SeededRandom(cfg.seed + 3000);
  const testStmts: string[] = [];
  const testQStmts: string[] = [];

  // ─── Fixed Assessment Fixture ───
  const fixtureId = "beyon-test-java-backend-001";
  testIds.push(fixtureId);
  const compUserId = companyUserIds["COMP_0001"] ?? null;

  testStmts.push(
    `INSERT IGNORE INTO tests (id, title, description, test_type, duration_minutes, difficulty, total_questions, passing_score, status, created_by, created_at, updated_at)
     VALUES (
       ${esc(fixtureId)},
       'Java Backend Recruitment Assessment',
       'Comprehensive Java backend assessment covering Java fundamentals, SQL, Spring Boot, and system design concepts.',
       'COMPANY', 90, 'MEDIUM', 28, 65.00, 'ACTIVE', ${esc(compUserId)}, NOW(), NOW()
     );`
  );

  // Attach questions to fixture (10 Java MCQ + 5 SQL + 3 Coding + 10 fill)
  const javaQIds = questionIds.filter(q => q.includes("java") || q.includes("JAVA")).slice(0, 10);
  const sqlQIds = questionIds.filter(q => q.includes("sql") || q.includes("SQL")).slice(0, 5);
  const codingQIds = questionIds.filter(q => q.includes("coding")).slice(0, 3);
  const fillQIds = questionIds.filter(q => q.includes("gen")).slice(0, 10);
  const allFixtureQIds = [...javaQIds, ...sqlQIds, ...codingQIds, ...fillQIds];

  for (let i = 0; i < allFixtureQIds.length; i++) {
    const qId = allFixtureQIds[i];
    const tqId = `beyon-tq-fixture-${i}`;
    testQStmts.push(
      `INSERT IGNORE INTO test_questions (id, test_id, question_id, display_order, marks)
       VALUES (${esc(tqId)}, ${esc(fixtureId)}, ${esc(qId)}, ${i + 1}, ${i < 20 ? 2 : 5});`
    );
  }

  // ─── Daily Challenges (per-student, per-date) ───
  const dailyChallengeStmts: string[] = [];
  const today = new Date();
  // Only seed for the fixed exam candidates to keep volume manageable
  const challengeStudents = [
    "beyon-student-strong-0001",
    "beyon-student-placement-0001",
    "beyon-exam-candidate-0001",
  ];
  for (const studentId of challengeStudents) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      const dateStr = date.toISOString().split("T")[0];
      const qId = rng.pick(questionIds);
      const id = `beyon-daily-${studentId.slice(-8)}-${dateStr}`;
      dailyChallengeStmts.push(
        `INSERT IGNORE INTO daily_challenges (id, student_id, challenge_date, question_id, status, created_at)
         VALUES (${esc(id)}, ${esc(studentId)}, ${esc(dateStr)}, ${esc(qId)}, 'ACTIVE', NOW());`
      );
    }
  }

  // ─── Generated Company Assessments ───
  const COMP_KEYS = Object.keys(companyUserIds).slice(0, cfg.counts.assessments);
  for (let i = 0; i < COMP_KEYS.length; i++) {
    const compKey = COMP_KEYS[i];
    const cUserId = companyUserIds[compKey];
    const testId = `beyon-test-comp-${i}`;
    testIds.push(testId);
    const diff = rng.pick(["EASY", "MEDIUM", "MEDIUM", "HARD"]);
    const qCount = rng.int(10, 30);
    testStmts.push(
      `INSERT IGNORE INTO tests (id, title, description, test_type, duration_minutes, difficulty, total_questions, passing_score, status, created_by, created_at, updated_at)
       VALUES (
         ${esc(testId)},
         ${esc(`Company Assessment ${i + 1} — ${diff} Level`)},
         'Technical screening assessment for candidate evaluation.',
         'COMPANY', ${rng.int(45, 120)}, ${esc(diff)}, ${qCount}, ${rng.int(50, 75)}.00,
         'ACTIVE', ${esc(cUserId)}, NOW(), NOW()
       );`
    );

    // Attach random questions
    const qSample = rng.pickN(questionIds, Math.min(qCount, questionIds.length));
    for (let qi = 0; qi < qSample.length; qi++) {
      const tqId = `beyon-tq-comp-${i}-${qi}`;
      testQStmts.push(
        `INSERT IGNORE INTO test_questions (id, test_id, question_id, display_order, marks)
         VALUES (${esc(tqId)}, ${esc(testId)}, ${esc(qSample[qi])}, ${qi + 1}, 2);`
      );
    }
  }

  doltBatch(testStmts);
  doltBatch(testQStmts, 150);
  doltBatch(dailyChallengeStmts);

  console.log(`  ✅ ${testIds.length} assessments/tests`);
  console.log(`  ✅ ${dailyChallengeStmts.length} daily challenges`);
}
