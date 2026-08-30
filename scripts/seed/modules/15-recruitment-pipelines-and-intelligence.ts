// ============================================================
// Module 15 — Recruitment Pipelines, Intelligence & Career Seeder
// Seeds recruitment pipelines, candidate interview stages, hiring
// preferences, learning tracks, roadmaps, academic records & feedback.
// ============================================================

import { doltBatch, esc, doltQuery, toUUID } from "../engine/dolt.js";
import { studentUserIds } from "./04-users.js";
import { companyUserIds } from "./03-companies.js";
import { institutionUserIds } from "./02-institutions.js";
import { SeededRandom } from "../utils/faker.js";
import type { SeedConfig } from "../config.js";

async function ensureRefs(): Promise<void> {
  if (studentUserIds.length === 0) {
    const srows = doltQuery("SELECT id FROM users WHERE role='STUDENT'");
    for (const r of srows) studentUserIds.push(r.id);
  }
  if (Object.keys(companyUserIds).length === 0) {
    const crows = doltQuery("SELECT id FROM users WHERE role='COMPANY'");
    let i = 0;
    for (const r of crows) {
      (companyUserIds as any)[`COMP_${String(i + 1).padStart(4, "0")}`] = r.id;
      i++;
    }
  }
  if (Object.keys(institutionUserIds).length === 0) {
    const irows = doltQuery("SELECT id FROM users WHERE role='INSTITUTION'");
    let i = 0;
    for (const r of irows) {
      (institutionUserIds as any)[`INST_${String(i + 1).padStart(4, "0")}`] = r.id;
      i++;
    }
  }
}

export async function seedRecruitmentAndIntelligence(cfg: SeedConfig): Promise<void> {
  console.log("\n💼 Seeding recruitment pipelines, candidate stages, roadmaps, and academic intelligence...");

  await ensureRefs();

  const rng = new SeededRandom(cfg.seed + 9500);
  const compIdList = Object.values(companyUserIds);
  const instIdList = Object.values(institutionUserIds);

  // ─── 1. Company Hiring Preferences & Representatives ───
  const compPrefStmts: string[] = [];
  const compRepStmts: string[] = [];

  let cpIdx = 0;
  for (const cid of compIdList) {
    const prefId = toUUID(`beyon-cpref-${cid}`);
    compPrefStmts.push(
      `INSERT INTO company_hiring_preferences (id, user_id, hiring_types, preferred_levels, recruitment_regions, created_at)
       VALUES (${esc(prefId)}, ${esc(cid)}, 'FULL_TIME,INTERNSHIP', 'ENTRY_LEVEL,MID_LEVEL', 'National,Bengaluru,Hyderabad,Chennai,Pune', NOW())
       ON DUPLICATE KEY UPDATE hiring_types='FULL_TIME,INTERNSHIP', recruitment_regions='National,Bengaluru,Hyderabad,Chennai,Pune';`
    );

    const repId = toUUID(`beyon-crep-${cid}`);
    compRepStmts.push(
      `INSERT INTO company_representatives (id, user_id, name, designation, email, phone, created_at)
       VALUES (${esc(repId)}, ${esc(cid)}, 'Siddharth Rao', 'Head of University Relations & Talent Acquisition', 'university.hiring@company.beyon.test', '+91 98401 55667', NOW())
       ON DUPLICATE KEY UPDATE name='Siddharth Rao', designation='Head of University Relations & Talent Acquisition';`
    );
    cpIdx++;
  }
  doltBatch(compPrefStmts, 50);
  doltBatch(compRepStmts, 50);
  console.log(`  ✅ ${cpIdx} company hiring preferences & HR representatives`);

  // ─── 2. Recruitment Pipelines, Applications, Interviews & Requirements ───
  const oppRows = doltQuery("SELECT id, company_user_id, title FROM company_opportunities LIMIT 20");
  const driveRows = doltQuery("SELECT id, institution_id, company_user_id FROM placement_drives LIMIT 20");
  const pipeStmts: string[] = [];
  const recAppStmts: string[] = [];
  const recIntStmts: string[] = [];
  const reqStmts: string[] = [];

  let pipeIdx = 0;
  for (const opp of oppRows) {
    const drive = driveRows[pipeIdx % driveRows.length];
    const reqId = toUUID(`beyon-creq-${opp.id}`);
    reqStmts.push(
      `INSERT INTO company_requirements (id, opportunity_id, company_id, title, description, required_skills, preferred_skills, min_cgpa, min_experience_years, coin_cost, status, created_at, updated_at)
       VALUES (${esc(reqId)}, ${esc(opp.id)}, ${esc(opp.company_user_id)}, ${esc(`${opp.title} Eligibility Criteria`)}, 'Candidate must possess strong problem-solving fundamentals, high CGPA, and zero active backlogs.', '["Java", "Spring Boot", "SQL", "DSA"]', '["Docker", "AWS", "React"]', 7.00, 0, 100, 'PUBLISHED', NOW(), NOW())
       ON DUPLICATE KEY UPDATE min_cgpa=7.00, status='PUBLISHED';`
    );

    const candidates = rng.pickN(studentUserIds, 6);
    let cStageIdx = 0;

    for (const sid of candidates) {
      const pipeId = toUUID(`beyon-pipe-${opp.id}-${sid}`);
      const STAGES = ["APPLIED", "OA_CLEARED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "OFFERED"];
      const currentStage = STAGES[cStageIdx % STAGES.length];
      const overallScore = Number((75 + rng.float(5, 20)).toFixed(2));

      pipeStmts.push(
        `INSERT INTO recruitment_pipelines (id, opportunity_id, company_id, student_id, current_stage, interview_round, overall_score, notes, created_at, updated_at)
         VALUES (${esc(pipeId)}, ${esc(opp.id)}, ${esc(opp.company_user_id)}, ${esc(sid)}, ${esc(currentStage)}, 1, ${overallScore}, 'Strong technical knowledge in microservices and algorithmic complexity.', NOW(), NOW())
         ON DUPLICATE KEY UPDATE current_stage=${esc(currentStage)}, overall_score=${overallScore};`
      );

      const recAppId = toUUID(`beyon-rapp-${opp.id}-${sid}`);
      recAppStmts.push(
        `INSERT INTO recruitment_applications (id, student_id, opportunity_id, drive_id, institution_id, status, assessment_score, interview_score, notes, coins_spent, applied_at, updated_at, created_at)
         VALUES (${esc(recAppId)}, ${esc(sid)}, ${esc(opp.id)}, ${esc(drive?.id || null)}, ${esc(drive?.institution_id || instIdList[0])}, ${esc(currentStage)}, ${overallScore}, 88.50, 'Passed proctored assessment benchmark.', 100, DATE_SUB(NOW(), INTERVAL 14 DAY), NOW(), NOW())
         ON DUPLICATE KEY UPDATE status=${esc(currentStage)}, assessment_score=${overallScore};`
      );

      if (currentStage === "INTERVIEW_SCHEDULED" || currentStage === "OFFERED") {
        const intId = toUUID(`beyon-rint-${recAppId}`);
        recIntStmts.push(
          `INSERT INTO recruitment_interviews (id, drive_id, pipeline_id, student_id, interviewer_id, interview_type, round_number, scheduled_at, duration_minutes, meeting_link, status, feedback, score, recommendation, created_at, updated_at)
           VALUES (${esc(intId)}, ${esc(drive?.id || driveRows[0]?.id)}, ${esc(pipeId)}, ${esc(sid)}, ${esc(opp.company_user_id)}, 'TECHNICAL', 1, DATE_ADD(NOW(), INTERVAL 2 DAY), 45, 'https://meet.beyon.app/interview-${intId.slice(0, 8)}', 'SCHEDULED', 'Strong knowledge of Java concurrency and distributed queues.', 88.50, 'RECOMMENDED_FOR_HIRE', NOW(), NOW())
           ON DUPLICATE KEY UPDATE status='SCHEDULED', score=88.50;`
        );
      }
      cStageIdx++;
    }
    pipeIdx++;
  }
  doltBatch(reqStmts, 50);
  doltBatch(pipeStmts, 50);
  doltBatch(recAppStmts, 50);
  doltBatch(recIntStmts, 50);
  console.log(`  ✅ ${pipeIdx} recruitment pipelines & ${recAppStmts.length} candidate stage records`);

  // ─── 3. Career Roadmaps & Milestone Items ───
  const pathRows = doltQuery("SELECT id, name FROM career_paths");
  const roadStmts: string[] = [];
  let roadIdx = 0;

  const ROADMAP_SKILLS = [
    { name: "Object-Oriented Programming & Concurrency", order: 1, state: "COMPLETED", prog: 100 },
    { name: "Data Structures & Algorithmic Complexity", order: 2, state: "COMPLETED", prog: 100 },
    { name: "Spring Boot Microservices & REST APIs", order: 3, state: "IN_PROGRESS", prog: 65 },
    { name: "SQL Indexing & Database Schema Design", order: 4, state: "IN_PROGRESS", prog: 40 },
    { name: "Distributed Systems & Message Brokers (Kafka/RabbitMQ)", order: 5, state: "LOCKED", prog: 0 },
    { name: "Docker Containers & Kubernetes Orchestration", order: 6, state: "LOCKED", prog: 0 },
  ];

  for (const s of studentUserIds.slice(0, 40)) {
    const cpathId = pathRows[roadIdx % pathRows.length]?.id || pathRows[0]?.id;
    for (const r of ROADMAP_SKILLS) {
      const roadId = toUUID(`beyon-road-${s}-${r.order}`);
      roadStmts.push(
        `INSERT INTO career_roadmap_items (id, student_id, career_path_id, skill_name, sort_order, state, progress, required_coins, created_at, updated_at)
         VALUES (${esc(roadId)}, ${esc(s)}, ${esc(cpathId)}, ${esc(r.name)}, ${r.order}, ${esc(r.state)}, ${r.prog}, 50, NOW(), NOW())
         ON DUPLICATE KEY UPDATE skill_name=${esc(r.name)}, state=${esc(r.state)}, progress=${r.prog};`
      );
      roadIdx++;
    }
  }
  doltBatch(roadStmts, 100);
  console.log(`  ✅ ${roadIdx} student career roadmap milestone items`);

  // ─── 4. Specialized Learning Programs & Modules ───
  const progStmts: string[] = [];
  const modStmts: string[] = [];
  const enrollStmts: string[] = [];

  const REAL_PROGRAMS = [
    { title: "Production Java Spring Boot 3 & Microservices Track", desc: "Comprehensive enterprise development track covering Spring Data, Spring Security, Hibernate tuning, and event-driven architecture.", type: "SPECIALIZATION", provider: "Beyon Engineering Guild", diff: "HARD", hours: 40, rating: 4.9 },
    { title: "Full-Stack React 19, TypeScript & Next.js Master Track", desc: "Modern frontend architecture: React Server Components, Tailwind CSS, Zod validation, and end-to-end testing with Playwright.", type: "BOOTCAMP", provider: "Beyon Frontend Lab", diff: "MEDIUM", hours: 35, rating: 4.85 },
    { title: "Applied Generative AI & Vector Search Engineering", desc: "Building RAG pipelines with LangChain, embedding models, Qdrant/Milvus vector databases, and evaluation frameworks.", type: "CERTIFICATION", provider: "Beyon AI Research", diff: "HARD", hours: 45, rating: 4.92 },
  ];

  let progIdx = 0;
  for (const prog of REAL_PROGRAMS) {
    const progId = toUUID(`beyon-lprog-${progIdx}`);
    progStmts.push(
      `INSERT INTO learning_programs (id, title, description, program_type, provider, difficulty, duration_hours, is_free, rating, enrolled_count, is_active, created_at)
       VALUES (${esc(progId)}, ${esc(prog.title)}, ${esc(prog.desc)}, ${esc(prog.type)}, ${esc(prog.provider)}, ${esc(prog.diff)}, ${prog.hours}, 1, ${prog.rating}, 180, 1, NOW())
       ON DUPLICATE KEY UPDATE title=${esc(prog.title)}, description=${esc(prog.desc)}, rating=${prog.rating};`
    );

    for (let m = 1; m <= 4; m++) {
      const modId = toUUID(`beyon-lmod-${progIdx}-${m}`);
      modStmts.push(
        `INSERT INTO learning_program_modules (id, program_id, title, description, sort_order, module_type, duration_minutes, created_at)
         VALUES (${esc(modId)}, ${esc(progId)}, ${esc(`Module ${m}: Core Fundamentals & Architecture`)}, ${esc(`In-depth practical labs for module ${m}`)}, ${m}, 'VIDEO_LAB', 90, NOW())
         ON DUPLICATE KEY UPDATE sort_order=${m};`
      );
    }

    const enrolled = rng.pickN(studentUserIds, 25);
    for (const sid of enrolled) {
      const enrId = toUUID(`beyon-lenr-${progId}-${sid}`);
      enrollStmts.push(
        `INSERT IGNORE INTO learning_program_enrollments (id, student_id, program_id, progress_percent, modules_completed, status, enrolled_at)
         VALUES (${esc(enrId)}, ${esc(sid)}, ${esc(progId)}, 75, 3, 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 10 DAY));`
      );
    }
    progIdx++;
  }
  doltBatch(progStmts, 50);
  doltBatch(modStmts, 50);
  doltBatch(enrollStmts, 50);
  console.log(`  ✅ ${progIdx} learning programs, ${modStmts.length} modules, and ${enrollStmts.length} student enrollments`);

  // ─── 5. Student Academic Records ───
  const acadStmts: string[] = [];
  let acIdx = 0;
  for (const sid of studentUserIds) {
    const instId = instIdList[acIdx % instIdList.length];
    const acadId = toUUID(`beyon-acad-${sid}`);
    const cgpa = Number((7.8 + rng.float(0, 1.9)).toFixed(2));

    acadStmts.push(
      `INSERT INTO student_academic_records (id, student_id, institution_id, semester, academic_year, cgpa, total_credits, department, graduation_year, created_at, updated_at)
       VALUES (${esc(acadId)}, ${esc(sid)}, ${esc(instId)}, 7, '2025-2026', ${cgpa}, 148, 'Computer Science and Engineering', 2026, NOW(), NOW())
       ON DUPLICATE KEY UPDATE cgpa=${cgpa}, total_credits=148;`
    );
    acIdx++;
  }
  doltBatch(acadStmts, 100);
  console.log(`  ✅ ${acIdx} student verified academic records`);

  // ─── 6. User Feedback & Support Tickets ───
  const fbStmts: string[] = [];
  const FEEDBACK_ITEMS = [
    { cat: "ASSESSMENT", sub: "Proctoring camera permission flow feedback", msg: "The hardware lock check and camera framing worked smoothly during the mock test. Would love audio calibration feedback as well.", stat: "RESOLVED", rat: 5, resp: "Thank you for the feedback! Audio volume threshold indicators are now included in the pre-flight checks." },
    { cat: "PRACTICE", sub: "Daily Challenge Streak Rewards", msg: "Daily challenge XP and coin balance update seamlessly. Suggest adding weekly streak milestone bonuses.", stat: "IN_PROGRESS", rat: 5, resp: "Great suggestion! Streak freeze and weekend milestone bonus multipliers are being rolled out." },
    { cat: "COMMUNITY", sub: "Discussion search filter by skill tags", msg: "Can we have multi-tag filtering in the community discussion search?", stat: "OPEN", rat: 4, resp: null },
  ];

  let fbIdx = 0;
  for (const fb of FEEDBACK_ITEMS) {
    const fbId = toUUID(`beyon-fb-${fbIdx}`);
    const uid = studentUserIds[fbIdx % studentUserIds.length];
    fbStmts.push(
      `INSERT INTO user_feedback (id, user_id, category, subject, message, status, rating, response, created_at, updated_at)
       VALUES (${esc(fbId)}, ${esc(uid)}, ${esc(fb.cat)}, ${esc(fb.sub)}, ${esc(fb.msg)}, ${esc(fb.stat)}, ${fb.rat}, ${esc(fb.resp)}, NOW(), NOW())
       ON DUPLICATE KEY UPDATE status=${esc(fb.stat)}, rating=${fb.rat};`
    );
    fbIdx++;
  }
  doltBatch(fbStmts, 50);
  console.log(`  ✅ ${fbIdx} user feedback and support intelligence records`);
}
