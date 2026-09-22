import { doltBatch, esc, escNum, toUUID } from "../engine/dolt.js";
import { COMPANIES } from "../data/companies.js";

export const companyUserIds: Record<string, string> = {};

export async function seedCompanies(): Promise<void> {
  console.log("\n🏢 Seeding companies & industry verifications...");

  const userStmts: string[] = [];
  const profileStmts: string[] = [];
  const verifStmts: string[] = [];

  for (const comp of COMPANIES) {
    const userId = toUUID(`beyon-comp-user-${comp.key.toLowerCase()}`);
    companyUserIds[comp.key] = userId;

    const domain = comp.website.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const officialEmail = comp.verificationStatus === "PUBLIC_EMAIL" 
      ? `${comp.slug}.recruitment@gmail.com`
      : `recruitment@${domain}`;

    userStmts.push(
      `INSERT IGNORE INTO users (id, email, password_hash, display_name, role, status, email_verified, profile_status, created_at, updated_at)
       VALUES (${esc(userId)}, ${esc(officialEmail)}, '$2b$10$s3855CduR4SV7tOdnQB0BObl.fIaBDOkvW7PJZWvh27Lv5pK3sLYO', ${esc(comp.name)}, 'COMPANY', 'ACTIVE', 1, 'COMPLETED', NOW(), NOW());`
    );

    profileStmts.push(
      `INSERT INTO company_profiles
        (id, user_id, company_name, company_type, industry, website, official_email,
         country, state, city, headquarters, company_size, founded_year,
         about, completion_pct, created_at, updated_at)
       VALUES (
         ${esc(userId)}, ${esc(userId)}, ${esc(comp.name)}, ${esc(comp.companyType)},
         ${esc(comp.industry)}, ${esc(comp.website)}, ${esc(officialEmail)},
         'India', ${esc(comp.state)}, ${esc(comp.city)}, ${esc(comp.headquarters)},
         ${esc(comp.companySize)}, ${escNum(comp.foundedYear)},
         ${esc(`${comp.name} is a leading ${comp.industry} organization partnering with top engineering institutions including KEC.`)},
         100, NOW(), NOW()
       )
       ON DUPLICATE KEY UPDATE company_name=${esc(comp.name)}, website=${esc(comp.website)};`
    );

    // Seed verification record with realistic CIN & validation state
    const verifId = toUUID(`beyon-verif-${comp.key.toLowerCase()}`);
    const cin = `U72200TN${comp.foundedYear}PTC${String(Math.abs(comp.foundedYear * 137)).padStart(6, "0").slice(0, 6)}`;
    const emailDomain = officialEmail.split("@")[1];

    verifStmts.push(
      `INSERT INTO company_verifications
        (id, company_id, user_id, cin, legal_name, company_status, official_website,
         normalized_website_domain, corporate_email, normalized_email_domain,
         representative_name, representative_designation, representative_phone,
         overall_status, failure_reasons, review_notes, created_at, updated_at)
       VALUES (
        ${esc(verifId)}, ${esc(userId)}, ${esc(userId)}, ${esc(cin)}, ${esc(comp.name)},
        'ACTIVE', ${esc(comp.website)}, ${esc(domain)}, ${esc(officialEmail)}, ${esc(emailDomain)},
        ${esc(`Talent Acquisition Head (${comp.name})`)}, 'Head of University Relations', '+91 9876543210',
        ${esc(comp.verificationStatus)},
        ${esc(comp.verificationReason || null)},
        ${esc(`Audit Trail: ${comp.dataSource} entity verification logged.`)},
        NOW(), NOW()
       )
       ON DUPLICATE KEY UPDATE overall_status=${esc(comp.verificationStatus)}, failure_reasons=${esc(comp.verificationReason || null)};`
    );
  }

  doltBatch(userStmts);
  doltBatch(profileStmts);
  doltBatch(verifStmts);

  console.log(`  ✅ ${COMPANIES.length} companies & verification records seeded`);
}

export function getCompanyUserId(key: string): string | null {
  return companyUserIds[key] ?? null;
}


