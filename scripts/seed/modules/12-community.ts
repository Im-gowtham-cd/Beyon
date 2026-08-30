// ============================================================
// Module 12 — Comprehensive Community & Ecosystem Seeder
// Populates discussions, social posts, events, challenges, projects,
// mentorship, research proposals, and entity posts.
// ============================================================

import { doltBatch, esc, doltQuery, toUUID } from "../engine/dolt.js";
import { studentUserIds } from "./04-users.js";
import { companyUserIds } from "./03-companies.js";
import { institutionUserIds } from "./02-institutions.js";
import { SeededRandom } from "../utils/faker.js";
import type { SeedConfig } from "../config.js";

async function ensureCommunityRefs(): Promise<void> {
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

export async function seedCommunity(cfg: SeedConfig): Promise<void> {
  console.log("\n💬 Seeding comprehensive community & ecosystem data...");

  await ensureCommunityRefs();

  const rng = new SeededRandom(cfg.seed + 8000);
  const compUserIdList = Object.values(companyUserIds);
  const instUserIdList = Object.values(institutionUserIds);

  // ─── 1. Follow Relationships ───
  const followStmts: string[] = [];
  let followCount = 0;
  const followUsed = new Set<string>();

  for (const studentId of studentUserIds) {
    const numFollows = rng.int(2, Math.min(6, compUserIdList.length));
    const followed = rng.pickN(compUserIdList, numFollows);
    for (const compId of followed) {
      const key = `${studentId}::${compId}`;
      if (followUsed.has(key)) continue;
      followUsed.add(key);
      const id = toUUID(`beyon-follow-${followCount}`);
      const daysAgo = rng.int(1, 350);
      followStmts.push(
        `INSERT IGNORE INTO follows (id, follower_id, following_id, follow_type, created_at)
         VALUES (${esc(id)}, ${esc(studentId)}, ${esc(compId)}, 'COMPANY', DATE_SUB(NOW(), INTERVAL ${daysAgo} DAY));`
      );
      followCount++;
    }
  }
  doltBatch(followStmts, 200);
  console.log(`  ✅ ${followCount} follow relationships`);

  // ─── 2. Discussion Categories, Threads & Replies ───
  const catRows = doltQuery("SELECT id, slug, name FROM discussion_categories");
  const catIds = catRows.map(r => r.id);
  const threadStmts: string[] = [];
  const replyStmts: string[] = [];

  const REAL_THREADS = [
    { title: "Best roadmap for cracking SDE-1 backend roles in 2026?", cat: "career", content: "I am preparing for upcoming campus placement drives. How should I balance DSA on LeetCode with Spring Boot / microservices and System Design fundamentals?", tags: '["career", "backend", "interview", "java"]' },
    { title: "Understanding React 19 Server Components vs Client Components", cat: "frontend", content: "Can someone share a clear architectural breakdown of when to declare 'use client' versus keeping components as Server Components in Next.js?", tags: '["react", "nextjs", "javascript"]' },
    { title: "How to master Dynamic Programming for Tier-1 online assessments?", cat: "dsa", content: "What is the best structured method to identify optimal subproblems and state transitions in 2D DP problems?", tags: '["dsa", "algorithms", "dp"]' },
    { title: "PostgreSQL Index Tuning — B-Tree vs GIN for JSONB", cat: "database", content: "We have an entity audit table processing 50k writes/min with JSON payloads. Which index strategy gave you the best throughput?", tags: '["sql", "postgres", "performance"]' },
    { title: "Kafka Partitioning and Consumer Group Lag Handling", cat: "system-design", content: "How do you handle rebalancing storms when autoscaling Kafka consumer instances under sudden spikes in event traffic?", tags: '["kafka", "systemdesign", "distributed"]' },
    { title: "Docker Multi-stage Builds for Java Spring Boot apps", cat: "devops", content: "Sharing our multi-stage Dockerfile that brought our Spring Boot 3 image size from 650MB down to 140MB using Eclipse Temurin JRE alpine.", tags: '["docker", "springboot", "devops"]' },
    { title: "Fine-tuning Small Language Models (SLMs) on local GPUs", cat: "ai-ml", content: "Has anyone benchmarked QLoRA 4-bit quantization on Llama 3 vs Mistral for custom legal/resume extraction tasks?", tags: '["ai", "llm", "python"]' },
    { title: "Tips for passing the Beyon Proctored Assessment with 95%+ score", cat: "assessments", content: "A summary of the core topics that appeared on the hardware lockdown assessment: concurrency, memory models, and transactional isolation.", tags: '["beyon", "assessment", "placement"]' },
  ];

  let threadIdx = 0;
  for (const t of REAL_THREADS) {
    const threadId = toUUID(`beyon-thread-${threadIdx}`);
    const authorId = rng.pick(studentUserIds);
    const catId = catIds[threadIdx % catIds.length] || catIds[0];
    const views = rng.int(80, 1400);
    const likes = rng.int(15, 180);
    const repliesCount = rng.int(2, 6);
    const daysAgo = rng.int(2, 60);

    threadStmts.push(
      `INSERT INTO discussion_threads (id, category_id, author_id, title, content, tags, reply_count, view_count, like_count, is_pinned, is_locked, solved, created_at, updated_at)
       VALUES (${esc(threadId)}, ${esc(catId)}, ${esc(authorId)}, ${esc(t.title)}, ${esc(t.content)}, ${esc(t.tags)}, ${repliesCount}, ${views}, ${likes}, 0, 0, 1, DATE_SUB(NOW(), INTERVAL ${daysAgo} DAY), NOW())
       ON DUPLICATE KEY UPDATE title=${esc(t.title)}, content=${esc(t.content)}, view_count=${views}, like_count=${likes};`
    );

    for (let r = 0; r < repliesCount; r++) {
      const replyId = toUUID(`beyon-reply-${threadIdx}-${r}`);
      const rAuthorId = rng.pick(studentUserIds.filter(id => id !== authorId));
      const rLikes = rng.int(3, 45);
      const isAccepted = r === 0 ? 1 : 0;
      const rDaysAgo = Math.max(1, daysAgo - rng.int(1, 5));
      const sampleReplies = [
        "Focus on 150 standard LeetCode patterns rather than grinding 800 random problems. Make sure to implement concurrency in Spring Boot projects.",
        "Great insights! Multi-stage builds with JLink also strip unused JDK modules.",
        "For DP, always start by drawing the recursion tree and identifying overlapping state variables before writing iterative memoization.",
        "Make sure to test under actual network partitions using Toxiproxy to verify your fallback circuit breakers.",
        "This solved our exact latency bottleneck in staging! Appreciate the detailed explanation."
      ];
      replyStmts.push(
        `INSERT INTO discussion_replies (id, thread_id, author_id, content, like_count, is_accepted_answer, created_at, updated_at)
         VALUES (${esc(replyId)}, ${esc(threadId)}, ${esc(rAuthorId)}, ${esc(sampleReplies[r % sampleReplies.length])}, ${rLikes}, ${isAccepted}, DATE_SUB(NOW(), INTERVAL ${rDaysAgo} DAY), NOW())
         ON DUPLICATE KEY UPDATE content=${esc(sampleReplies[r % sampleReplies.length])}, like_count=${rLikes};`
      );
    }
    threadIdx++;
  }
  doltBatch(threadStmts, 50);
  doltBatch(replyStmts, 50);
  console.log(`  ✅ ${threadIdx} discussion threads & ${replyStmts.length} replies`);

  // ─── 3. Events & Hackathons ───
  const eventStmts: string[] = [];
  const eventRegStmts: string[] = [];
  const REAL_EVENTS = [
    { title: "National Inter-College AI Hackathon 2026", desc: "Build agentic AI systems and distributed LLM applications. Grand prize 5 Lakhs INR + Direct interview fast-tracks with top product firms.", type: "HACKATHON", speaker: "Dr. Arvind Ramesh (Head of AI Research)", capacity: 500, regCount: 384, isOnline: 1, loc: "Virtual Campus / Beyon Arena", daysFromNow: 12, coin: 250, xp: 500 },
    { title: "Full-Stack System Design Masterclass & AMA", desc: "Live walkthrough of high-throughput distributed microservices, Redis caching hierarchies, and database sharding patterns.", type: "WORKSHOP", speaker: "Kavitha Sundaram (Principal Architect @ TechGiant)", capacity: 300, regCount: 260, isOnline: 1, loc: "Zoom Live Stream", daysFromNow: 5, coin: 100, xp: 200 },
    { title: "Tier-1 Tech Campus Placement Drive Bootcamp", desc: "Intensive 3-day technical training on DSA recursion, tree traversals, live mock interviews, and resume optimization.", type: "BOOTCAMP", speaker: "Placement Advisory Board", capacity: 400, regCount: 390, isOnline: 0, loc: "Main Auditorium & Hybrid Stream", daysFromNow: -10, coin: 150, xp: 300 },
    { title: "Google Cloud & Kubernetes Deployment Workshop", desc: "Hands-on container orchestration, CI/CD pipeline automation with GitHub Actions, and production observability with Prometheus.", type: "WEBINAR", speaker: "Rohit Verma (GCP Certified Fellow)", capacity: 250, regCount: 215, isOnline: 1, loc: "Beyon Virtual Classroom", daysFromNow: 18, coin: 75, xp: 150 },
    { title: "Cybersecurity & Secure Software Engineering Summit", desc: "Defending enterprise APIs against OWASP Top 10 vulnerabilities, JWT attack vectors, and SQL injection prevention.", type: "SUMMIT", speaker: "Ananya Iyer (Chief Information Security Officer)", capacity: 200, regCount: 180, isOnline: 1, loc: "Virtual Stage", daysFromNow: 25, coin: 120, xp: 250 },
  ];

  let eventIdx = 0;
  for (const ev of REAL_EVENTS) {
    const eventId = toUUID(`beyon-event-${eventIdx}`);
    const organizerId = instUserIdList[eventIdx % instUserIdList.length] || compUserIdList[0];
    const eventDateSql = ev.daysFromNow >= 0 ? `DATE_ADD(CURDATE(), INTERVAL ${ev.daysFromNow} DAY)` : `DATE_SUB(CURDATE(), INTERVAL ${Math.abs(ev.daysFromNow)} DAY)`;
    const status = ev.daysFromNow >= 0 ? "UPCOMING" : "COMPLETED";

    eventStmts.push(
      `INSERT INTO events (id, organizer_id, organizer_type, title, description, event_type, speaker_name, event_date, start_time, end_time, capacity, registered_count, is_online, location, meeting_link, coin_reward, xp_reward, certificate_provided, status, created_at, updated_at)
       VALUES (${esc(eventId)}, ${esc(organizerId)}, 'INSTITUTION', ${esc(ev.title)}, ${esc(ev.desc)}, ${esc(ev.type)}, ${esc(ev.speaker)}, ${eventDateSql}, '10:00:00', '16:00:00', ${ev.capacity}, ${ev.regCount}, ${ev.isOnline}, ${esc(ev.loc)}, 'https://meet.beyon.app/event-${eventId.slice(0, 8)}', ${ev.coin}, ${ev.xp}, 1, ${esc(status)}, NOW(), NOW())
       ON DUPLICATE KEY UPDATE title=${esc(ev.title)}, description=${esc(ev.desc)}, registered_count=${ev.regCount}, status=${esc(status)};`
    );

    // Register sample students
    const registeredStudents = rng.pickN(studentUserIds, Math.min(25, studentUserIds.length));
    for (const sid of registeredStudents) {
      const regId = toUUID(`beyon-ereg-${eventId}-${sid}`);
      eventRegStmts.push(
        `INSERT IGNORE INTO event_registrations (id, event_id, student_id, status, registered_at)
         VALUES (${esc(regId)}, ${esc(eventId)}, ${esc(sid)}, 'REGISTERED', DATE_SUB(NOW(), INTERVAL 5 DAY));`
      );
    }
    eventIdx++;
  }
  doltBatch(eventStmts, 50);
  doltBatch(eventRegStmts, 100);
  console.log(`  ✅ ${eventIdx} events & ${eventRegStmts.length} registrations`);

  // ─── 4. Industry Challenges ───
  const chalStmts: string[] = [];
  const chalPartStmts: string[] = [];
  const REAL_CHALLENGES = [
    { title: "Real-Time Distributed Financial Fraud Detection Engine", desc: "Build an event-driven stream processor capable of scoring 100,000 banking transactions/second for fraudulent velocity patterns with <10ms latency.", diff: "HARD", skills: "Java, Kafka, Redis, Machine Learning", coin: 500, xp: 1000, badge: "Master Architect", days: 20 },
    { title: "High-Performance Next.js & WebAssembly Image Processing Studio", desc: "Develop an in-browser WebAssembly canvas filter application with hardware GPU shaders and Web Workers.", diff: "MEDIUM", skills: "TypeScript, React, Rust, WebAssembly", coin: 300, xp: 600, badge: "WASM Champion", days: 15 },
    { title: "Cloud-Native Multi-Tenant SaaS Billing & Metering Pipeline", desc: "Design a resilient subscription billing engine handling idempotent Stripe webhooks, prorated usage metering, and invoice generation.", diff: "HARD", skills: "Go, PostgreSQL, Docker, Stripe API", coin: 450, xp: 900, badge: "Cloud Titan", days: 25 },
    { title: "Automated Accessibility & Performance CI/CD Audit CLI", desc: "Create a CLI tool that parses DOM trees for WCAG 2.1 compliance and generates actionable GitHub PR comment reports.", diff: "EASY", skills: "Node.js, TypeScript, Cheerio, CLI", coin: 200, xp: 400, badge: "A11y Pioneer", days: 10 },
  ];

  let chalIdx = 0;
  for (const ch of REAL_CHALLENGES) {
    const chalId = toUUID(`beyon-chal-${chalIdx}`);
    const organizerId = compUserIdList[chalIdx % compUserIdList.length];
    const deadlineSql = `DATE_ADD(NOW(), INTERVAL ${ch.days} DAY)`;

    chalStmts.push(
      `INSERT INTO industry_challenges (id, organizer_id, organizer_type, title, description, problem_statement, required_skills, difficulty, rules, deadline, min_team_size, max_team_size, coin_reward, xp_reward, badge_name, certificate_provided, status, created_at, updated_at)
       VALUES (${esc(chalId)}, ${esc(organizerId)}, 'COMPANY', ${esc(ch.title)}, ${esc(ch.desc)}, ${esc(ch.desc)}, ${esc(ch.skills)}, ${esc(ch.diff)}, 'Original work only. Open-source under MIT.', ${deadlineSql}, 1, 4, ${ch.coin}, ${ch.xp}, ${esc(ch.badge)}, 1, 'ACTIVE', NOW(), NOW())
       ON DUPLICATE KEY UPDATE title=${esc(ch.title)}, description=${esc(ch.desc)}, status='ACTIVE';`
    );

    const participants = rng.pickN(studentUserIds, Math.min(15, studentUserIds.length));
    for (const sid of participants) {
      const partId = toUUID(`beyon-cpart-${chalId}-${sid}`);
      chalPartStmts.push(
        `INSERT IGNORE INTO challenge_participations (id, challenge_id, student_id, status, registered_at, total_score)
         VALUES (${esc(partId)}, ${esc(chalId)}, ${esc(sid)}, 'PARTICIPATING', DATE_SUB(NOW(), INTERVAL 3 DAY), ${rng.int(65, 95)});`
      );
    }
    chalIdx++;
  }
  doltBatch(chalStmts, 50);
  doltBatch(chalPartStmts, 100);
  console.log(`  ✅ ${chalIdx} industry challenges & ${chalPartStmts.length} participants`);

  // ─── 5. Industry Projects & Teams ───
  const projStmts: string[] = [];
  const projTeamStmts: string[] = [];
  const REAL_PROJECTS = [
    { title: "Autonomous Drone Flight Telemetry & Obstacle Avoidance", desc: "Collaborative project with Aerospace research lab implementing sensor fusion (LiDAR + IMU) and Kalman filters on embedded Linux.", diff: "HARD", skills: "C++, ROS2, Embedded Linux, Computer Vision", duration: 8, maxPart: 6, coin: 400, xp: 800 },
    { title: "Decentralized Credential Verification Ledger on Polygon", desc: "Smart contract infrastructure for issuing and verifying academic degree certificates with zero-knowledge proof privacy.", diff: "MEDIUM", skills: "Solidity, Ethereum, Web3.js, React", duration: 6, maxPart: 4, coin: 300, xp: 600 },
    { title: "Enterprise Microservices Telemetry & Distributed Tracing", desc: "Implementing OpenTelemetry collectors, Jaeger visualization, and Prometheus alerting across Kubernetes clusters.", diff: "HARD", skills: "Go, Kubernetes, OpenTelemetry, Grafana", duration: 10, maxPart: 8, coin: 500, xp: 1000 },
    { title: "AI-Powered Medical Image Segmentation for Lung Pathology", desc: "U-Net convolutional neural network trained on CT scan datasets with DICOM preprocessing and model explainability.", diff: "HARD", skills: "Python, PyTorch, OpenCV, Flask", duration: 12, maxPart: 5, coin: 600, xp: 1200 },
  ];

  let projIdx = 0;
  for (const pr of REAL_PROJECTS) {
    const projId = toUUID(`beyon-proj-${projIdx}`);
    const companyId = compUserIdList[projIdx % compUserIdList.length];

    projStmts.push(
      `INSERT INTO industry_projects (id, company_id, title, description, required_skills, difficulty, duration_weeks, max_participants, current_participants, coin_reward, xp_reward, certificate_provided, status, created_at, updated_at)
       VALUES (${esc(projId)}, ${esc(companyId)}, ${esc(pr.title)}, ${esc(pr.desc)}, ${esc(pr.skills)}, ${esc(pr.diff)}, ${pr.duration}, ${pr.maxPart}, 3, ${pr.coin}, ${pr.xp}, 1, 'ACTIVE', NOW(), NOW())
       ON DUPLICATE KEY UPDATE title=${esc(pr.title)}, description=${esc(pr.desc)}, status='ACTIVE';`
    );

    const leaderId = rng.pick(studentUserIds);
    const teamId = toUUID(`beyon-pteam-${projIdx}`);
    projTeamStmts.push(
      `INSERT IGNORE INTO project_teams (id, project_id, name, leader_id, status, created_at)
       VALUES (${esc(teamId)}, ${esc(projId)}, ${esc(`Team Alpha ${projIdx + 1}`)}, ${esc(leaderId)}, 'FORMING', NOW());`
    );
    projIdx++;
  }
  doltBatch(projStmts, 50);
  doltBatch(projTeamStmts, 50);
  console.log(`  ✅ ${projIdx} industry projects & teams`);

  // ─── 6. Mentorship Network ───
  const mentorStmts: string[] = [];
  const mentorReqStmts: string[] = [];
  const REAL_MENTORS = [
    { company: "Google", title: "Staff Software Engineer", exp: 11, skills: "System Design, Java, Distributed Systems, Cloud Architecture", bio: "Passionate about mentoring students for FAANG technical interviews and large-scale distributed systems.", rating: 4.95, sessions: 48 },
    { company: "Microsoft", title: "Principal Product Manager", exp: 9, skills: "Product Management, System Architecture, Agile, AI Strategy", bio: "Helping engineering students transition to high-impact software engineering and product leadership roles.", rating: 4.88, sessions: 35 },
    { company: "Amazon", title: "Senior SDE (AWS Infrastructure)", exp: 8, skills: "Cloud Native, Go, Kubernetes, Serverless, DynamoDB", bio: "Mentored 100+ graduates into cloud engineering careers. Let us optimize your portfolio and problem-solving speed.", rating: 4.92, sessions: 62 },
    { company: "Uber", title: "Lead Machine Learning Engineer", exp: 7, skills: "PyTorch, Deep Learning, MLOps, Computer Vision, Transformers", bio: "Hands-on guide for applied AI research papers, Kaggle competitions, and ML production pipelines.", rating: 4.85, sessions: 29 },
  ];

  let mentorIdx = 0;
  for (const m of REAL_MENTORS) {
    const mentorUserId = compUserIdList[mentorIdx % compUserIdList.length];
    const mentorId = toUUID(`beyon-mentor-${mentorIdx}`);

    mentorStmts.push(
      `INSERT INTO mentor_profiles (id, user_id, company_name, job_title, experience_years, bio, expertise_skills, topics, availability, max_mentees, current_mentees, rating, total_sessions, created_at, updated_at)
       VALUES (${esc(mentorId)}, ${esc(mentorUserId)}, ${esc(m.company)}, ${esc(m.title)}, ${m.exp}, ${esc(m.bio)}, ${esc(m.skills)}, ${esc(m.skills)}, 'AVAILABLE', 10, 4, ${m.rating}, ${m.sessions}, NOW(), NOW())
       ON DUPLICATE KEY UPDATE company_name=${esc(m.company)}, job_title=${esc(m.title)}, rating=${m.rating}, total_sessions=${m.sessions};`
    );

    const requestingStudents = rng.pickN(studentUserIds, 3);
    for (const sid of requestingStudents) {
      const reqId = toUUID(`beyon-mreq-${mentorIdx}-${sid}`);
      mentorReqStmts.push(
        `INSERT IGNORE INTO mentorship_requests (id, student_id, mentor_id, message, status, requested_at)
         VALUES (${esc(reqId)}, ${esc(sid)}, ${esc(mentorId)}, 'Looking for mentorship on system design interviews and backend scalability.', 'ACCEPTED', DATE_SUB(NOW(), INTERVAL 7 DAY));`
      );
    }
    mentorIdx++;
  }
  doltBatch(mentorStmts, 50);
  doltBatch(mentorReqStmts, 50);
  console.log(`  ✅ ${mentorIdx} mentor profiles & ${mentorReqStmts.length} mentorship requests`);

  // ─── 7. Research Proposals ───
  const researchStmts: string[] = [];
  const REAL_RESEARCH = [
    { title: "Zero-Knowledge Proofs for Verifiable AI Model Inference", domain: "Applied Cryptography & AI", outcome: "Publish peer-reviewed conference paper and open-source verification library for proving LLM inference correctness.", duration: 24, budget: 150000.00 },
    { title: "Edge-AI Neuromorphic Computing for Ultra-Low Power Wearables", domain: "Embedded Systems & Hardware", outcome: "Working silicon prototype on RISC-V architecture demonstrating sub-milliwatt keyword spotting.", duration: 36, budget: 280000.00 },
    { title: "Formal Verification of Smart Contract Financial Protocols", domain: "Blockchain Security", outcome: "Automated theorem proving toolkit targeting EVM bytecode invariants to prevent reentrancy exploits.", duration: 16, budget: 120000.00 },
  ];

  let resIdx = 0;
  for (const r of REAL_RESEARCH) {
    const resId = toUUID(`beyon-research-${resIdx}`);
    const proposerId = instUserIdList[resIdx % instUserIdList.length] || studentUserIds[0];

    researchStmts.push(
      `INSERT INTO research_proposals (id, proposer_id, proposer_type, title, description, domain, required_skills, expected_outcome, duration_weeks, budget_amount, max_participants, status, created_at, updated_at)
       VALUES (${esc(resId)}, ${esc(proposerId)}, 'INSTITUTION', ${esc(r.title)}, ${esc(r.outcome)}, ${esc(r.domain)}, 'C++, Mathematics, Research Methodology', ${esc(r.outcome)}, ${r.duration}, ${r.budget}, 6, 'OPEN', NOW(), NOW())
       ON DUPLICATE KEY UPDATE title=${esc(r.title)}, domain=${esc(r.domain)}, status='OPEN';`
    );
    resIdx++;
  }
  doltBatch(researchStmts, 50);
  console.log(`  ✅ ${resIdx} research proposals`);

  // ─── 8. Entity Posts (Feeds) ───
  const entityPostStmts: string[] = [];
  const REAL_ENTITY_POSTS = [
    { title: "2026 Campus Hiring Drive Announced for Software Engineers", content: "We are thrilled to launch our 2026 campus recruitment program across premier institutions on Beyon. Open roles: SDE-1, Cloud Engineer, and AI Specialist.", type: "COMPANY", entityId: compUserIdList[0], likes: 142, comments: 28 },
    { title: "Placement Season Milestone: 94.8% Placement Record Achieved", content: "Congratulations to our graduating batch of 2026! Over 120+ top-tier product and consulting companies participated in our campus drives with an average CTC of 14.8 LPA.", type: "INSTITUTION", entityId: instUserIdList[0], likes: 310, comments: 45 },
    { title: "Hackathon Registration Now Open — HackBeyon 2026", content: "Join over 2,000 developers competing in our annual flagship 48-hour hackathon. Mentors from Google, Microsoft, and Amazon will be conducting live office hours.", type: "INSTITUTION", entityId: instUserIdList[1] || instUserIdList[0], likes: 215, comments: 19 },
    { title: "Tech Talk: Building Scalable Vector Search Engines with Qdrant", content: "Join us this Friday for a deep dive into HNSW index structures, cosine similarity optimizations, and real-time RAG architectures.", type: "COMPANY", entityId: compUserIdList[1] || compUserIdList[0], likes: 88, comments: 12 },
  ];

  let epIdx = 0;
  for (const ep of REAL_ENTITY_POSTS) {
    const epId = toUUID(`beyon-epost-${epIdx}`);
    entityPostStmts.push(
      `INSERT INTO entity_posts (id, entity_id, entity_type, post_type, title, content, like_count, comment_count, visibility, created_at)
       VALUES (${esc(epId)}, ${esc(ep.entityId || compUserIdList[0])}, ${esc(ep.type)}, 'ANNOUNCEMENT', ${esc(ep.title)}, ${esc(ep.content)}, ${ep.likes}, ${ep.comments}, 'PUBLIC', NOW())
       ON DUPLICATE KEY UPDATE title=${esc(ep.title)}, content=${esc(ep.content)}, like_count=${ep.likes};`
    );
    epIdx++;
  }
  doltBatch(entityPostStmts, 50);
  console.log(`  ✅ ${epIdx} entity posts`);

  // ─── 9. Content Resources & Learning Materials ───
  const resStmts: string[] = [];
  const REAL_RESOURCES = [
    { title: "The Ultimate System Design Cheatsheet for Freshers", desc: "Detailed diagrams covering Load Balancers, Distributed Caching, CAP Theorem, Sharding, and Rate Limiters.", type: "DOCUMENT", url: "https://docs.beyon.app/system-design-cheatsheet.pdf", diff: "MEDIUM", rating: 4.9, views: 3200, bookmarks: 890 },
    { title: "Spring Boot 3.4 & Microservices Production Blueprint", desc: "Complete source code guide for OAuth2 JWT security, Hibernate 6 optimizations, and RabbitMQ message queues.", type: "CODE_REPOSITORY", url: "https://github.com/beyon/spring-boot-starter-kit", diff: "HARD", rating: 4.8, views: 2400, bookmarks: 650 },
    { title: "Mastering LeetCode Top 150 Patterns in Python & Java", desc: "Step-by-step video walkthrough of two pointers, sliding window, topological sort, and trie structures.", type: "VIDEO", url: "https://videos.beyon.app/dsa-masterclass", diff: "MEDIUM", rating: 4.95, views: 5100, bookmarks: 1420 },
    { title: "Docker & Kubernetes Production Deployment Handbook", desc: "Hands-on guide to container security, multi-stage Dockerfiles, Helm charts, and Ingress controllers.", type: "DOCUMENT", url: "https://docs.beyon.app/kubernetes-handbook.pdf", diff: "EASY", rating: 4.7, views: 1800, bookmarks: 410 },
  ];

  let crIdx = 0;
  for (const cr of REAL_RESOURCES) {
    const crId = toUUID(`beyon-cres-${crIdx}`);
    const authorId = compUserIdList[crIdx % compUserIdList.length] || studentUserIds[0];
    resStmts.push(
      `INSERT INTO content_resources (id, author_id, resource_type, title, description, url, difficulty, is_free, view_count, bookmark_count, rating, status, created_at, updated_at)
       VALUES (${esc(crId)}, ${esc(authorId)}, ${esc(cr.type)}, ${esc(cr.title)}, ${esc(cr.desc)}, ${esc(cr.url)}, ${esc(cr.diff)}, 1, ${cr.views}, ${cr.bookmarks}, ${cr.rating}, 'PUBLISHED', NOW(), NOW())
       ON DUPLICATE KEY UPDATE title=${esc(cr.title)}, description=${esc(cr.desc)}, view_count=${cr.views}, bookmark_count=${cr.bookmarks};`
    );
    crIdx++;
  }
  doltBatch(resStmts, 50);
  console.log(`  ✅ ${crIdx} content resources`);
}
