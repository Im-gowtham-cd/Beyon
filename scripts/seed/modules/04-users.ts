import { doltBatch, doltExec, esc, toUUID } from "../engine/dolt.js";
import bcrypt from "bcryptjs";
import { FIXED_ACCOUNTS } from "../data/personas.js";
import { KEC_DEPARTMENTS } from "../data/institutions.js";
import { SeededRandom, makeName, makeEmailSlug } from "../utils/faker.js";
import type { SeedConfig } from "../config.js";

export const userIds: Record<string, string> = {};
export const studentUserIds: string[] = [];
export const facultyUserIds: string[] = [];

export interface SeedStudentMeta {
  userId: string;
  name: string;
  email: string;
  rollNo: string;
  deptCode: string;
  academicYear: string;
  persona: "A" | "B" | "C" | "D" | "E" | "F";
}

export const generatedStudentMetaList: SeedStudentMeta[] = [];

export async function seedUsers(cfg: SeedConfig): Promise<void> {
  console.log("\n👤 Seeding users (Admins, Faculty & KEC Students)...");

  // 1. Fixed Accounts
  let fixed = 0;
  for (const acc of FIXED_ACCOUNTS) {
    const uid = toUUID(acc.id);
    await seedOneUser(uid, acc.email, acc.password, acc.name, acc.role, acc.status, acc.emailVerified, cfg);
    userIds[acc.email] = uid;
    if (acc.role === "STUDENT") studentUserIds.push(uid);
    fixed++;
  }
  console.log(`  ✅ ${fixed} fixed test accounts`);

  const rng = new SeededRandom(cfg.seed);
  const genStmts: string[] = [];

  // 2. Seed Faculty Users across all 14 KEC Departments (35+ Faculty)
  let facultyCount = 0;
  for (const dept of KEC_DEPARTMENTS) {
    const facultyPerDept = dept.code === "CSE" || dept.code === "ECE" ? 4 : 2;
    for (let f = 1; f <= facultyPerDept; f++) {
      const { full } = makeName(rng);
      const isHod = f === 1;
      const facultyName = isHod ? dept.hodName : `Dr. ${full}`;
      const emailSlug = `${dept.code.toLowerCase()}.fac${f}`;
      const email = `${emailSlug}@faculty.kec-demo.local`;
      const id = toUUID(`beyon-faculty-${dept.code.toLowerCase()}-${f}`);

      userIds[email] = id;
      facultyUserIds.push(id);

      genStmts.push(
        `INSERT IGNORE INTO users (id, email, password_hash, display_name, role, status, email_verified, profile_status, created_at, updated_at)
         VALUES (${esc(id)}, ${esc(email)}, 'SEEDED_NO_AUTH', ${esc(facultyName)}, 'FACULTY', 'ACTIVE', 1, 'COMPLETED',
                 DATE_SUB(NOW(), INTERVAL 365 DAY), NOW());`
      );
      facultyCount++;
    }
  }

  // 3. Seed Synthetic Students partitioned across all 14 Departments
  const personas: ("A" | "B" | "C" | "D" | "E" | "F")[] = ["A", "B", "C", "D", "E", "F"];
  let studentCount = 0;

  for (const dept of KEC_DEPARTMENTS) {
    const count = dept.targetStudents;
    for (let s = 1; s <= count; s++) {
      const { full } = makeName(rng);
      const rollNum = String(s).padStart(3, "0");
      const rollNo = `23${dept.code}${rollNum}`;
      const email = `demo.${dept.code.toLowerCase()}${rollNum}@students.kec-demo.local`;
      const id = toUUID(`beyon-student-kec-${dept.code.toLowerCase()}-${s}`);
      const persona = personas[(s - 1) % personas.length];

      userIds[email] = id;
      studentUserIds.push(id);

      generatedStudentMetaList.push({
        userId: id,
        name: full,
        email,
        rollNo,
        deptCode: dept.code,
        academicYear: "4th Year",
        persona,
      });

      const daysAgo = rng.int(10, 360);
      genStmts.push(
        `INSERT IGNORE INTO users (id, email, password_hash, display_name, role, status, email_verified, profile_status, created_at, updated_at)
         VALUES (${esc(id)}, ${esc(email)}, 'SEEDED_NO_AUTH', ${esc(full)}, 'STUDENT', 'ACTIVE', 1, 'COMPLETED',
                 DATE_SUB(NOW(), INTERVAL ${daysAgo} DAY), NOW());`
      );
      studentCount++;
    }
  }

  doltBatch(genStmts);
  console.log(`  ✅ ${facultyCount} faculty accounts across 14 departments`);
  console.log(`  ✅ ${studentCount} KEC student accounts across 14 departments`);
  console.log(`  📊 Total users seeded: ${fixed + facultyCount + studentCount}`);
}

async function seedOneUser(
  id: string,
  email: string,
  password: string,
  name: string,
  role: string,
  status: string,
  emailVerified: boolean,
  cfg: SeedConfig
): Promise<void> {
  const passwordHash = password === "SEEDED_NO_AUTH" ? "SEEDED_NO_AUTH" : bcrypt.hashSync(password, 10);
  doltExec(
    `INSERT INTO users (id, email, password_hash, display_name, role, status, email_verified, profile_status, created_at, updated_at)
     VALUES (${esc(id)}, ${esc(email)}, ${esc(passwordHash)},
             ${esc(name)}, ${esc(role)}, ${esc(status)}, ${emailVerified ? 1 : 0}, ${status === "ACTIVE" ? "'COMPLETED'" : "'INCOMPLETE'"},
             DATE_SUB(NOW(), INTERVAL 365 DAY), NOW())
     ON DUPLICATE KEY UPDATE password_hash = ${esc(passwordHash)}, status = ${esc(status)}, email_verified = ${emailVerified ? 1 : 0};`
  );
}


