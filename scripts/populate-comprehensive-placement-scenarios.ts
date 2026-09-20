import { doltExec, doltBatch, doltQuery, esc, toUUID } from "./seed/engine/dolt.js";

console.log("Seeding diverse placement test cases across all KEC students...");

const instIds = [
  "c79fe93e-d36e-4497-be65-c6c928bf8c27", // konguengineeringcollege@kongu.edu
  "47c27bbf-ab39-46e3-a316-faea928e44c4"  // principal@kongu.edu
];

// 1. Get all students linked to KEC
const students = doltQuery(`
  SELECT is_table.id, is_table.institution_id, is_table.student_id, is_table.department, is_table.batch, u.display_name, u.email
  FROM institution_students is_table
  JOIN users u ON is_table.student_id = u.id
  WHERE is_table.institution_id = 'c79fe93e-d36e-4497-be65-c6c928bf8c27';
`);

console.log(`Found ${students.length} KEC students to partition across realistic placement scenarios.`);

const companies = [
  { name: "Zoho Corporation", tier: "TIER_1", role: "Software Development Engineer", packageMin: 12.0, packageMax: 24.0 },
  { name: "Mr. Cooper Group", tier: "TIER_1", role: "Full-Stack Cloud Engineer", packageMin: 14.0, packageMax: 26.0 },
  { name: "Presidio", tier: "TIER_1", role: "DevOps & Cloud Specialist", packageMin: 11.5, packageMax: 20.0 },
  { name: "Soliton Technologies", tier: "TIER_1", role: "Embedded & Automation Engineer", packageMin: 9.0, packageMax: 18.0 },
  { name: "Infosys Campus", tier: "TIER_2", role: "Specialist Programmer", packageMin: 7.0, packageMax: 9.5 },
  { name: "Bosch Global", tier: "TIER_1", role: "Core Systems Engineer", packageMin: 8.5, packageMax: 16.0 },
  { name: "Cisco Systems", tier: "TIER_1", role: "Network Software Engineer", packageMin: 15.0, packageMax: 25.0 },
  { name: "Amazon AWS", tier: "TIER_1", role: "Cloud Support Associate", packageMin: 16.0, packageMax: 26.0 },
  { name: "TCS Digital", tier: "TIER_2", role: "Digital Innovator", packageMin: 7.5, packageMax: 9.0 },
  { name: "Cognizant GenC", tier: "TIER_2", role: "Full-Stack Analyst", packageMin: 6.5, packageMax: 8.5 }
];

const malpracticeReasons = [
  "Multi-face anomaly: Secondary person detected in camera view during proctored assessment.",
  "Lockdown Browser Violation: Tab-switch frequency exceeded threshold (5 focus lost events).",
  "Audio anomaly: Dual-voice telemetry detected suspicious microphone stream in proctored session.",
  "Dual-Camera blind spot violation: Mobile phone reflection detected during coding assessment.",
  "Copy-Paste clipboard injection violation on restricted technical assessment."
];

// Clean existing placement records and applications for clean sync
for (const instId of instIds) {
  doltExec(`DELETE FROM placement_records WHERE institution_id = ${esc(instId)};`);
}

const batchStmts: string[] = [];

// Partition:
// Index % 100:
// 00 - 32 (33%): PLACED
// 33 - 47 (15%): ASSESSMENT_CLEARED (Waiting for Company result / Final interview)
// 48 - 63 (16%): ATTENDING_DRIVES (Scheduled to attend upcoming drives)
// 64 - 66 (3%): MALPRACTICE_FLAGGED (Disqualified due to integrity violations)
// 67 - 71 (5%): HIGHER_STUDIES (Opted out / Higher education)
// 72 - 99 (28%): PLACEMENT_SEEKING (Actively preparing / looking for opportunities)

let countPlaced = 0;
let countAssessmentCleared = 0;
let countAttending = 0;
let countMalpractice = 0;
let countHigherStudies = 0;
let countSeeking = 0;

for (let i = 0; i < students.length; i++) {
  const s = students[i];
  const mod = i % 100;
  const studentId = s.student_id;
  const dept = s.department || "CSE";

  let status = "PLACEMENT_SEEKING";
  let verified = 1;

  if (mod < 33) {
    status = "PLACED";
    countPlaced++;
    const comp = companies[i % companies.length];
    const pkg = Number((comp.packageMin + ((i * 3.7) % (comp.packageMax - comp.packageMin))).toFixed(2));
    const daysAgo = (i % 90) + 5;

    for (const instId of instIds) {
      batchStmts.push(`
        INSERT INTO placement_records (
          id, student_id, institution_id, company_name, company_tier, role_title, package_lpa, placement_date, placement_type, status, created_at
        ) VALUES (
          UUID(), ${esc(studentId)}, ${esc(instId)}, ${esc(comp.name)}, ${esc(comp.tier)}, ${esc(comp.role)},
          ${pkg}, DATE_SUB(CURDATE(), INTERVAL ${daysAgo} DAY), 'ON_CAMPUS', 'OFFERED', NOW()
        );
      `);

      batchStmts.push(`
        INSERT INTO recruitment_applications (
          id, student_id, opportunity_id, institution_id, status, assessment_score, interview_score, notes, coins_spent, applied_at, updated_at, created_at
        ) VALUES (
          UUID(), ${esc(studentId)}, UUID(), ${esc(instId)}, 'OFFERED', 94.50, 92.00,
          ${esc(`Official offer extended by ${comp.name} at ₹${pkg} LPA (${comp.role}). Candidate accepted.`)}, 0,
          DATE_SUB(NOW(), INTERVAL ${daysAgo + 14} DAY), NOW(), NOW()
        );
      `);
    }
  } else if (mod < 48) {
    status = "ASSESSMENT_CLEARED";
    countAssessmentCleared++;
    const comp = companies[(i + 2) % companies.length];
    const score = Number((82.0 + (i % 16)).toFixed(1));

    for (const instId of instIds) {
      batchStmts.push(`
        INSERT INTO recruitment_applications (
          id, student_id, opportunity_id, institution_id, status, assessment_score, interview_score, notes, coins_spent, applied_at, updated_at, created_at
        ) VALUES (
          UUID(), ${esc(studentId)}, UUID(), ${esc(instId)}, 'SHORTLISTED', ${score}, NULL,
          ${esc(`Cleared Online Technical Assessment with ${score}%. Shortlisted for Final Technical & HR Interview with ${comp.name}. Awaiting results.`)}, 0,
          DATE_SUB(NOW(), INTERVAL 3 DAY), NOW(), NOW()
        );
      `);
    }
  } else if (mod < 64) {
    status = "ATTENDING_DRIVES";
    countAttending++;
    const comp = companies[(i + 4) % companies.length];

    for (const instId of instIds) {
      batchStmts.push(`
        INSERT INTO recruitment_applications (
          id, student_id, opportunity_id, institution_id, status, assessment_score, interview_score, notes, coins_spent, applied_at, updated_at, created_at
        ) VALUES (
          UUID(), ${esc(studentId)}, UUID(), ${esc(instId)}, 'REGISTERED', NULL, NULL,
          ${esc(`Registration confirmed for upcoming campus drive: ${comp.name} (${comp.role}). Candidate scheduled to attend proctored assessment tomorrow.`)}, 0,
          DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), NOW()
        );
      `);
    }
  } else if (mod < 67) {
    status = "MALPRACTICE_FLAGGED";
    verified = 0;
    countMalpractice++;
    const reason = malpracticeReasons[i % malpracticeReasons.length];

    for (const instId of instIds) {
      batchStmts.push(`
        INSERT INTO recruitment_applications (
          id, student_id, opportunity_id, institution_id, status, assessment_score, interview_score, notes, coins_spent, applied_at, updated_at, created_at
        ) VALUES (
          UUID(), ${esc(studentId)}, UUID(), ${esc(instId)}, 'DISQUALIFIED', 12.00, NULL,
          ${esc(`PROCTORING VIOLATION: ${reason} Candidate flagged and disqualified from current placement drive.`)}, 0,
          DATE_SUB(NOW(), INTERVAL 7 DAY), NOW(), NOW()
        );
      `);
    }
  } else if (mod < 72) {
    status = "HIGHER_STUDIES";
    countHigherStudies++;
  } else {
    status = "PLACEMENT_SEEKING";
    countSeeking++;
  }

  // Update in institution_students for both institution IDs
  for (const instId of instIds) {
    batchStmts.push(`
      UPDATE institution_students 
      SET placement_status = ${esc(status)}, verified = ${verified}, updated_at = NOW()
      WHERE institution_id = ${esc(instId)} AND student_id = ${esc(studentId)};
    `);
  }
}

// Execute batch
console.log(`Executing ${batchStmts.length} SQL updates across placement dataset...`);
doltBatch(batchStmts);

// 2. Update Placement Stats Table
for (const instId of instIds) {
  doltExec(`
    UPDATE institution_placement_stats
    SET 
      total_students = ${students.length},
      placement_willing = ${students.length - countHigherStudies},
      eligible = ${students.length - countMalpractice},
      applied = ${countPlaced + countAssessmentCleared + countAttending + countSeeking},
      assessed = ${countPlaced + countAssessmentCleared + 110},
      shortlisted = ${countPlaced + countAssessmentCleared},
      interviewed = ${countPlaced + 45},
      placed = ${countPlaced},
      placement_rate = ${Number(((countPlaced / (students.length - countHigherStudies)) * 100).toFixed(1))},
      average_package = 14.85,
      highest_package = 26.00,
      companies_visited = 21,
      updated_at = NOW()
    WHERE institution_id = ${esc(instId)};
  `);

  doltExec(`
    UPDATE institution_profiles
    SET 
      placement_rate = ${Number(((countPlaced / (students.length - countHigherStudies)) * 100).toFixed(1))},
      average_package = 14.85,
      highest_package = 26.00,
      total_students = ${students.length},
      updated_at = NOW()
    WHERE user_id = ${esc(instId)};
  `);
}

console.log("\nPlacement Scenario Distribution Summary:");
console.log(`  ✅ Placed & Accepted Offers:           ${countPlaced} students (~${((countPlaced / students.length) * 100).toFixed(1)}%)`);
console.log(`  🟡 Cleared Assessment & In Interview:  ${countAssessmentCleared} students (~${((countAssessmentCleared / students.length) * 100).toFixed(1)}%)`);
console.log(`  🔵 Scheduled & Attending Drives:       ${countAttending} students (~${((countAttending / students.length) * 100).toFixed(1)}%)`);
console.log(`  ⚪ Placement Seeking & Active Prep:    ${countSeeking} students (~${((countSeeking / students.length) * 100).toFixed(1)}%)`);
console.log(`  🔴 Malpractice Flagged (Violations):   ${countMalpractice} students (~${((countMalpractice / students.length) * 100).toFixed(1)}%)`);
console.log(`  🟣 Opted Out / Higher Studies:         ${countHigherStudies} students (~${((countHigherStudies / students.length) * 100).toFixed(1)}%)`);
console.log(`  📊 Total Students Processed:           ${students.length}`);
