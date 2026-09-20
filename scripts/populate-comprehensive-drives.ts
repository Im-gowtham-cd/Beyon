import { spawn } from 'child_process';
import { randomUUID } from 'crypto';

const KEC_INST_IDS = [
  'c79fe93e-d36e-4497-be65-c6c928bf8c27',
  '47c27bbf-ab39-46e3-a316-faea928e44c4'
];

async function runDoltSql(sql: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('dolt', ['sql'], { stdio: ['pipe', 'pipe', 'pipe'], shell: true });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`Dolt SQL failed (${code}): ${stderr || stdout}`));
    });
    proc.stdin.write(sql);
    proc.stdin.end();
  });
}

interface DriveSeed {
  companyName: string;
  title: string;
  role: string;
  driveType: string;
  packageLpa: number;
  eligibleBatch: string;
  eligibleDepts: string;
  minCgpa: number;
  status: 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED' | 'COMPLETED';
  appliedCount: number;
  shortlistedCount: number;
  interviewedCount: number;
  selectedCount: number;
  driveDate: string;
  location: string;
  description: string;
  rejectionReason?: string;
}

const DRIVES_DATA: DriveSeed[] = [
  // 1. APPROVED & ACTIVE / SCHEDULED DRIVES
  {
    companyName: 'Zoho Corporation',
    title: 'Zoho Corporation Campus Recruitment Drive 2026-27',
    role: 'Member Technical Staff (Product Development)',
    driveType: 'ON_CAMPUS',
    packageLpa: 14.50,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'CSE, IT, AI & DS, ECE, CSBS',
    minCgpa: 7.50,
    status: 'APPROVED',
    appliedCount: 42,
    shortlistedCount: 24,
    interviewedCount: 16,
    selectedCount: 8,
    driveDate: '2026-10-15',
    location: 'KEC Placement Convention Hall',
    description: 'Exclusive on-campus drive for Zoho SaaS product engineering teams. Technical assessments cover advanced data structures, systems programming, and full-stack web architectures.'
  },
  {
    companyName: 'Mr. Cooper',
    title: 'Mr. Cooper FinTech Software Engineering Drive 2026-27',
    role: 'Software Development Engineer - FinTech Core',
    driveType: 'ON_CAMPUS',
    packageLpa: 16.00,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'CSE, IT, ECE, EEE, AI & DS',
    minCgpa: 7.00,
    status: 'APPROVED',
    appliedCount: 38,
    shortlistedCount: 20,
    interviewedCount: 12,
    selectedCount: 6,
    driveDate: '2026-10-22',
    location: 'KEC Tech Park Seminar Hall',
    description: 'Hiring software engineers for core US mortgage cloud infrastructure, high-throughput financial transactions, and microservices platforms.'
  },
  {
    companyName: 'Cisco Systems',
    title: 'Cisco Systems Elite Campus Recruitment 2026-27',
    role: 'Network Software Engineer (Cloud Infrastructure)',
    driveType: 'ON_CAMPUS',
    packageLpa: 24.00,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'CSE, IT, ECE, AI & DS',
    minCgpa: 8.00,
    status: 'APPROVED',
    appliedCount: 45,
    shortlistedCount: 18,
    interviewedCount: 10,
    selectedCount: 4,
    driveDate: '2026-11-05',
    location: 'KEC Central Computing Facility',
    description: 'Dream Tier recruitment slot for enterprise networking, SDN, cloud security, and high-performance routing protocols with Cisco Bangalore Engineering.'
  },
  {
    companyName: 'Amazon Web Services (AWS)',
    title: 'Amazon AWS Cloud Architect Graduate Drive 2026-27',
    role: 'Associate Cloud Solutions Architect',
    driveType: 'ON_CAMPUS',
    packageLpa: 26.00,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'CSE, IT, AI & DS, ECE',
    minCgpa: 8.00,
    status: 'APPROVED',
    appliedCount: 50,
    shortlistedCount: 22,
    interviewedCount: 14,
    selectedCount: 5,
    driveDate: '2026-11-12',
    location: 'KEC Placement Auditorium & Online Lab',
    description: 'Premier campus recruitment for AWS Cloud Solutions Architect cohort. Evaluation focuses on distributed computing, scalable systems, and cloud-native application architectures.'
  },
  {
    companyName: 'Presidio',
    title: 'Presidio Cloud Engineering Campus Drive 2026-27',
    role: 'Cloud Systems Solutions Engineer',
    driveType: 'ON_CAMPUS',
    packageLpa: 12.50,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'CSE, IT, AI & DS, ECE, CSBS, CSD',
    minCgpa: 7.00,
    status: 'APPROVED',
    appliedCount: 35,
    shortlistedCount: 18,
    interviewedCount: 12,
    selectedCount: 6,
    driveDate: '2026-10-28',
    location: 'KEC Placement Center',
    description: 'Recruitment for Presidio multi-cloud engineering, automation, and enterprise cybersecurity service delivery practices.'
  },
  {
    companyName: 'Bosch Global Software',
    title: 'Bosch Mobility & Embedded Systems Campus Drive 2026-27',
    role: 'Autonomous Embedded Systems Engineer',
    driveType: 'ON_CAMPUS',
    packageLpa: 11.00,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'ECE, EEE, MECHATRONICS, CSE, AUTOMOBILE',
    minCgpa: 7.00,
    status: 'APPROVED',
    appliedCount: 30,
    shortlistedCount: 15,
    interviewedCount: 10,
    selectedCount: 5,
    driveDate: '2026-11-02',
    location: 'KEC Mechatronics Center of Excellence',
    description: 'Hiring core engineering graduates for automotive embedded software, AUTOSAR, battery management systems, and IoT mobility units.'
  },
  {
    companyName: 'FourKites',
    title: 'FourKites Supply Chain SaaS Drive 2026-27',
    role: 'Software Engineer - Platform & Data Pipeline',
    driveType: 'ON_CAMPUS',
    packageLpa: 13.50,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'All Engineering Streams',
    minCgpa: 7.00,
    status: 'APPROVED',
    appliedCount: 28,
    shortlistedCount: 14,
    interviewedCount: 8,
    selectedCount: 4,
    driveDate: '2026-11-18',
    location: 'KEC Placement Online Lab',
    description: 'Hiring for global supply chain visibility platform, streaming telemetry, and predictive logistics AI.'
  },
  {
    companyName: 'HP Enterprise',
    title: 'Hewlett Packard Enterprise Server R&D Drive 2026-27',
    role: 'Infrastructure Software Systems Engineer',
    driveType: 'ON_CAMPUS',
    packageLpa: 15.00,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'CSE, IT, ECE, EEE',
    minCgpa: 7.20,
    status: 'APPROVED',
    appliedCount: 25,
    shortlistedCount: 12,
    interviewedCount: 8,
    selectedCount: 4,
    driveDate: '2026-11-25',
    location: 'KEC Campus Auditorium',
    description: 'Server firmware, bare-metal container orchestration, and storage virtualization engineering.'
  },

  // 2. PENDING INSTITUTIONAL AUTHORIZATION DRIVES
  {
    companyName: 'ByteForge Technologies',
    title: 'ByteForge Full Stack Recruitment Drive 2026-27',
    role: 'Full Stack Web & Microservices Engineer',
    driveType: 'VIRTUAL_PLACEMENT',
    packageLpa: 8.50,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'CSE, IT, AI & DS',
    minCgpa: 6.50,
    status: 'PENDING_APPROVAL',
    appliedCount: 15,
    shortlistedCount: 0,
    interviewedCount: 0,
    selectedCount: 0,
    driveDate: '2026-12-02',
    location: 'Virtual / Online Portal',
    description: 'Incoming campus request from ByteForge Technologies. Currently undergoing placement committee slot review for schedule clearance.'
  },
  {
    companyName: 'CloudNest Labs',
    title: 'CloudNest Site Reliability Engineering Drive 2026-27',
    role: 'Site Reliability & Cloud Operations Engineer',
    driveType: 'ON_CAMPUS',
    packageLpa: 9.00,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'CSE, IT, ECE',
    minCgpa: 7.00,
    status: 'PENDING_APPROVAL',
    appliedCount: 18,
    shortlistedCount: 0,
    interviewedCount: 0,
    selectedCount: 0,
    driveDate: '2026-12-05',
    location: 'KEC Computing Complex',
    description: 'Pending slot confirmation. Placement cell is coordinating laboratory and schedule allocation with department HODs.'
  },
  {
    companyName: 'Ajira Technologies',
    title: 'Ajira Technologies Associate Software Drive 2026-27',
    role: 'Associate Software Engineer - Frontend & APIs',
    driveType: 'ON_CAMPUS',
    packageLpa: 7.50,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'All Engineering Streams',
    minCgpa: 6.50,
    status: 'PENDING_APPROVAL',
    appliedCount: 12,
    shortlistedCount: 0,
    interviewedCount: 0,
    selectedCount: 0,
    driveDate: '2026-12-08',
    location: 'Campus / Hybrid',
    description: 'Slot proposal submitted by Ajira Technologies. Awaiting Principal authorization.'
  },
  {
    companyName: 'Nexora Systems',
    title: 'Nexora Data Engineering Recruitment Drive 2026-27',
    role: 'Data Pipeline & Analytics Engineer',
    driveType: 'VIRTUAL_PLACEMENT',
    packageLpa: 8.00,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'CSE, IT, AI & DS, CSBS',
    minCgpa: 6.80,
    status: 'PENDING_APPROVAL',
    appliedCount: 14,
    shortlistedCount: 0,
    interviewedCount: 0,
    selectedCount: 0,
    driveDate: '2026-12-10',
    location: 'Virtual Proctored Assessment',
    description: 'Pending authorization: Verifying online test proctoring guidelines and server connectivity.'
  },

  // 3. NOT AUTHORIZED / FLAGGED / REJECTED BY INSTITUTION (CRITICAL TEST CASES)
  {
    companyName: 'Apex Staffing Consultancy',
    title: 'Apex Junior Trainee Recruitment Drive 2026-27',
    role: 'Junior Operations & Data Support Trainee',
    driveType: 'ON_CAMPUS',
    packageLpa: 3.20,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'All Streams',
    minCgpa: 6.00,
    status: 'REJECTED',
    appliedCount: 0,
    shortlistedCount: 0,
    interviewedCount: 0,
    selectedCount: 0,
    driveDate: '2026-12-14',
    location: 'Campus',
    description: 'Entry-level customer operations and back-office support role submitted by Apex Staffing.',
    rejectionReason: 'Not Authorized by Institution: Proposed CTC (₹3.2 LPA) is below the institutional minimum compensation threshold of ₹4.5 LPA for Engineering graduates.'
  },
  {
    companyName: 'GlobalTech Talent Agency',
    title: 'GlobalTech Third-Party Staffing Drive 2026-27',
    role: 'Graduate Tech Associate (Contractual)',
    driveType: 'VIRTUAL_PLACEMENT',
    packageLpa: 3.60,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'CSE, IT, ECE',
    minCgpa: 6.00,
    status: 'REJECTED',
    appliedCount: 0,
    shortlistedCount: 0,
    interviewedCount: 0,
    selectedCount: 0,
    driveDate: '2026-12-18',
    location: 'Off-Campus / Remote',
    description: 'Contractual tech staffing placement drive proposed by third-party recruitment agency.',
    rejectionReason: 'Not Authorized by Institution: Third-party staffing agency without verified direct corporate employment agreement.'
  },
  {
    companyName: 'ShadowSoft Solutions',
    title: 'ShadowSoft Remote Testing Intern Drive 2026-27',
    role: 'Unproctored Remote QA Intern',
    driveType: 'VIRTUAL_PLACEMENT',
    packageLpa: 4.00,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'All Streams',
    minCgpa: 6.00,
    status: 'REJECTED',
    appliedCount: 0,
    shortlistedCount: 0,
    interviewedCount: 0,
    selectedCount: 0,
    driveDate: '2026-12-20',
    location: 'Remote Unmonitored',
    description: 'Remote QA internship proposed without standard institutional proctoring infrastructure.',
    rejectionReason: 'Not Authorized by Institution: Mandatory AI lockdown browser and verified proctoring compliance protocols unfulfilled.'
  },
  {
    companyName: 'NovaHire Talent Network',
    title: 'NovaHire Commercial Placement Drive 2026-27',
    role: 'Associate Tech Operations Trainee',
    driveType: 'ON_CAMPUS',
    packageLpa: 3.40,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'All Streams',
    minCgpa: 6.00,
    status: 'REJECTED',
    appliedCount: 0,
    shortlistedCount: 0,
    interviewedCount: 0,
    selectedCount: 0,
    driveDate: '2026-12-22',
    location: 'Campus',
    description: 'Third-party commercial recruitment slot proposal.',
    rejectionReason: 'Not Authorized by Institution: Non-compliant commercial hiring agreement violating institutional placement cell policy.'
  },

  // 4. COMPLETED DRIVES WITH RESULTS RELEASED
  {
    companyName: 'Tata Consultancy Services (TCS)',
    title: 'TCS Digital & Prime Campus Drive 2026-27',
    role: 'Digital & Prime Software Engineer',
    driveType: 'ON_CAMPUS',
    packageLpa: 11.50,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'All Engineering Streams',
    minCgpa: 7.00,
    status: 'COMPLETED',
    appliedCount: 68,
    shortlistedCount: 28,
    interviewedCount: 22,
    selectedCount: 18,
    driveDate: '2026-08-20',
    location: 'KEC Campus Placement Complex',
    description: 'Completed campus recruitment drive. 18 candidates selected for TCS Digital and Prime developer roles.'
  },
  {
    companyName: 'Infosys',
    title: 'Infosys Specialist Programmer Campus Drive 2026-27',
    role: 'Specialist Programmer & Digital Specialist Engineer',
    driveType: 'ON_CAMPUS',
    packageLpa: 13.00,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'CSE, IT, AI & DS, ECE, EEE',
    minCgpa: 7.00,
    status: 'COMPLETED',
    appliedCount: 72,
    shortlistedCount: 30,
    interviewedCount: 25,
    selectedCount: 22,
    driveDate: '2026-08-28',
    location: 'KEC Placement Auditorium',
    description: 'Completed campus drive for high-end Specialist Programmer (₹13.0 LPA) and DSE (₹9.5 LPA) profiles.'
  },
  {
    companyName: 'Soliton Technologies',
    title: 'Soliton Technologies Project Engineer Drive 2026-27',
    role: 'Project Engineer (LabVIEW & Embedded Test Automation)',
    driveType: 'ON_CAMPUS',
    packageLpa: 10.50,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'ECE, EEE, MECHATRONICS, CSE, IT',
    minCgpa: 7.20,
    status: 'COMPLETED',
    appliedCount: 34,
    shortlistedCount: 14,
    interviewedCount: 11,
    selectedCount: 9,
    driveDate: '2026-09-05',
    location: 'KEC Soliton Lab Facility',
    description: 'Completed campus drive. 9 candidates selected for embedded measurement automation and semiconductor testing platforms.'
  },
  {
    companyName: 'Cognizant',
    title: 'Cognizant GenC Next Campus Drive 2026-27',
    role: 'Full Stack & Cloud Specialist Engineer',
    driveType: 'ON_CAMPUS',
    packageLpa: 9.00,
    eligibleBatch: '2026 Batch',
    eligibleDepts: 'All Engineering Streams',
    minCgpa: 7.00,
    status: 'COMPLETED',
    appliedCount: 55,
    shortlistedCount: 22,
    interviewedCount: 16,
    selectedCount: 14,
    driveDate: '2026-09-12',
    location: 'KEC Online Lab & Auditorium',
    description: 'Completed campus recruitment drive. 14 candidates received verified GenC Next offer letters.'
  }
];

async function main() {
  console.log('--- Batch Seeding Comprehensive Placement Drives for KEC ---');

  // Fetch student IDs
  const studentRows = await runDoltSql(`USE beyon; SELECT student_id FROM institution_students WHERE institution_id = '${KEC_INST_IDS[0]}' LIMIT 60;`);
  const studentIds: string[] = [];
  const lines = studentRows.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && !trimmed.includes('student_id') && !trimmed.includes('---')) {
      const parts = trimmed.split('|').map((s) => s.trim()).filter(Boolean);
      if (parts[0] && parts[0].length === 36) {
        studentIds.push(parts[0]);
      }
    }
  }

  // Find company user ID
  const companyUserRows = await runDoltSql(`USE beyon; SELECT id FROM users WHERE role = 'COMPANY' LIMIT 1;`);
  let defaultCompanyUserId = 'b5d12228-5694-4f9e-9d29-6cf60b135b91';
  const cLines = companyUserRows.split('\n');
  for (const line of cLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && !trimmed.includes('id') && !trimmed.includes('---')) {
      const parts = trimmed.split('|').map((s) => s.trim()).filter(Boolean);
      if (parts[0] && parts[0].length === 36) {
        defaultCompanyUserId = parts[0];
        break;
      }
    }
  }

  const sqlStatements: string[] = ['USE beyon;'];

  for (const instId of KEC_INST_IDS) {
    sqlStatements.push(`DELETE FROM placement_drives WHERE institution_id = '${instId}';`);

    for (const d of DRIVES_DATA) {
      const driveId = randomUUID();
      const oppId = randomUUID();
      const reasonEscaped = d.rejectionReason ? `'${d.rejectionReason.replace(/'/g, "''")}'` : 'NULL';
      const descEscaped = `'${d.description.replace(/'/g, "''")}'`;
      const titleEscaped = `'${d.title.replace(/'/g, "''")}'`;
      const deptsEscaped = `'${d.eligibleDepts.replace(/'/g, "''")}'`;
      const batchEscaped = `'${d.eligibleBatch.replace(/'/g, "''")}'`;
      const locationEscaped = `'${d.location.replace(/'/g, "''")}'`;

      sqlStatements.push(`INSERT INTO placement_drives (
        id, opportunity_id, institution_id, company_user_id, title, description,
        status, eligible_student_count, applied_count, assessed_count, shortlisted_count,
        interviewed_count, selected_count, drive_date, package_lpa, drive_type,
        eligible_depts, eligible_batch, min_cgpa, location, rejection_reason
      ) VALUES (
        '${driveId}', '${oppId}', '${instId}', '${defaultCompanyUserId}', ${titleEscaped}, ${descEscaped},
        '${d.status}', 469, ${d.appliedCount}, ${d.appliedCount}, ${d.shortlistedCount},
        ${d.interviewedCount}, ${d.selectedCount}, '${d.driveDate}', ${d.packageLpa}, '${d.driveType}',
        ${deptsEscaped}, ${batchEscaped}, ${d.minCgpa}, ${locationEscaped}, ${reasonEscaped}
      );`);

      if ((d.status === 'APPROVED' || d.status === 'COMPLETED') && studentIds.length > 0) {
        const numApps = Math.min(d.appliedCount, studentIds.length);
        for (let i = 0; i < numApps; i++) {
          const sId = studentIds[i];
          const appId = randomUUID();
          let appStatus = 'APPLIED';
          if (d.status === 'COMPLETED') {
            if (i < d.selectedCount) appStatus = 'SELECTED';
            else if (i < d.interviewedCount) appStatus = 'INTERVIEW';
            else if (i < d.shortlistedCount) appStatus = 'SHORTLISTED';
            else appStatus = 'REJECTED';
          } else {
            if (i < d.selectedCount) appStatus = 'SHORTLISTED';
            else if (i < d.interviewedCount) appStatus = 'INTERVIEW';
            else appStatus = 'APPLIED';
          }

          sqlStatements.push(`INSERT INTO recruitment_applications (
            id, opportunity_id, student_id, institution_id, drive_id, status, notes
          ) VALUES (
            '${appId}', '${oppId}', '${sId}', '${instId}', '${driveId}', '${appStatus}', 'Applied for ${d.companyName} Campus Drive'
          ) ON DUPLICATE KEY UPDATE drive_id = '${driveId}', status = '${appStatus}';`);
        }
      }
    }
  }

  const bigSql = sqlStatements.join('\n');
  await runDoltSql(bigSql);
  console.log(`Successfully seeded ${DRIVES_DATA.length} comprehensive placement drives in one batch!`);
}

main().catch((err) => {
  console.error('Error batch seeding drives:', err);
  process.exit(1);
});
