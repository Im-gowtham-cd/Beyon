import { doltBatch, doltQuery, esc, escNum, toUUID } from "../engine/dolt.js";
import { studentUserIds } from "./04-users.js";
import { questionIds } from "./06-questions.js";
import { SeededRandom } from "../utils/faker.js";
import type { SeedConfig } from "../config.js";

async function ensureRefs(): Promise<void> {
  if (studentUserIds.length === 0) {
    const srows = doltQuery("SELECT id FROM users WHERE role='STUDENT'");
    for (const r of srows) studentUserIds.push(r.id);
  }
  if (questionIds.length === 0) {
    const qrows = doltQuery("SELECT id FROM questions LIMIT 500");
    for (const r of qrows) questionIds.push(r.id);
  }
}

export async function seedChallengesContestsPractice(cfg: SeedConfig): Promise<void> {
  console.log("\n⚡ Seeding daily challenges, revised challenges & weekly contests...");

  await ensureRefs();

  const rng = new SeededRandom(cfg.seed + 5000);
  const challengeStmts: string[] = [];
  const testStmts: string[] = [];
  const attemptStmts: string[] = [];

  const targetStudents = studentUserIds.slice(0, 80);
  const today = new Date();

  // 1. 30 Days of Daily Challenges
  const sampleTopics = [
    { title: "Java HashMap Collision Resolution", topic: "Collections", difficulty: "MEDIUM", xp: 50 },
    { title: "SQL Window Function Dense Rank", topic: "Window Functions", difficulty: "HARD", xp: 60 },
    { title: "React useEffect Cleanup Mechanism", topic: "Hooks", difficulty: "MEDIUM", xp: 45 },
    { title: "Spring Boot Transaction Isolation", topic: "JPA", difficulty: "HARD", xp: 55 },
    { title: "DSA Sliding Window Maximum", topic: "Arrays", difficulty: "HARD", xp: 75 },
    { title: "Python Context Manager Generators", topic: "Decorators", difficulty: "MEDIUM", xp: 50 },
  ];

  for (let d = 0; d < 30; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dateStr = date.toISOString().split("T")[0];
    const item = sampleTopics[d % sampleTopics.length];
    const qId = questionIds.length > 0 ? rng.pick(questionIds) : toUUID(`mock-q-${d}`);

    for (const studentId of targetStudents.slice(0, 30)) {
      const cId = toUUID(`beyon-challenge-${studentId}-${dateStr}`);
      const isCompleted = rng.int(1, 10) <= 8;
      const isCorrect = isCompleted ? (rng.int(1, 10) <= 8 ? 1 : 0) : 0;
      const status = d === 0 ? "ACTIVE" : isCompleted ? "COMPLETED" : "EXPIRED";
      const timeSpent = isCompleted ? rng.int(60, 360) : "NULL";
      const completedAtSql = isCompleted ? `DATE_SUB(NOW(), INTERVAL ${d} DAY)` : "NULL";

      challengeStmts.push(
        `INSERT INTO daily_challenges
          (id, student_id, challenge_date, question_id, status, started_at, completed_at, time_spent_seconds, is_correct, challenge_type, topic, difficulty, xp_reward, created_at)
         VALUES (
          ${esc(cId)}, ${esc(studentId)}, ${esc(dateStr)}, ${esc(qId)}, ${esc(status)},
          DATE_SUB(NOW(), INTERVAL ${d} DAY),
          ${completedAtSql},
          ${timeSpent}, ${isCorrect},
          'DAILY_PRACTICE', ${esc(item.topic)}, ${esc(item.difficulty)}, ${item.xp},
          DATE_SUB(NOW(), INTERVAL ${d} DAY)
         )
         ON DUPLICATE KEY UPDATE question_id=${esc(qId)}, status=${esc(status)}, is_correct=${isCorrect};`
      );
    }
  }

  // 2. 10 Weekly Contests & Attempts
  for (let w = 1; w <= 10; w++) {
    const contestId = toUUID(`beyon-weekly-test-${w}`);
    const contestDaysAgo = w * 7;
    const title = `KEC Grand Weekly Coding Challenge #${w}`;
    const desc = "Weekly institutional programming & algorithmic architecture showdown across all KEC departments.";

    testStmts.push(
      `INSERT INTO weekly_tests
        (id, title, description, week_number, year, duration_minutes, total_questions, passing_score, coin_reward, xp_reward, status, created_at)
       VALUES (
        ${esc(contestId)}, ${esc(title)}, ${esc(desc)},
        ${w}, 2026, 90, 4, 70, 100, 250, 'PUBLISHED',
        DATE_SUB(NOW(), INTERVAL ${contestDaysAgo} DAY)
       )
       ON DUPLICATE KEY UPDATE title=${esc(title)};`
    );

    // Seed test attempts / leaderboard rankings for top students
    for (let rank = 1; rank <= Math.min(30, targetStudents.length); rank++) {
      const sId = targetStudents[rank - 1];
      const attemptId = toUUID(`beyon-wt-attempt-${w}-${sId}`);
      const score = Math.max(40, 100 - (rank * 2) + rng.int(-3, 3));
      const correct = Math.floor((score / 100) * 4);
      const timeSpent = 2400 + (rank * 120);
      const percentile = Number(Math.max(10, 100 - (rank * 3.2)).toFixed(2));

      attemptStmts.push(
        `INSERT INTO weekly_test_attempts
          (id, student_id, weekly_test_id, score, total_questions, correct_answers, time_taken_seconds, percentile, xp_earned, coins_earned, status, started_at, completed_at)
         VALUES (
          ${esc(attemptId)}, ${esc(sId)}, ${esc(contestId)},
          ${score}, 4, ${correct}, ${timeSpent}, ${percentile},
          ${score > 70 ? 250 : 100}, ${score > 70 ? 100 : 25}, 'COMPLETED',
          DATE_SUB(NOW(), INTERVAL ${contestDaysAgo} DAY),
          DATE_ADD(DATE_SUB(NOW(), INTERVAL ${contestDaysAgo} DAY), INTERVAL 75 MINUTE)
         )
         ON DUPLICATE KEY UPDATE score=${score}, percentile=${percentile};`
      );
    }
  }

  doltBatch(challengeStmts);
  doltBatch(testStmts);
  doltBatch(attemptStmts);

  console.log(`  ✅ ${challengeStmts.length} daily challenges across 30 days seeded`);
  console.log(`  ✅ ${testStmts.length} weekly tests and ${attemptStmts.length} student attempts seeded`);
}
