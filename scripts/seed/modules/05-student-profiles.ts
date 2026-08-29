// ============================================================
// Module 05 — Student Profile Seeder
// Creates student_profiles, student_skills, coin_wallets
// ============================================================

import { doltBatch, doltExec, esc, escNum, toUUID } from "../engine/dolt.js";
import { FIXED_ACCOUNTS } from "../data/personas.js";
import { INSTITUTIONS } from "../data/institutions.js";
import { SKILLS } from "../data/skills.js";
import { skillIds } from "./01-skills.js";
import { institutionUserIds } from "./02-institutions.js";
import { studentUserIds } from "./04-users.js";
import {
  SeededRandom,
  makeName,
  makeLocation,
  makePhone,
  makeStudentAcademics,
  makeCoins,
} from "../utils/faker.js";
import type { SeedConfig } from "../config.js";

const PERSONA_TYPES = ["A", "A", "B", "B", "C", "D"] as const;
const SKILL_KEYS = ["SKILL_JAVA", "SKILL_PYTHON", "SKILL_JS", "SKILL_SQL", "SKILL_DSA", "SKILL_REACT", "SKILL_SPRING", "SKILL_NODE", "SKILL_CPP", "SKILL_C"];
const PROFICIENCY = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

export async function seedStudentProfiles(cfg: SeedConfig): Promise<void> {
  console.log("\n🎓 Seeding student profiles...");

  const rng = new SeededRandom(cfg.seed + 1000);
  const profileStmts: string[] = [];
  const skillStmts: string[] = [];
  const walletStmts: string[] = [];
  const projectStmts: string[] = [];
  const certStmts: string[] = [];
  const achieveStmts: string[] = [];
  const streakStmts: string[] = [];
  const practiceStatsStmts: string[] = [];

  const instKeys = Object.keys(institutionUserIds);

  // ─── Fixed Accounts student profiles ───
  for (const acc of FIXED_ACCOUNTS) {
    if (acc.role !== "STUDENT") continue;
    const uid = toUUID(acc.id);
    const ex = acc.extraData ?? {};
    const instUserId = acc.institutionKey ? institutionUserIds[acc.institutionKey] : null;
    const coins = ex.coins ?? 200;

    profileStmts.push(buildStudentProfileSql(
      uid, acc.name,
      ex.cgpa, ex.department, ex.graduation_year,
      ex.placement_preference,
      instUserId
    ));
    walletStmts.push(buildWalletSql(uid, coins));
    skillStmts.push(...buildSkillsSql(uid, rng, acc.persona ?? "B"));
  }

  // ─── Generated students ───
  let genIndex = 0;
  for (const userId of studentUserIds) {
    if (!FIXED_ACCOUNTS.some(a => toUUID(a.id) === userId)) {
      const personaType = PERSONA_TYPES[rng.int(0, PERSONA_TYPES.length - 1)];
      const { first, last } = makeName(rng);
      const loc = makeLocation(rng);
      const acad = makeStudentAcademics(rng, personaType);
      const coins = makeCoins(rng, personaType);

      // Pick a random institution
      const instKey = rng.pick(instKeys);
      const instUserId = institutionUserIds[instKey] ?? null;

      profileStmts.push(buildStudentProfileSql(
        userId, `${first} ${last}`,
        acad.cgpa, acad.department, acad.graduationYear,
        acad.placementPreference, instUserId
      ));
      walletStmts.push(buildWalletSql(userId, coins));
      skillStmts.push(...buildSkillsSql(userId, rng, personaType));
      genIndex++;
    }
  }

  for (const userId of studentUserIds) {
    projectStmts.push(...buildProjectsSql(userId, rng));
    certStmts.push(...buildCertsSql(userId, rng));
    achieveStmts.push(...buildAchievementsSql(userId, rng));

    // Streaks
    const currentStreak = rng.int(2, 60);
    const longestStreak = Math.max(currentStreak, rng.int(15, 280));
    const streakId = toUUID(`beyon-streak-${userId}`);
    streakStmts.push(
      `INSERT IGNORE INTO student_streaks (id, student_id, current_streak, longest_streak, last_activity_date, created_at, updated_at)
       VALUES (${esc(streakId)}, ${esc(userId)}, ${currentStreak}, ${longestStreak}, CURDATE(), DATE_SUB(NOW(), INTERVAL ${rng.int(30, 360)} DAY), NOW());`
    );

    // Practice stats
    const attempted = rng.int(25, 280);
    const solved = Math.floor(attempted * (rng.int(70, 96) / 100));
    const timeSpent = attempted * rng.int(60, 300);
    const statId = toUUID(`beyon-pstat-${userId}`);
    practiceStatsStmts.push(
      `INSERT IGNORE INTO student_practice_stats
        (id, student_id, total_attempted, total_solved, easy_solved, medium_solved, hard_solved,
         current_streak, longest_streak, last_practice_date, total_time_seconds, updated_at)
       VALUES (${esc(statId)}, ${esc(userId)}, ${attempted}, ${solved},
               ${Math.floor(solved * 0.5)}, ${Math.floor(solved * 0.35)}, ${Math.floor(solved * 0.15)},
               ${currentStreak}, ${longestStreak}, CURDATE(), ${timeSpent}, NOW());`
    );
  }

  doltBatch(profileStmts, 100);
  doltBatch(walletStmts, 200);
  doltBatch(skillStmts, 200);
  doltBatch(projectStmts, 200);
  doltBatch(certStmts, 200);
  doltBatch(achieveStmts, 200);
  doltBatch(streakStmts, 200);
  doltBatch(practiceStatsStmts, 200);

  console.log(`  ✅ ${profileStmts.length} student profiles`);
  console.log(`  ✅ ${walletStmts.length} coin wallets`);
  console.log(`  ✅ ${skillStmts.length} student skill records`);
  console.log(`  ✅ ${projectStmts.length} student projects`);
  console.log(`  ✅ ${certStmts.length} student certifications`);
  console.log(`  ✅ ${achieveStmts.length} student achievements`);
  console.log(`  ✅ ${streakStmts.length} student streaks`);
  console.log(`  ✅ ${practiceStatsStmts.length} practice stats records`);
}

function buildStudentProfileSql(
  userId: string,
  name: string,
  cgpa: number | null,
  department: string | null,
  graduationYear: number | null,
  placementPreference: string | null,
  institutionUserId: string | null
): string {
  const profId = toUUID(`beyon-sp-${userId}`);
  const completion = cgpa && department && graduationYear ? 85 : 20;
  // institution column stores text name (from the schema: varchar(200))
  const instName = institutionUserId ? `Beyon Test Institution` : null;
  return `INSERT IGNORE INTO student_profiles
    (id, user_id, institution, degree, department, graduation_year, cgpa, placement_preference,
     preferred_work_type, completion_pct, created_at, updated_at)
   VALUES (
     ${esc(profId)}, ${esc(userId)},
     ${esc(instName)},
     'B.Tech', ${esc(department)}, ${escNum(graduationYear)},
     ${escNum(cgpa)}, ${esc(placementPreference)},
     'HYBRID', ${escNum(completion)}, NOW(), NOW()
   );`;
}

function buildWalletSql(studentId: string, balance: number): string {
  const id = toUUID(`beyon-wallet-${studentId}`);
  return `INSERT IGNORE INTO coin_wallets (id, student_id, balance, total_earned, total_spent, created_at, updated_at)
   VALUES (${esc(id)}, ${esc(studentId)}, ${escNum(balance)}, ${escNum(balance)}, 0, NOW(), NOW());`;
}

function buildSkillsSql(studentId: string, rng: SeededRandom, persona: string): string[] {
  const count = { A: 6, B: 4, C: 2, D: 5 }[persona] ?? 3;
  const SKILL_NAMES: Record<string, string> = {
    SKILL_JAVA: "Java", SKILL_PYTHON: "Python", SKILL_JS: "JavaScript",
    SKILL_SQL: "SQL", SKILL_DSA: "DSA", SKILL_REACT: "React",
    SKILL_SPRING: "Spring Boot", SKILL_NODE: "Node.js", SKILL_CPP: "C++", SKILL_C: "C",
  };
  const chosenKeys = rng.pickN(Object.keys(SKILL_NAMES), count);
  return chosenKeys.map((key, i) => {
    const skillName = SKILL_NAMES[key];
    const proficiency = rng.pick(PROFICIENCY);
    const id = toUUID(`beyon-ss-${studentId}-${i}`);
    return `INSERT IGNORE INTO student_skills (id, user_id, skill_name, category, proficiency, source, verified, created_at, updated_at)
     VALUES (${esc(id)}, ${esc(studentId)}, ${esc(skillName)}, 'PROGRAMMING', ${esc(proficiency)}, 'SELF_REPORTED', 0, NOW(), NOW());`;
  });
}

function buildProjectsSql(studentId: string, rng: SeededRandom): string[] {
  const sampleProjects = [
    { name: "Distributed Cache Engine", desc: "High-throughput in-memory key-value store built in Java with LRU eviction and replication.", role: "Lead Developer", tech: "Java, Netty, Redis, Docker" },
    { name: "AI Code Analysis Tool", desc: "Automated static analysis and code review assistant leveraging LLM fine-tuning.", role: "Full Stack Engineer", tech: "Python, FastAPI, React, TypeScript" },
    { name: "Decentralized Auth Gateway", desc: "Zero-trust identity verification service with JWT and hardware tokens.", role: "Backend Developer", tech: "Spring Boot, PostgreSQL, Docker" },
  ];
  return sampleProjects.map((p, idx) => {
    const id = toUUID(`beyon-proj-${studentId}-${idx}`);
    return `INSERT IGNORE INTO student_projects (id, user_id, name, description, role, technologies, github_url, live_url, is_featured, created_at, updated_at)
      VALUES (${esc(id)}, ${esc(studentId)}, ${esc(p.name)}, ${esc(p.desc)}, ${esc(p.role)}, ${esc(p.tech)}, 'https://github.com/example/project', 'https://project.example.dev', ${idx === 0 ? 1 : 0}, NOW(), NOW());`;
  });
}

function buildCertsSql(studentId: string, rng: SeededRandom): string[] {
  const sampleCerts = [
    { name: "AWS Certified Developer - Associate", org: "Amazon Web Services", cid: "AWS-DEV-982314" },
    { name: "Oracle Certified Professional: Java SE 17 Developer", org: "Oracle", cid: "OCP-JAVA-54819" },
  ];
  return sampleCerts.map((c, idx) => {
    const id = toUUID(`beyon-cert-${studentId}-${idx}`);
    return `INSERT IGNORE INTO student_certifications (id, user_id, name, issuing_org, issue_date, credential_id, credential_url, status, created_at, updated_at)
      VALUES (${esc(id)}, ${esc(studentId)}, ${esc(c.name)}, ${esc(c.org)}, '2025-06-15', ${esc(c.cid)}, 'https://aws.amazon.com/verification', 'VERIFIED', NOW(), NOW());`;
  });
}

function buildAchievementsSql(studentId: string, rng: SeededRandom): string[] {
  const sampleAchievements = [
    { title: "Smart India Hackathon Finalist", desc: "Top 5 nationwide in AI/ML category for automated assessment systems.", cat: "HACKATHON", org: "Ministry of Education" },
    { title: "Dean's Honor List", desc: "Maintained top 5% academic performance throughout all semesters.", cat: "ACADEMIC", org: "University Academic Council" },
  ];
  return sampleAchievements.map((a, idx) => {
    const id = toUUID(`beyon-ach-${studentId}-${idx}`);
    return `INSERT IGNORE INTO student_achievements (id, user_id, title, description, category, organization, achievement_date, created_at, updated_at)
      VALUES (${esc(id)}, ${esc(studentId)}, ${esc(a.title)}, ${esc(a.desc)}, ${esc(a.cat)}, ${esc(a.org)}, '2025-11-20', NOW(), NOW());`;
  });
}
