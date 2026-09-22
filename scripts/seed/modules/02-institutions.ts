import { doltBatch, esc, escNum, toUUID } from "../engine/dolt.js";
import bcrypt from "bcryptjs";
import { INSTITUTIONS, KEC_DEPARTMENTS } from "../data/institutions.js";

export const institutionUserIds: Record<string, string> = {};
export const institutionProfileIds: Record<string, string> = {};
export const departmentIds: Record<string, string> = {};

export async function seedInstitutions(): Promise<void> {
  console.log("\n🏛️  Seeding institutions and academic departments...");

  const userStmts: string[] = [];
  const profileStmts: string[] = [];
  const deptStmts: string[] = [];
  const defaultHash = "$2b$10$s3855CduR4SV7tOdnQB0BObl.fIaBDOkvW7PJZWvh27Lv5pK3sLYO";

  for (const inst of INSTITUTIONS) {
    const userId = inst.key === "INST_KEC" ? "c79fe93e-d36e-4497-be65-c6c928bf8c27" : toUUID(`beyon-inst-user-${inst.key.toLowerCase()}`);
    institutionUserIds[inst.key] = userId;
    institutionProfileIds[inst.key] = userId;

    const adminEmail = inst.key === "INST_KEC" 
      ? "konguengineeringcollege@kongu.edu" 
      : `admin@${inst.code.toLowerCase()}.beyon.test`;

    userStmts.push(
      `INSERT INTO users (id, email, password_hash, display_name, role, institution_id, status, email_verified, profile_status, created_at, updated_at)
       VALUES (${esc(userId)}, ${esc(adminEmail)}, ${esc(defaultHash)}, ${esc(inst.name)}, 'INSTITUTION', ${esc(userId)}, 'ACTIVE', 1, 'COMPLETED', NOW(), NOW())
       ON DUPLICATE KEY UPDATE password_hash=${esc(defaultHash)}, institution_id=${esc(userId)}, status='ACTIVE';`
    );

    profileStmts.push(
      `INSERT INTO institution_profiles
        (id, user_id, institution_name, institution_type, institution_code, official_email, website,
         country, state, city, accreditations, accreditation_grade, established_year,
         placement_rate, average_package, highest_package, total_students, completion_pct, created_at, updated_at)
       VALUES (
         ${esc(userId)}, ${esc(userId)}, ${esc(inst.name)}, ${esc(inst.type)}, ${esc(inst.code)},
         ${esc(adminEmail)}, ${esc(inst.website)}, 'India', ${esc(inst.state)}, ${esc(inst.city)},
         ${esc(inst.accreditation)}, ${esc(inst.accreditationGrade)}, ${escNum(inst.established)},
         ${escNum(inst.placementRate)}, ${escNum(inst.avgPackage)}, ${escNum(inst.highestPackage)},
         ${escNum(inst.totalStudents)}, 100, NOW(), NOW()
       )
       ON DUPLICATE KEY UPDATE institution_name=${esc(inst.name)}, institution_code=${esc(inst.code)}, official_email=${esc(adminEmail)};`
    );

    // If KEC, seed all 14 official departments
    if (inst.key === "INST_KEC") {
      for (const dept of KEC_DEPARTMENTS) {
        const deptId = toUUID(`beyon-dept-kec-${dept.code.toLowerCase()}`);
        departmentIds[dept.code] = deptId;

        deptStmts.push(
          `INSERT INTO institution_departments
            (id, institution_id, department_code, department_name, description, created_at, updated_at)
           VALUES (
            ${esc(deptId)}, ${esc(userId)}, ${esc(dept.code)}, ${esc(dept.name)},
            ${esc(dept.description)}, NOW(), NOW()
           )
           ON DUPLICATE KEY UPDATE department_name=${esc(dept.name)}, description=${esc(dept.description)};`
        );
      }
    }
  }

  doltBatch(userStmts);
  doltBatch(profileStmts);
  if (deptStmts.length > 0) doltBatch(deptStmts);

  console.log(`  ✅ ${INSTITUTIONS.length} institutions seeded`);
  console.log(`  ✅ ${KEC_DEPARTMENTS.length} official KEC departments seeded`);
}

export function getInstitutionUserId(key: string): string | null {
  return institutionUserIds[key] ?? null;
}
