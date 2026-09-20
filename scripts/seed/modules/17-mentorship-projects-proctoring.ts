import { doltBatch, doltQuery, esc, toUUID } from "../engine/dolt.js";
import { studentUserIds, facultyUserIds } from "./04-users.js";
import { SeededRandom } from "../utils/faker.js";
import type { SeedConfig } from "../config.js";

async function ensureRefs(): Promise<void> {
  if (studentUserIds.length === 0) {
    const srows = doltQuery("SELECT id FROM users WHERE role='STUDENT'");
    for (const r of srows) studentUserIds.push(r.id);
  }
  if (facultyUserIds.length === 0) {
    const frows = doltQuery("SELECT id FROM users WHERE role='FACULTY'");
    for (const r of frows) facultyUserIds.push(r.id);
  }
}

export async function seedMentorshipProjectsProctoring(cfg: SeedConfig): Promise<void> {
  console.log("\n🤝 Seeding mentorship networks, collaborative projects & proctoring telemetry...");

  await ensureRefs();

  const rng = new SeededRandom(cfg.seed + 6000);
  const mentorStmts: string[] = [];
  const reqStmts: string[] = [];
  const sessionStmts: string[] = [];
  const projectStmts: string[] = [];
  const proctorSessStmts: string[] = [];
  const proctorEventStmts: string[] = [];

  // 1. Seed Mentorship Profiles for KEC Faculty
  const mentorIds: string[] = [];
  for (let i = 0; i < facultyUserIds.length; i++) {
    const fId = facultyUserIds[i];
    const mId = toUUID(`beyon-mentor-${fId}`);
    mentorIds.push(mId);

    mentorStmts.push(
      `INSERT INTO mentor_profiles
        (id, user_id, company_name, job_title, experience_years, bio, expertise_skills, topics, availability, max_mentees, current_mentees, rating, total_sessions, created_at, updated_at)
       VALUES (
        ${esc(mId)}, ${esc(fId)}, 'Kongu Engineering College', 'Senior Faculty & Project Mentor', ${8 + (i % 12)},
        'Senior KEC Faculty specializing in Cloud Architecture, AI Systems, Distributed Databases, and VLSI Design.',
        'Java,Spring Boot,PostgreSQL,React,TypeScript,Python,Deep Learning,Docker',
        'System Design, Career Guidance, Research Paper Writing, Placement Architecture',
        'AVAILABLE', 10, ${rng.int(1, 5)}, 4.85, ${15 + (i * 3)}, NOW(), NOW()
       )
       ON DUPLICATE KEY UPDATE availability='AVAILABLE', rating=4.85;`
    );
  }

  // 2. Seed Mentorship Requests & Sessions for Students
  const targetStudents = studentUserIds.slice(0, 40);
  for (let i = 0; i < targetStudents.length; i++) {
    const sId = targetStudents[i];
    const mId = mentorIds[i % mentorIds.length];
    const reqId = toUUID(`beyon-mreq-${sId}`);
    const status = i % 4 === 0 ? "ACCEPTED" : i % 4 === 1 ? "COMPLETED" : i % 4 === 2 ? "ACCEPTED" : "PENDING";

    reqStmts.push(
      `INSERT INTO mentorship_requests
        (id, student_id, mentor_id, message, status, requested_at, accepted_at, completed_at)
       VALUES (
        ${esc(reqId)}, ${esc(sId)}, ${esc(mId)},
        'Requesting 1-on-1 mentorship session to resolve TypeScript and Spring Boot architectural gaps before upcoming Soliton/Zoho campus drives.',
        ${esc(status)},
        DATE_SUB(NOW(), INTERVAL ${rng.int(5, 20)} DAY),
        ${status !== "PENDING" ? `DATE_SUB(NOW(), INTERVAL ${rng.int(1, 4)} DAY)` : "NULL"},
        ${status === "COMPLETED" ? `DATE_SUB(NOW(), INTERVAL 1 DAY)` : "NULL"}
       )
       ON DUPLICATE KEY UPDATE status=${esc(status)};`
    );

    if (status === "COMPLETED" || status === "ACCEPTED") {
      const sessId = toUUID(`beyon-msess-${reqId}`);
      sessionStmts.push(
        `INSERT INTO mentorship_sessions
          (id, request_id, topic, scheduled_at, duration_minutes, meeting_link, notes, status, student_rating, mentor_feedback, created_at)
         VALUES (
          ${esc(sessId)}, ${esc(reqId)},
          'Skill Gap Remediation & System Design Blueprint Review',
          DATE_SUB(NOW(), INTERVAL ${rng.int(1, 4)} DAY),
          45,
          'https://meet.kec.edu.in/mentorship-room-101',
          'Discussed microservices transaction isolation and TypeScript strict generics.',
          ${status === "COMPLETED" ? "'COMPLETED'" : "'SCHEDULED'"},
          ${status === "COMPLETED" ? "5" : "NULL"},
          ${status === "COMPLETED" ? "'Candidate demonstrated excellent understanding of core data structures and SQL indexing.'" : "NULL"},
          NOW()
         )
         ON DUPLICATE KEY UPDATE status=${status === "COMPLETED" ? "'COMPLETED'" : "'SCHEDULED'"};`
      );
    }
  }

  // 3. Collaborative & Capstone Projects
  const projectNames = [
    { title: "AI Crop Disease Diagnostic Engine (KEC AgroTech)", tech: "Python,PyTorch,FastAPI,React", role: "AI Engineer" },
    { title: "Campus High-Throughput Placement Telemetry Radar", tech: "TypeScript,Node.js,PostgreSQL,TailwindCSS", role: "Full-Stack Lead" },
    { title: "Smart Microgrid EV Charging Controller (KEC EEE Lab)", tech: "C++,IoT,MQTT,Embedded C", role: "Embedded Systems Engineer" },
    { title: "Autonomous Edge Warehouse AGV Navigation System", tech: "ROS2,OpenCV,Python,C++", role: "Robotics Engineer" },
    { title: "Multi-Tenant Distributed Ledger for Academic Credentials", tech: "Go,Solidity,Docker,PostgreSQL", role: "Blockchain Architect" },
  ];

  for (let p = 0; p < projectNames.length; p++) {
    const pId = toUUID(`beyon-collab-proj-${p}`);
    const item = projectNames[p];
    const sId = targetStudents[p] || studentUserIds[0];
    const facultyId = facultyUserIds[p % facultyUserIds.length] || null;

    projectStmts.push(
      `INSERT INTO portfolio_projects
        (id, student_id, title, description, role, skills_used, github_url, live_demo_url, verification_status, verified_by, verified_at, verification_source, is_featured, created_at, updated_at)
       VALUES (
        ${esc(pId)}, ${esc(sId)},
        ${esc(item.title)},
        'Multi-disciplinary research and engineering prototype with industry integration and real-world testing.',
        ${esc(item.role)},
        ${esc(item.tech)},
        'https://github.com/kongu-engineering/capstone-project',
        'https://demo.kec.edu.in/projects',
        'VERIFIED',
        ${esc(facultyId)},
        DATE_SUB(NOW(), INTERVAL 30 DAY),
        'KEC Faculty Verification Committee',
        1,
        DATE_SUB(NOW(), INTERVAL 90 DAY),
        NOW()
       )
       ON DUPLICATE KEY UPDATE title=${esc(item.title)}, verification_status='VERIFIED';`
    );
  }

  // 4. Simulated Proctoring Sessions & Telemetry Events
  const proctorEventTypes = [
    { type: "FACE_VERIFIED", title: "Single Verified Face Detected", sev: "LOW", conf: 0.98 },
    { type: "MULTIPLE_FACES_DETECTED", title: "Secondary Person Detected in Camera Frame", sev: "HIGH", conf: 0.94 },
    { type: "FACE_NOT_FOUND", title: "Student Left Camera View / Candidate Absent", sev: "MEDIUM", conf: 0.92 },
    { type: "PHONE_DETECTED", title: "Mobile Device Detected in Visual Field", sev: "CRITICAL", conf: 0.89 },
    { type: "AUDIO_ANOMALY", title: "Background Whispering / Audio Anomaly", sev: "MEDIUM", conf: 0.84 },
  ];

  for (let i = 0; i < 30; i++) {
    const sId = targetStudents[i % targetStudents.length];
    const sessId = toUUID(`beyon-proctor-sess-${sId}`);
    const asId = toUUID(`beyon-mock-assess-sess-${sId}`);
    const isClean = i % 5 !== 0;
    const riskScore = isClean ? rng.int(2, 12) : rng.int(65, 95);
    const riskLevel = riskScore < 20 ? "LOW" : riskScore < 60 ? "MEDIUM" : "HIGH";

    proctorSessStmts.push(
      `INSERT INTO proctoring_sessions
        (id, assessment_session_id, candidate_id, status, mobile_paired, laptop_camera_health, laptop_mic_health, risk_score, risk_level, review_required, consent_given, started_at, completed_at, created_at, updated_at)
       VALUES (
        ${esc(sessId)}, ${esc(asId)}, ${esc(sId)}, 'COMPLETED', 1, 'GOOD', 'GOOD',
        ${riskScore}, ${esc(riskLevel)}, ${riskScore >= 60 ? 1 : 0}, 1,
        DATE_SUB(NOW(), INTERVAL ${rng.int(1, 20)} DAY),
        DATE_SUB(NOW(), INTERVAL ${rng.int(1, 20)} DAY),
        DATE_SUB(NOW(), INTERVAL ${rng.int(1, 20)} DAY),
        NOW()
       )
       ON DUPLICATE KEY UPDATE risk_score=${riskScore}, risk_level=${esc(riskLevel)};`
    );

    const event = proctorEventTypes[i % proctorEventTypes.length];
    const peId = toUUID(`beyon-pevent-${i}`);
    proctorEventStmts.push(
      `INSERT INTO proctoring_events
        (id, session_id, event_type, severity, title, description, confidence, timestamp)
       VALUES (
        ${esc(peId)}, ${esc(sessId)},
        ${esc(event.type)}, ${esc(event.sev)},
        ${esc(event.title)},
        ${esc(`Automated computer vision proctoring engine telemetry event flagged during live evaluation.`)},
        ${event.conf},
        DATE_SUB(NOW(), INTERVAL ${rng.int(1, 20)} DAY)
       )
       ON DUPLICATE KEY UPDATE event_type=${esc(event.type)}, severity=${esc(event.sev)};`
    );
  }

  doltBatch(mentorStmts);
  doltBatch(reqStmts);
  doltBatch(sessionStmts);
  doltBatch(projectStmts);
  doltBatch(proctorSessStmts);
  doltBatch(proctorEventStmts);

  console.log(`  ✅ ${mentorStmts.length} faculty mentorship profiles seeded`);
  console.log(`  ✅ ${reqStmts.length} mentorship requests and ${sessionStmts.length} sessions seeded`);
  console.log(`  ✅ ${projectStmts.length} capstone & verified collaborative projects seeded`);
  console.log(`  ✅ ${proctorSessStmts.length} proctoring sessions & ${proctorEventStmts.length} telemetry events seeded`);
}
