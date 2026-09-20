import { doltBatch, esc, escNum, doltQuery, toUUID } from "../engine/dolt.js";
import { COMPANIES } from "../data/companies.js";
import { companyUserIds } from "./03-companies.js";
import { institutionUserIds } from "./02-institutions.js";
import { testIds } from "./07-assessments.js";
import { SeededRandom } from "../utils/faker.js";
import type { SeedConfig } from "../config.js";

export const opportunityIds: string[] = [];
export const driveIds: string[] = [];

export async function seedOpportunities(cfg: SeedConfig): Promise<void> {
  console.log("\n💼 Seeding KEC placement drives, internships & opportunities...");

  const rng = new SeededRandom(cfg.seed + 4000);
  const optyStmts: string[] = [];
  const driveStmts: string[] = [];

  const kecInstUserId = institutionUserIds["INST_KEC"] || toUUID("beyon-inst-user-inst_kec");

  for (let i = 0; i < COMPANIES.length; i++) {
    const comp = COMPANIES[i];
    const compUserId = companyUserIds[comp.key];
    if (!compUserId) continue;

    // 1. Campus Drive Opportunity
    const optyId = toUUID(`beyon-opty-${comp.key.toLowerCase()}-campus`);
    opportunityIds.push(optyId);

    const title = comp.key === "COMP_SOLITON" ? "Embedded Software Engineer"
      : comp.key === "COMP_ZOHO" ? "Software Development Engineer (SDE-1)"
      : comp.key === "COMP_MRCOOPER" ? "Full Stack Cloud Engineer"
      : comp.key === "COMP_FOURKITES" ? "Python Backend & Logistics Architect"
      : comp.key === "COMP_PRESIDIO" ? "Cloud Solutions & DevOps Engineer"
      : comp.key === "COMP_CODINGMART" ? "Full-Stack Node/React Engineer"
      : `${comp.industry} Associate Engineer`;

    const skillsStr = comp.hiringSkills.join(",");
    const testId = testIds.length > 0 ? testIds[i % testIds.length] : null;

    optyStmts.push(
      `INSERT INTO company_opportunities
        (id, company_user_id, title, description, opportunity_type, location, is_remote,
         min_cgpa, required_skills, min_beyon_coins, assessment_id, status, created_at, updated_at)
       VALUES (
         ${esc(optyId)}, ${esc(compUserId)},
         ${esc(title)},
         ${esc(`${title} role at ${comp.name}. Looking for strong engineering problem solving, core fundamentals and system proficiency.`)},
         'FULL_TIME',
         ${esc(comp.city)},
         0,
         ${comp.tier === "TIER_1" ? 7.50 : 6.50},
         ${esc(skillsStr)},
         100,
         ${esc(testId)},
         'PUBLISHED',
         DATE_SUB(NOW(), INTERVAL 60 DAY),
         NOW()
       )
       ON DUPLICATE KEY UPDATE title=${esc(title)}, required_skills=${esc(skillsStr)};`
    );

    // 2. Internship Opportunity
    const internOptyId = toUUID(`beyon-opty-${comp.key.toLowerCase()}-intern`);
    opportunityIds.push(internOptyId);

    optyStmts.push(
      `INSERT INTO company_opportunities
        (id, company_user_id, title, description, opportunity_type, location, is_remote,
         min_cgpa, required_skills, min_beyon_coins, assessment_id, status, created_at, updated_at)
       VALUES (
         ${esc(internOptyId)}, ${esc(compUserId)},
         ${esc(`${comp.name} Graduate Engineering Intern`)},
         ${esc(`6-month fast-track engineering internship at ${comp.name} with PPO conversion.`)},
         'INTERNSHIP',
         ${esc(comp.city)},
         1,
         7.00,
         ${esc(skillsStr)},
         50,
         ${esc(testId)},
         'PUBLISHED',
         DATE_SUB(NOW(), INTERVAL 45 DAY),
         NOW()
       )
       ON DUPLICATE KEY UPDATE title=${esc(`${comp.name} Graduate Engineering Intern`)};`
    );

    // 3. On-Campus Placement Drive for KEC
    const driveId = toUUID(`beyon-drive-${comp.key.toLowerCase()}-kec`);
    driveIds.push(driveId);

    const eligibleDepts = comp.key === "COMP_SOLITON" ? "CSE,ECE,EIE,MTS"
      : comp.key === "COMP_ZOHO" ? "CSE,IT,AIDS,AIML,CSD,ECE,EEE"
      : comp.key === "COMP_MRCOOPER" ? "CSE,IT,AIDS,CSD"
      : "CSE,IT,AIDS,AIML,CSD,ECE,EEE,MECH,MTS,AUTO";

    driveStmts.push(
      `INSERT INTO placement_drives
        (id, opportunity_id, institution_id, company_user_id, title, description, status, eligible_student_count, applied_count, assessed_count, shortlisted_count, interviewed_count, selected_count, drive_date, package_lpa, created_at, updated_at)
       VALUES (
         ${esc(driveId)}, ${esc(optyId)}, ${esc(kecInstUserId)}, ${esc(compUserId)},
         ${esc(`${comp.name} On-Campus Recruitment Drive 2026-27`)},
         ${esc(`Annual campus hiring drive for ${comp.name} targeting KEC engineering graduates across ${eligibleDepts}.`)},
         'REGISTRATION_OPEN',
         ${rng.int(150, 400)},
         ${rng.int(80, 180)},
         ${rng.int(50, 120)},
         ${rng.int(20, 50)},
         ${rng.int(10, 25)},
         ${rng.int(5, 15)},
         DATE_ADD(CURDATE(), INTERVAL ${rng.int(5, 30)} DAY),
         ${comp.tier === "TIER_1" ? 14.50 : 8.50},
         DATE_SUB(NOW(), INTERVAL 20 DAY),
         NOW()
       )
       ON DUPLICATE KEY UPDATE title=${esc(`${comp.name} On-Campus Recruitment Drive 2026-27`)};`
    );
  }

  doltBatch(optyStmts);
  doltBatch(driveStmts);

  console.log(`  ✅ ${opportunityIds.length} job & internship opportunities seeded`);
  console.log(`  ✅ ${driveIds.length} KEC campus placement drives seeded`);
}
