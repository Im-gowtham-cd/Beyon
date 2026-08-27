// ============================================================
// Module 04 — User Seeder
// Creates all fixed test accounts + bulk generated student users
// ============================================================

import { doltBatch, doltExec, esc, doltQuery, toUUID } from "../engine/dolt.js";
import bcrypt from "bcryptjs";
import { FIXED_ACCOUNTS, INSTITUTION_ROLES, COMPANY_ROLES } from "../data/personas.js";
import { getInstitutionUserId } from "./02-institutions.js";
import { getCompanyUserId } from "./03-companies.js";
import { SeededRandom, makeName, makeLocation, makePhone, makeEmailSlug } from "../utils/faker.js";
import type { SeedConfig } from "../config.js";

// Exported user id registry
export const userIds: Record<string, string> = {}; // email -> dolt user id
export const studentUserIds: string[] = [];         // all student user ids

export async function seedUsers(cfg: SeedConfig): Promise<void> {
  console.log("\n👤 Seeding users...");

  // ─── Fixed Accounts ───
  let fixed = 0;
  for (const acc of FIXED_ACCOUNTS) {
    const uid = toUUID(acc.id);
    await seedOneUser(uid, acc.email, acc.password, acc.name, acc.role, acc.status, acc.emailVerified, cfg);
    userIds[acc.email] = uid;
    if (acc.role === "STUDENT") studentUserIds.push(uid);
    fixed++;
  }
  console.log(`  ✅ ${fixed} fixed test accounts`);

  // ─── Generated Student Accounts ───
  const rng = new SeededRandom(cfg.seed);
  const genStmts: string[] = [];
  let genCount = 0;

  for (let i = 0; i < cfg.counts.students; i++) {
    const { full } = makeName(rng);
    const emailSlug = makeEmailSlug(full.replace(/\s+/g, "").toLowerCase(), i + 1000);
    const email = `${emailSlug}@example.beyon.test`;
    const id = toUUID(`beyon-gen-student-${String(i + 1).padStart(4, "0")}`);

    userIds[email] = id;
    studentUserIds.push(id);

    genStmts.push(
      `INSERT IGNORE INTO users (id, email, password_hash, display_name, role, status, email_verified, profile_status, created_at, updated_at)
       VALUES (${esc(id)}, ${esc(email)}, 'SEEDED_NO_AUTH', ${esc(full)}, 'STUDENT', 'ACTIVE', 1, 'COMPLETED', NOW(), NOW());`
    );
    genCount++;
  }
  doltBatch(genStmts);
  console.log(`  ✅ ${genCount} generated student accounts`);
  console.log(`  📊 Total users: ${fixed + genCount}`);
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
  // Dolt
  const passwordHash = password === "SEEDED_NO_AUTH" ? "SEEDED_NO_AUTH" : bcrypt.hashSync(password, 10);
  doltExec(
    `INSERT INTO users (id, email, password_hash, display_name, role, status, email_verified, profile_status, created_at, updated_at)
     VALUES (${esc(id)}, ${esc(email)}, ${esc(passwordHash)},
             ${esc(name)}, ${esc(role)}, ${esc(status)}, ${emailVerified ? 1 : 0}, ${status === "ACTIVE" ? "'COMPLETED'" : "'INCOMPLETE'"}, NOW(), NOW())
     ON DUPLICATE KEY UPDATE password_hash = ${esc(passwordHash)}, status = ${esc(status)}, email_verified = ${emailVerified ? 1 : 0};`
  );
}
