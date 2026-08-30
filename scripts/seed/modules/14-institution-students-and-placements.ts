// ============================================================
// Module 14 — Institution Students & Placements Seeder
// Seeds institution student relationships, verification queues,
// representatives, multi-year placement history, and NIRF ratings.
// ============================================================

import { doltBatch, esc, doltQuery, toUUID } from "../engine/dolt.js";
import { studentUserIds } from "./04-users.js";
import { institutionUserIds } from "./02-institutions.js";
import { companyUserIds } from "./03-companies.js";
import { SeededRandom } from "../utils/faker.js";
import type { SeedConfig } from "../config.js";

async function ensureRefs(): Promise<void> {
  if (studentUserIds.length === 0) {
    const srows = doltQuery("SELECT id FROM users WHERE role='STUDENT'");
    for (const r of srows) studentUserIds.push(r.id);
  }
  if (Object.keys(institutionUserIds).length === 0) {
    const irows = doltQuery("SELECT id FROM users WHERE role='INSTITUTION'");
    let i = 0;
    for (const r of irows) {
      (institutionUserIds as any)[`INST_${String(i + 1).padStart(4, "0")}`] = r.id;
      i++;
    }
  }
  if (Object.keys(companyUserIds).length === 0) {
    const crows = doltQuery("SELECT id FROM users WHERE role='COMPANY'");
    let i = 0;
    for (const r of crows) {
      (companyUserIds as any)[`COMP_${String(i + 1).padStart(4, "0")}`] = r.id;
      i++;
    }
  }
}

export async function seedInstitutionStudentsAndPlacements(cfg: SeedConfig): Promise<void> {
  console.log("\n🏛️ Seeding institution students, verification queues, and placement records...");

  await ensureRefs();

  const rng = new SeededRandom(cfg.seed + 9000);
  const instIdList = Object.values(institutionUserIds);
  const compIdList = Object.values(companyUserIds);

  const DEPARTMENTS = [
    "Computer Science and Engineering",
    "Information Technology",
    "Artificial Intelligence & Data Science",
    "Electronics and Communication",
    "Electrical and Electronics Engineering"
  ];
  const BATCHES = ["2022-2026", "2023-2027", "2021-2025"];

  // ─── 1. Link Students to Institutions (with Pending vs Verified) ───
  const instStudentStmts: string[] = [];
  let sIdx = 0;

  for (const studentId of studentUserIds) {
    const instId = instIdList[sIdx % instIdList.length];
    const dept = DEPARTMENTS[sIdx % DEPARTMENTS.length];
    const batch = BATCHES[sIdx % BATCHES.length];
    const isPending = sIdx % 7 === 0;
    const isPlaced = !isPending && sIdx % 3 === 0;
    const placementStatus = isPlaced ? "PLACED" : isPending ? "PENDING_VERIFICATION" : "PLACEMENT_SEEKING";
    const isVerified = isPending ? 0 : 1;
    const id = toUUID(`beyon-inst-std-${studentId}`);

    instStudentStmts.push(
      `INSERT INTO institution_students (id, institution_id, student_id, department, batch, admission_year, graduation_year, placement_status, verified, created_at, updated_at)
       VALUES (${esc(id)}, ${esc(instId)}, ${esc(studentId)}, ${esc(dept)}, ${esc(batch)}, 2022, 2026, ${esc(placementStatus)}, ${isVerified}, DATE_SUB(NOW(), INTERVAL ${rng.int(10, 200)} DAY), NOW())
       ON DUPLICATE KEY UPDATE department=${esc(dept)}, batch=${esc(batch)}, placement_status=${esc(placementStatus)}, verified=${isVerified};`
    );

    if (isPending) {
      instStudentStmts.push(
        `UPDATE users SET profile_status='PENDING_INSTITUTION_VERIFICATION' WHERE id=${esc(studentId)};`
      );
    }

    sIdx++;
  }
  doltBatch(instStudentStmts, 100);
  console.log(`  ✅ ${sIdx} student-institution links & verification queue records`);

  // ─── 2. Institution Placement Officers & Representatives ───
  const repStmts: string[] = [];
  let rIdx = 0;
  for (const instId of instIdList) {
    const repId1 = toUUID(`beyon-irep-${instId}-1`);
    const repId2 = toUUID(`beyon-irep-${instId}-2`);

    repStmts.push(
      `INSERT INTO institution_representatives (id, user_id, name, designation, email, phone, department, created_at)
       VALUES (${esc(repId1)}, ${esc(instId)}, 'Prof. Dr. Sundaravadivel M', 'Head - Training & Placement Office (TPO)', 'tpo.director@institution.beyon.test', '+91 98401 23456', 'Placement Cell', NOW())
       ON DUPLICATE KEY UPDATE name='Prof. Dr. Sundaravadivel M', designation='Head - Training & Placement Office (TPO)';`
    );

    repStmts.push(
      `INSERT INTO institution_representatives (id, user_id, name, designation, email, phone, department, created_at)
       VALUES (${esc(repId2)}, ${esc(instId)}, 'Dr. Meenakshi Sundaram', 'Dean - Industry Relations & Career Guidance', 'dean.careers@institution.beyon.test', '+91 98401 78901', 'Dean Office', NOW())
       ON DUPLICATE KEY UPDATE name='Dr. Meenakshi Sundaram', designation='Dean - Industry Relations & Career Guidance';`
    );
    rIdx += 2;
  }
  doltBatch(repStmts, 50);
  console.log(`  ✅ ${rIdx} institution placement officers & representatives`);

  // ─── 3. Multi-Year Placement History (2023, 2024, 2025) ───
  const histStmts: string[] = [];
  const YEARS = [
    { year: "2024-2025", placed: 420, pct: 93.5, avg: 1250000.00, high: 4400000.00 },
    { year: "2023-2024", placed: 395, pct: 91.2, avg: 1080000.00, high: 3800000.00 },
    { year: "2022-2023", placed: 360, pct: 88.4, avg: 920000.00, high: 3200000.00 },
  ];

  let hIdx = 0;
  for (const instId of instIdList) {
    for (const y of YEARS) {
      const histId = toUUID(`beyon-ihist-${instId}-${y.year}`);
      histStmts.push(
        `INSERT INTO institution_placement_history (id, user_id, academic_year, students_placed, placement_percentage, average_package, highest_package, created_at)
         VALUES (${esc(histId)}, ${esc(instId)}, ${esc(y.year)}, ${y.placed + rng.int(-20, 20)}, ${y.pct}, ${y.avg}, ${y.high}, NOW())
         ON DUPLICATE KEY UPDATE students_placed=${y.placed}, average_package=${y.avg}, highest_package=${y.high};`
      );
      hIdx++;
    }
  }
  doltBatch(histStmts, 50);
  console.log(`  ✅ ${hIdx} multi-year placement history records`);

  // ─── 4. Real-Time Institution Placement Stats ───
  const statStmts: string[] = [];
  let stIdx = 0;
  for (const instId of instIdList) {
    const statId = toUUID(`beyon-istat-${instId}`);
    statStmts.push(
      `INSERT INTO institution_placement_stats (id, institution_id, academic_year, total_students, placement_willing, eligible, applied, assessed, shortlisted, interviewed, placed, placement_rate, average_package, highest_package, companies_visited, department_stats, skill_demand, company_tier_distribution, updated_at)
       VALUES (
         ${esc(statId)}, ${esc(instId)}, 2026, 450, 430, 410, 395, 380, 290, 180, 165,
         92.40, 1420000.00, 4800000.00, 68,
         '{"CSE": {"placed": 120, "avg": 15.2}, "IT": {"placed": 85, "avg": 13.8}, "AI_DS": {"placed": 60, "avg": 16.5}}',
         '{"Java": 88, "Python": 82, "React": 75, "SystemDesign": 68, "Cloud": 62}',
         '{"TIER_1_DREAM": 42, "TIER_2_CORE": 88, "TIER_3_MASS": 35}',
         NOW()
       )
       ON DUPLICATE KEY UPDATE total_students=450, placed=165, placement_rate=92.40, average_package=1420000.00;`
    );
    stIdx++;
  }
  doltBatch(statStmts, 50);
  console.log(`  ✅ ${stIdx} real-time institution placement stats`);

  // ─── 5. Institution Ratings & NIRF Scorecards ───
  const ratingStmts: string[] = [];
  let ratIdx = 0;
  for (const instId of instIdList) {
    const ratId = toUUID(`beyon-irat-${instId}`);
    const snapId = toUUID(`beyon-isnap-${instId}`);
    const acad = Number((4.5 + rng.float(0, 0.4)).toFixed(2));
    const place = Number((4.6 + rng.float(0, 0.35)).toFixed(2));
    const salary = Number((4.4 + rng.float(0, 0.5)).toFixed(2));
    const ind = Number((4.7 + rng.float(0, 0.25)).toFixed(2));
    const overall = Number(((acad + place + salary + ind) / 4).toFixed(2));

    ratingStmts.push(
      `INSERT INTO institution_ratings (id, institution_id, academic_score, placement_score, salary_score, industry_score, skill_score, overall_rating, calculation_version, last_calculated_at, created_at, updated_at)
       VALUES (${esc(ratId)}, ${esc(instId)}, ${acad}, ${place}, ${salary}, ${ind}, 4.80, ${overall}, 1, NOW(), NOW(), NOW())
       ON DUPLICATE KEY UPDATE academic_score=${acad}, placement_score=${place}, overall_rating=${overall};`
    );

    ratingStmts.push(
      `INSERT INTO institution_rating_snapshots (id, institution_id, overall_rating, academic_score, placement_score, salary_score, industry_score, skill_score, total_students, students_placed, placement_percentage, average_package, highest_package, tier1_count, tier2_count, companies_visited, snapshot_date, created_at)
       VALUES (${esc(snapId)}, ${esc(instId)}, ${overall}, ${acad}, ${place}, ${salary}, ${ind}, 4.80, 450, 420, 93.5, 1420000.00, 4800000.00, 42, 88, 68, CURDATE(), NOW())
       ON DUPLICATE KEY UPDATE overall_rating=${overall}, placement_percentage=93.5;`
    );
    ratIdx++;
  }
  doltBatch(ratingStmts, 50);
  console.log(`  ✅ ${ratIdx} institution rating snapshots & scorecards`);

  // ─── 6. Placement Records & Offers ───
  const placRecStmts: string[] = [];
  const ROLES = ["Software Development Engineer (SDE-1)", "Backend Microservices Engineer", "Full-Stack Engineer", "AI/ML Associate", "Cloud Solutions Engineer"];
  const COMPANIES = ["Google Cloud", "Microsoft IDC", "Amazon AWS", "Salesforce", "Atlassian", "Oracle Cloud"];
  let pRecCount = 0;

  for (let i = 0; i < studentUserIds.length; i++) {
    if (i % 2 !== 0) continue;
    const sid = studentUserIds[i];
    const cid = compIdList[i % compIdList.length];
    const instId = instIdList[i % instIdList.length];
    const pid = toUUID(`beyon-prec-${i}`);
    const role = ROLES[i % ROLES.length];
    const compName = COMPANIES[i % COMPANIES.length];
    const ctc = 1200000.00 + (i % 5) * 350000.00;
    const lpa = Number((ctc / 100000).toFixed(2));

    placRecStmts.push(
      `INSERT INTO recruitment_placements (id, student_id, company_user_id, institution_id, job_role, ctc_amount, ctc_currency, company_tier, placement_type, placement_year, joining_date, offer_date, status, verified, created_at, updated_at)
       VALUES (${esc(pid)}, ${esc(sid)}, ${esc(cid)}, ${esc(instId)}, ${esc(role)}, ${ctc}, 'INR', 'TIER_1', 'FULL_TIME', 2026, '2026-07-01', DATE_SUB(NOW(), INTERVAL 15 DAY), 'ACCEPTED', 1, NOW(), NOW())
       ON DUPLICATE KEY UPDATE job_role=${esc(role)}, ctc_amount=${ctc}, status='ACCEPTED';`
    );

    placRecStmts.push(
      `INSERT INTO placement_records (id, student_id, institution_id, company_name, company_tier, role_title, package_lpa, placement_date, placement_type, status, created_at)
       VALUES (${esc(pid)}, ${esc(sid)}, ${esc(instId)}, ${esc(compName)}, 'TIER_1', ${esc(role)}, ${lpa}, CURDATE(), 'FULL_TIME', 'OFFERED', NOW())
       ON DUPLICATE KEY UPDATE company_name=${esc(compName)}, package_lpa=${lpa}, status='OFFERED';`
    );
    pRecCount++;
  }
  doltBatch(placRecStmts, 50);
  console.log(`  ✅ ${pRecCount} verified recruitment placement offer records`);
}
