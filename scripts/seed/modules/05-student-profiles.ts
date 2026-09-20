import { doltBatch, doltExec, esc, escNum, toUUID } from "../engine/dolt.js";
import { FIXED_ACCOUNTS } from "../data/personas.js";
import { institutionUserIds } from "./02-institutions.js";
import { studentUserIds, generatedStudentMetaList } from "./04-users.js";
import { SeededRandom } from "../utils/faker.js";
import type { SeedConfig } from "../config.js";

interface PersonaSkillConfig {
  skillName: string;
  category: string;
  score: number; // 0-100
  proficiency: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  verified: boolean;
}

const PERSONA_SKILL_MAP: Record<string, PersonaSkillConfig[]> = {
  A: [
    { skillName: "Java", category: "Languages", score: 92, proficiency: "EXPERT", verified: true },
    { skillName: "DSA", category: "Data Structures & Algorithms", score: 90, proficiency: "EXPERT", verified: true },
    { skillName: "SQL", category: "Database", score: 85, proficiency: "ADVANCED", verified: true },
    { skillName: "Spring Boot", category: "Backend", score: 84, proficiency: "ADVANCED", verified: true },
    { skillName: "React", category: "Frontend", score: 78, proficiency: "ADVANCED", verified: true },
    { skillName: "PostgreSQL", category: "Database", score: 82, proficiency: "ADVANCED", verified: true },
    { skillName: "Docker", category: "DevOps", score: 75, proficiency: "INTERMEDIATE", verified: true },
  ],
  B: [
    { skillName: "JavaScript", category: "Languages", score: 94, proficiency: "EXPERT", verified: true },
    { skillName: "React", category: "Frontend", score: 92, proficiency: "EXPERT", verified: true },
    { skillName: "HTML", category: "Frontend", score: 90, proficiency: "EXPERT", verified: true },
    { skillName: "CSS", category: "Frontend", score: 88, proficiency: "ADVANCED", verified: true },
    { skillName: "TypeScript", category: "Languages", score: 82, proficiency: "ADVANCED", verified: true },
    { skillName: "SQL", category: "Database", score: 55, proficiency: "INTERMEDIATE", verified: true },
    { skillName: "DSA", category: "Data Structures & Algorithms", score: 48, proficiency: "BEGINNER", verified: true },
  ],
  C: [
    { skillName: "Java", category: "Languages", score: 90, proficiency: "EXPERT", verified: true },
    { skillName: "Spring Boot", category: "Backend", score: 85, proficiency: "ADVANCED", verified: true },
    { skillName: "SQL", category: "Database", score: 82, proficiency: "ADVANCED", verified: true },
    { skillName: "PostgreSQL", category: "Database", score: 80, proficiency: "ADVANCED", verified: true },
    { skillName: "DSA", category: "Data Structures & Algorithms", score: 74, proficiency: "ADVANCED", verified: true },
    { skillName: "React", category: "Frontend", score: 45, proficiency: "BEGINNER", verified: true },
  ],
  D: [
    { skillName: "Java", category: "Languages", score: 38, proficiency: "BEGINNER", verified: true },
    { skillName: "DSA", category: "Data Structures & Algorithms", score: 25, proficiency: "BEGINNER", verified: false },
    { skillName: "SQL", category: "Database", score: 35, proficiency: "BEGINNER", verified: true },
    { skillName: "HTML", category: "Frontend", score: 50, proficiency: "INTERMEDIATE", verified: true },
    { skillName: "CSS", category: "Frontend", score: 45, proficiency: "BEGINNER", verified: true },
  ],
  E: [
    { skillName: "Python", category: "Languages", score: 95, proficiency: "EXPERT", verified: true },
    { skillName: "Machine Learning", category: "AI / Machine Learning", score: 88, proficiency: "ADVANCED", verified: true },
    { skillName: "Deep Learning", category: "AI / Machine Learning", score: 82, proficiency: "ADVANCED", verified: true },
    { skillName: "SQL", category: "Database", score: 75, proficiency: "INTERMEDIATE", verified: true },
    { skillName: "Data Structures & Algorithms", category: "DSA", score: 72, proficiency: "INTERMEDIATE", verified: true },
  ],
  F: [
    { skillName: "C", category: "Languages", score: 82, proficiency: "ADVANCED", verified: true },
    { skillName: "C++", category: "Languages", score: 80, proficiency: "ADVANCED", verified: true },
    { skillName: "Python", category: "Languages", score: 75, proficiency: "INTERMEDIATE", verified: true },
    { skillName: "SQL", category: "Database", score: 68, proficiency: "INTERMEDIATE", verified: true },
    { skillName: "MATLAB", category: "Engineering", score: 85, proficiency: "ADVANCED", verified: true },
  ],
};

export async function seedStudentProfiles(cfg: SeedConfig): Promise<void> {
  console.log("\n🎓 Seeding student profiles, skills, wallets & KEC institutional roster...");

  const rng = new SeededRandom(cfg.seed + 1000);
  const profileStmts: string[] = [];
  const skillStmts: string[] = [];
  const walletStmts: string[] = [];
  const instStudentStmts: string[] = [];
  const projectStmts: string[] = [];
  const streakStmts: string[] = [];
  const practiceStatsStmts: string[] = [];

  const kecInstUserId = institutionUserIds["INST_KEC"] || toUUID("beyon-inst-user-inst_kec");

  // 1. Seed Fixed Demo Students (e.g. Gowtham C D - Roll 23CSR068)
  const gowthamId = toUUID("gowtham-student-0001");
  profileStmts.push(
    `INSERT INTO student_profiles
      (id, user_id, first_name, last_name, registration_number, aicte_code, institution,
       department, degree, academic_year, graduation_year, cgpa, phone, gender,
       preferred_job_roles, preferred_industries, preferred_locations,
       verification_status, completion_pct, has_completed_assessment,
       created_at, updated_at)
     VALUES (
      ${esc(gowthamId)}, ${esc(gowthamId)}, 'Gowtham', 'C D', '23CSR068', '1-4251711', 'Kongu Engineering College',
      'CSE', 'B.E', '4th Year', 2027, 8.85, '9003538951', 'MALE',
      'Full-Stack Software Engineer,Cloud Architect', 'Software,FinTech,AI', 'Bangalore,Chennai,Coimbatore',
      'VERIFIED', 100, 1, NOW(), NOW()
     )
     ON DUPLICATE KEY UPDATE registration_number='23CSR068', cgpa=8.85, verification_status='VERIFIED';`
  );

  walletStmts.push(
    `INSERT INTO coin_wallets (id, student_id, balance, total_earned, total_spent, created_at, updated_at)
     VALUES (${esc(toUUID("wallet-gowtham"))}, ${esc(gowthamId)}, 2450, 2950, 500, NOW(), NOW())
     ON DUPLICATE KEY UPDATE balance=2450, total_earned=2950, total_spent=500;`
  );

  instStudentStmts.push(
    `INSERT INTO institution_students
      (id, institution_id, student_id, department, batch, admission_year, graduation_year, placement_status, verified, created_at, updated_at)
     VALUES (
      ${esc(toUUID("inst-student-gowtham"))}, ${esc(kecInstUserId)}, ${esc(gowthamId)}, 'CSE', '2023-2027', 2023, 2027, 'PLACEMENT_SEEKING', 1, NOW(), NOW()
     )
     ON DUPLICATE KEY UPDATE placement_status='PLACEMENT_SEEKING', verified=1;`
  );

  // Seed Gowtham's full 9 core skills
  const gowthamSkills = [
    { name: "HTML", cat: "Technical", score: 80, prof: "INTERMEDIATE" },
    { name: "JavaScript", cat: "Technical", score: 82, prof: "INTERMEDIATE" },
    { name: "Java", cat: "Languages", score: 65, prof: "INTERMEDIATE" },
    { name: "CSS", cat: "Technical", score: 85, prof: "INTERMEDIATE" },
    { name: "PostgreSQL", cat: "Database", score: 78, prof: "INTERMEDIATE" },
    { name: "Python", cat: "Languages", score: 65, prof: "INTERMEDIATE" },
    { name: "React", cat: "Frontend", score: 70, prof: "INTERMEDIATE" },
    { name: "Spring Boot", cat: "Backend", score: 40, prof: "INTERMEDIATE" },
    { name: "TypeScript", cat: "Languages", score: 10, prof: "BEGINNER" },
  ];
  for (const sk of gowthamSkills) {
    const sId = toUUID(`skill-gowtham-${sk.name.toLowerCase()}`);
    skillStmts.push(
      `INSERT INTO student_skills (id, user_id, skill_name, category, proficiency, verified, source, created_at, updated_at)
       VALUES (${esc(sId)}, ${esc(gowthamId)}, ${esc(sk.name)}, ${esc(sk.cat)}, ${esc(sk.prof)}, 1, 'ASSESSMENT_VERIFIED', NOW(), NOW())
       ON DUPLICATE KEY UPDATE proficiency=${esc(sk.prof)}, verified=1;`
    );
  }

  // 2. Seed all 400+ Generated KEC Students
  for (const meta of generatedStudentMetaList) {
    const userId = meta.userId;
    const nameParts = meta.name.split(" ");
    const fName = nameParts[0] || "Student";
    const lName = nameParts.slice(1).join(" ") || "Demo";
    const cgpa = Number((6.8 + (rng.int(0, 30) / 10)).toFixed(2));
    const coins = meta.persona === "A" ? 2200 : meta.persona === "B" ? 1800 : meta.persona === "C" ? 1500 : meta.persona === "E" ? 1900 : 600;

    profileStmts.push(
      `INSERT INTO student_profiles
        (id, user_id, first_name, last_name, registration_number, aicte_code, institution,
         department, degree, academic_year, graduation_year, cgpa, gender,
         preferred_job_roles, preferred_industries, preferred_locations,
         verification_status, completion_pct, has_completed_assessment,
         created_at, updated_at)
       VALUES (
        ${esc(userId)}, ${esc(userId)}, ${esc(fName)}, ${esc(lName)}, ${esc(meta.rollNo)}, '1-4251711', 'Kongu Engineering College',
        ${esc(meta.deptCode)}, 'B.E', ${esc(meta.academicYear)}, 2027, ${cgpa}, 'MALE',
        'Software Engineer,Full-Stack Developer,Data Engineer', 'Information Technology,Software', 'Bangalore,Chennai,Coimbatore',
        'VERIFIED', 100, 1, NOW(), NOW()
       )
       ON DUPLICATE KEY UPDATE registration_number=${esc(meta.rollNo)}, cgpa=${cgpa};`
    );

    walletStmts.push(
      `INSERT INTO coin_wallets (id, student_id, balance, total_earned, total_spent, created_at, updated_at)
       VALUES (${esc(toUUID(`wallet-${userId}`))}, ${esc(userId)}, ${coins}, ${coins + 300}, 300, NOW(), NOW())
       ON DUPLICATE KEY UPDATE balance=${coins}, total_earned=${coins + 300}, total_spent=300;`
    );

    instStudentStmts.push(
      `INSERT INTO institution_students
        (id, institution_id, student_id, department, batch, admission_year, graduation_year, placement_status, verified, created_at, updated_at)
       VALUES (
        ${esc(toUUID(`inst-student-${userId}`))}, ${esc(kecInstUserId)}, ${esc(userId)}, ${esc(meta.deptCode)},
        '2023-2027', 2023, 2027, 'PLACEMENT_SEEKING', 1, NOW(), NOW()
       )
       ON DUPLICATE KEY UPDATE placement_status='PLACEMENT_SEEKING', verified=1;`
    );

    // Seed persona skills
    const personaSkills = PERSONA_SKILL_MAP[meta.persona] || PERSONA_SKILL_MAP["A"];
    for (const psk of personaSkills) {
      const sId = toUUID(`skill-${userId}-${psk.skillName.toLowerCase()}`);
      skillStmts.push(
        `INSERT INTO student_skills (id, user_id, skill_name, category, proficiency, verified, source, created_at, updated_at)
         VALUES (${esc(sId)}, ${esc(userId)}, ${esc(psk.skillName)}, ${esc(psk.category)}, ${esc(psk.proficiency)}, ${psk.verified ? 1 : 0}, 'ASSESSMENT_VERIFIED', NOW(), NOW())
         ON DUPLICATE KEY UPDATE proficiency=${esc(psk.proficiency)}, verified=${psk.verified ? 1 : 0};`
      );
    }

    // Projects & Practice Stats
    const pId = toUUID(`proj-${userId}-1`);
    projectStmts.push(
      `INSERT IGNORE INTO student_projects (id, user_id, name, role, description, technologies, github_url, created_at)
       VALUES (${esc(pId)}, ${esc(userId)}, 'Enterprise Microservice Platform', 'Lead Developer',
               'Distributed cloud application built with Spring Boot, PostgreSQL and Docker', 'Spring Boot, PostgreSQL, Docker, Redis', 'https://github.com/demo/project', NOW());`
    );

    const statId = toUUID(`pstat-${userId}`);
    const attempted = rng.int(40, 200);
    const solved = Math.floor(attempted * 0.85);
    practiceStatsStmts.push(
      `INSERT INTO student_practice_stats
        (id, student_id, total_attempted, total_solved, easy_solved, medium_solved, hard_solved, current_streak, longest_streak, last_practice_date, total_time_seconds, updated_at)
       VALUES (${esc(statId)}, ${esc(userId)}, ${attempted}, ${solved}, ${Math.floor(solved * 0.5)}, ${Math.floor(solved * 0.35)}, ${Math.floor(solved * 0.15)},
               ${rng.int(3, 25)}, ${rng.int(25, 120)}, CURDATE(), ${attempted * 180}, NOW())
       ON DUPLICATE KEY UPDATE total_attempted=${attempted}, total_solved=${solved};`
    );
  }

  doltBatch(profileStmts);
  doltBatch(walletStmts);
  doltBatch(instStudentStmts);
  doltBatch(skillStmts);
  doltBatch(projectStmts);
  doltBatch(practiceStatsStmts);

  console.log(`  ✅ ${profileStmts.length} student profiles and wallets seeded`);
  console.log(`  ✅ ${skillStmts.length} verified candidate skills seeded across 6 personas`);
  console.log(`  ✅ ${instStudentStmts.length} student records linked to KEC institutional roster`);
}




