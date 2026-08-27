// ============================================================
// Module 02 — Institution Seeder
// ============================================================

import { doltBatch, esc, escNum, toUUID } from "../engine/dolt.js";
import { INSTITUTIONS, DEPARTMENTS_PER_INSTITUTION } from "../data/institutions.js";

// key -> dolt user id for the institution admin user
export const institutionUserIds: Record<string, string> = {};
// key -> institution profile id (same as user id for simplicity)
export const institutionProfileIds: Record<string, string> = {};

export async function seedInstitutions(): Promise<void> {
  console.log("\n🏛️  Seeding institutions...");

  const userStmts: string[] = [];
  const profileStmts: string[] = [];
  const repStmts: string[] = [];

  for (const inst of INSTITUTIONS) {
    // Create a system institution user (not a login user — just a record owner)
    const userId = toUUID(`beyon-inst-user-${inst.key.toLowerCase()}`);
    institutionUserIds[inst.key] = userId;
    institutionProfileIds[inst.key] = userId;

    const adminEmail = `admin@${inst.code.toLowerCase()}.beyon.test`;

    // Insert institution user
    userStmts.push(
      `INSERT IGNORE INTO users (id, email, password_hash, display_name, role, status, email_verified, profile_status, created_at, updated_at)
       VALUES (${esc(userId)}, ${esc(adminEmail)}, 'SEEDED_NO_AUTH', ${esc(inst.name)}, 'INSTITUTION_ADMIN', 'ACTIVE', 1, 'COMPLETED', NOW(), NOW());`
    );

    // Insert institution profile
    profileStmts.push(
      `INSERT IGNORE INTO institution_profiles
        (id, user_id, institution_name, institution_type, institution_code, official_email, website,
         country, state, city, accreditations, accreditation_grade, established_year,
         placement_rate, average_package, highest_package, total_students, completion_pct, created_at, updated_at)
       VALUES (
         ${esc(userId)}, ${esc(userId)}, ${esc(inst.name)}, ${esc(inst.type)}, ${esc(inst.code)},
         ${esc(adminEmail)}, ${esc(inst.website)}, 'India', ${esc(inst.state)}, ${esc(inst.city)},
         ${esc(inst.accreditation)}, ${esc(inst.accreditationGrade)}, ${escNum(inst.established)},
         ${escNum(inst.placementRate)}, ${escNum(inst.avgPackage)}, ${escNum(inst.highestPackage)},
         ${escNum(inst.totalStudents)}, 85, NOW(), NOW()
       );`
    );
  }

  doltBatch(userStmts);
  doltBatch(profileStmts);

  console.log(`  ✅ ${INSTITUTIONS.length} institutions seeded`);
}

export function getInstitutionUserId(key: string): string | null {
  return institutionUserIds[key] ?? null;
}
