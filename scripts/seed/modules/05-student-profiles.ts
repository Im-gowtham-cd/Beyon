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
  const streakStmts: string[] = [];

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

  doltBatch(profileStmts, 100);
  doltBatch(walletStmts, 200);
  doltBatch(skillStmts, 200);

  console.log(`  ✅ ${profileStmts.length} student profiles`);
  console.log(`  ✅ ${walletStmts.length} coin wallets`);
  console.log(`  ✅ ${skillStmts.length} student skill records`);
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
