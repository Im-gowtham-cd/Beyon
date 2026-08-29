import { doltBatch, doltExec, esc, escNum, doltQuery, toUUID } from "../engine/dolt.js";
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
    const rows = doltQuery("SELECT id, slug FROM skills");
    for (const row of rows) {
      const key = "SKILL_" + row.slug.replace(/-/g, "_").toUpperCase();
      (skillIds as any)[key] = row.id;
    }
  }
  if (Object.keys(companyUserIds).length === 0) {
    const rows = doltQuery("SELECT id FROM users WHERE role='COMPANY'");
    let i = 0;
    for (const row of rows) {
      (companyUserIds as any)[`COMP_${String(i + 1).padStart(4, "0")}`] = row.id;
      i++;
    }
  }
  if (questionIds.length === 0) {
    const rows = doltQuery("SELECT id FROM questions LIMIT 500");
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
  const fixtureId = toUUID("beyon-test-java-backend-001");
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

  // Attach questions to fixture
  const sampleCount = Math.min(28, questionIds.length);
  const allFixtureQIds = rng.pickN(questionIds, sampleCount);

  for (let i = 0; i < allFixtureQIds.length; i++) {
    const qId = allFixtureQIds[i];
    const tqId = toUUID(`beyon-tq-fixture-${i}`);
    testQStmts.push(
      `INSERT IGNORE INTO test_questions (id, test_id, question_id, display_order, marks)
       VALUES (${esc(tqId)}, ${esc(fixtureId)}, ${esc(qId)}, ${i + 1}, ${i < 20 ? 2 : 5});`
    );
  }

  // ─── Daily Challenges (365 days historical timeline) ───
  const dailyChallengeStmts: string[] = [];
  const today = new Date();

  // Seed 365 days of challenges for fixed active students, and 30 days for others
  const challengeStudents = [
    toUUID("beyon-student-strong-0001"),
    toUUID("beyon-student-placement-0001"),
    toUUID("beyon-exam-candidate-0001"),
    toUUID("beyon-student-weak-0001"),
    toUUID("beyon-student-fresh-0001"),
  ];

  for (const studentId of challengeStudents) {
    for (let d = 0; d < 365; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      const dateStr = date.toISOString().split("T")[0];
      const qId = rng.pick(questionIds);
      const id = toUUID(`beyon-daily-${studentId}-${dateStr}`);
      const isToday = d === 0;
      const isCompleted = !isToday && rng.int(1, 10) <= 8;
      const isCorrect = isCompleted ? (rng.int(1, 10) <= 8 ? 1 : 0) : 0;
      const status = isToday ? "ACTIVE" : isCompleted ? "COMPLETED" : "EXPIRED";
      const timeSpent = isCompleted ? rng.int(60, 480) : "NULL";
      const completedAtSql = isCompleted ? `DATE_SUB(NOW(), INTERVAL ${d} DAY)` : "NULL";

      dailyChallengeStmts.push(
        `INSERT INTO daily_challenges (id, student_id, challenge_date, question_id, status, started_at, completed_at, time_spent_seconds, is_correct, created_at)
         VALUES (${esc(id)}, ${esc(studentId)}, ${esc(dateStr)}, ${esc(qId)}, ${esc(status)},
                 DATE_SUB(NOW(), INTERVAL ${d} DAY), ${completedAtSql}, ${timeSpent}, ${isCorrect},
                 DATE_SUB(NOW(), INTERVAL ${d} DAY))
         ON DUPLICATE KEY UPDATE question_id=${esc(qId)}, status=${esc(status)}, is_correct=${isCorrect};`
      );
    }
  }

  // ─── Generated Company Assessments ───
  const COMP_KEYS = Object.keys(companyUserIds).slice(0, cfg.counts.assessments);
  for (let i = 0; i < COMP_KEYS.length; i++) {
    const compKey = COMP_KEYS[i];
    const cUserId = companyUserIds[compKey];
    const testId = toUUID(`beyon-test-comp-${i}`);
    testIds.push(testId);
    const diff = rng.pick(["EASY", "MEDIUM", "MEDIUM", "HARD"]);
    const qCount = rng.int(12, 30);
    const passScore = rng.int(55, 75);
    const daysAgo = rng.int(30, 360);

    testStmts.push(
      `INSERT IGNORE INTO tests (id, title, description, test_type, duration_minutes, difficulty, total_questions, passing_score, status, created_by, created_at, updated_at)
       VALUES (
         ${esc(testId)},
         ${esc(`Technical Competency Benchmark ${i + 1} — ${diff}`)},
         'Standardized proctored skill benchmark assessment for career candidate placement.',
         'COMPANY', ${rng.int(45, 120)}, ${esc(diff)}, ${qCount}, ${passScore}.00,
         'ACTIVE', ${esc(cUserId)},
         DATE_SUB(NOW(), INTERVAL ${daysAgo} DAY),
         DATE_SUB(NOW(), INTERVAL ${Math.max(0, daysAgo - 10)} DAY)
       );`
    );

    // Attach random questions
    const qSample = rng.pickN(questionIds, Math.min(qCount, questionIds.length));
    for (let qi = 0; qi < qSample.length; qi++) {
      const tqId = toUUID(`beyon-tq-comp-${i}-${qi}`);
      testQStmts.push(
        `INSERT IGNORE INTO test_questions (id, test_id, question_id, display_order, marks)
         VALUES (${esc(tqId)}, ${esc(testId)}, ${esc(qSample[qi])}, ${qi + 1}, 2);`
      );
    }
  }

  // ─── Test Attempts (1-Year Timeline) ───
  const attemptStmts: string[] = [];
  const testPool = [...testIds];
  let attemptIdx = 0;

  for (const sId of challengeStudents) {
    const attemptsCount = rng.int(8, 20);
    for (let a = 0; a < attemptsCount; a++) {
      const tId = rng.pick(testPool);
      const attemptId = toUUID(`beyon-ta-${sId}-${a}`);
      const daysAgo = rng.int(5, 350);
      const score = rng.int(55, 98);
      const totalMarks = 100;
      const accuracy = (score / totalMarks) * 100;
      const timeSpent = rng.int(1800, 5400);

      attemptStmts.push(
        `INSERT IGNORE INTO test_attempts (id, student_id, test_id, started_at, submitted_at, score, total_marks, accuracy, time_spent_seconds, status, created_at)
         VALUES (${esc(attemptId)}, ${esc(sId)}, ${esc(tId)},
                 DATE_SUB(NOW(), INTERVAL ${daysAgo} DAY),
                 DATE_ADD(DATE_SUB(NOW(), INTERVAL ${daysAgo} DAY), INTERVAL ${Math.floor(timeSpent / 60)} MINUTE),
                 ${score}.00, ${totalMarks}.00, ${accuracy.toFixed(2)}, ${timeSpent}, 'COMPLETED',
                 DATE_SUB(NOW(), INTERVAL ${daysAgo} DAY));`
      );
      attemptIdx++;
    }
  }

  // ─── Student Question Practice Attempts ───
  const qAttemptStmts: string[] = [];
  let qaIdx = 0;
  for (const sId of challengeStudents) {
    const qSample = rng.pickN(questionIds, 60);
    for (let qi = 0; qi < qSample.length; qi++) {
      const qId = qSample[qi];
      const qaId = toUUID(`beyon-sqa-${sId}-${qi}`);
      const daysAgo = rng.int(1, 350);
      const isCorrect = rng.int(1, 10) <= 8 ? 1 : 0;
      const score = isCorrect ? 100 : 0;
      const timeSpent = rng.int(45, 360);

      qAttemptStmts.push(
        `INSERT IGNORE INTO student_question_attempts (id, student_id, question_id, attempt_number, user_answer, is_correct, time_spent_seconds, score, feedback, status, created_at)
         VALUES (${esc(qaId)}, ${esc(sId)}, ${esc(qId)}, 1, 'SEEDED_SOLUTION', ${isCorrect}, ${timeSpent}, ${score}.00, 'Well reasoned solution.', 'SUBMITTED',
                 DATE_SUB(NOW(), INTERVAL ${daysAgo} DAY));`
      );
      qaIdx++;
    }
  }

  doltBatch(testStmts);
  doltBatch(testQStmts, 150);
  doltBatch(dailyChallengeStmts, 200);
  doltBatch(attemptStmts, 100);
  doltBatch(qAttemptStmts, 150);

  console.log(`  ✅ ${testIds.length} assessments/tests`);
  console.log(`  ✅ ${dailyChallengeStmts.length} daily challenges across 365 days`);
  console.log(`  ✅ ${attemptStmts.length} historical test attempts`);
  console.log(`  ✅ ${qAttemptStmts.length} student practice attempts`);
}
