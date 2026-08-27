// ============================================================
// Module 03 — Company Seeder
// ============================================================

import { doltBatch, esc, escNum, toUUID } from "../engine/dolt.js";
import { COMPANIES } from "../data/companies.js";

export const companyUserIds: Record<string, string> = {};

export async function seedCompanies(): Promise<void> {
  console.log("\n🏢 Seeding companies...");

  const userStmts: string[] = [];
  const profileStmts: string[] = [];

  for (const comp of COMPANIES) {
    const userId = toUUID(`beyon-comp-user-${comp.key.toLowerCase()}`);
    companyUserIds[comp.key] = userId;

    const officialEmail = `info@${comp.slug}.beyon.test`;

    userStmts.push(
      `INSERT IGNORE INTO users (id, email, password_hash, display_name, role, status, email_verified, profile_status, created_at, updated_at)
       VALUES (${esc(userId)}, ${esc(officialEmail)}, 'SEEDED_NO_AUTH', ${esc(comp.name)}, 'COMPANY_ADMIN', 'ACTIVE', 1, 'COMPLETED', NOW(), NOW());`
    );

    profileStmts.push(
      `INSERT IGNORE INTO company_profiles
        (id, user_id, company_name, company_type, industry, website, official_email,
         country, state, city, headquarters, company_size, founded_year,
         about, completion_pct, created_at, updated_at)
       VALUES (
         ${esc(userId)}, ${esc(userId)}, ${esc(comp.name)}, ${esc(comp.companyType)},
         ${esc(comp.industry)}, ${esc(comp.website)}, ${esc(officialEmail)},
         'India', ${esc(comp.state)}, ${esc(comp.city)}, ${esc(comp.headquarters)},
         ${esc(comp.companySize)}, ${escNum(comp.foundedYear)},
         ${esc(`${comp.name} is a leading ${comp.industry} company headquartered in ${comp.headquarters}.`)},
         90, NOW(), NOW()
       );`
    );
  }

  doltBatch(userStmts);
  doltBatch(profileStmts);

  console.log(`  ✅ ${COMPANIES.length} companies seeded`);
}

export function getCompanyUserId(key: string): string | null {
  return companyUserIds[key] ?? null;
}
