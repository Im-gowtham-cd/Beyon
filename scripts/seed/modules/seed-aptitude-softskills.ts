import mysql from "mysql2/promise";
import crypto from "crypto";

function toUUID(str: string): string {
  const hash = crypto.createHash("md5").update(str).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`.toLowerCase();
}

export interface QuestionSeedDef {
  skillSlug: string;
  title: string;
  description: string;
  type: "MCQ" | "SQL" | "CODING";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  explanation: string;
  options: { text: string; correct: boolean }[];
}

export const APTITUDE_AND_SOFTSKILLS_QUESTIONS: QuestionSeedDef[] = [
  // ==========================================
  // 1. QUANTITATIVE APTITUDE (problemsolving)
  // ==========================================
  {
    skillSlug: "problemsolving",
    title: "Work and Time: Sprint Velocity Proportions",
    description: "If 12 software engineers can complete a designated sprint backlog in 10 working days, how many engineers working at the identical pace are required to finish the same backlog in 6 working days?",
    type: "MCQ",
    difficulty: "EASY",
    explanation: "Total Work = Workers * Days = 12 * 10 = 120 engineer-days. To complete in 6 days: Required Engineers = 120 / 6 = 20 engineers.",
    options: [
      { text: "20 engineers", correct: true },
      { text: "18 engineers", correct: false },
      { text: "24 engineers", correct: false },
      { text: "16 engineers", correct: false },
    ],
  },
  {
    skillSlug: "problemsolving",
    title: "Commercial Math: Promotional Discount Markup",
    description: "An annual cloud developer seat is sold for $120 after a promotional discount of 20% off the standard list price. What was the original list price of the subscription?",
    type: "MCQ",
    difficulty: "EASY",
    explanation: "Let original price be P. P * (1 - 0.20) = $120 => 0.8P = 120 => P = 120 / 0.8 = $150.",
    options: [
      { text: "$150", correct: true },
      { text: "$144", correct: false },
      { text: "$160", correct: false },
      { text: "$135", correct: false },
    ],
  },
  {
    skillSlug: "problemsolving",
    title: "Ratio and Proportion: Memory Allocation Split",
    description: "A server with 64 GB of total RAM allocates memory among three services (Web, Cache, Database) in the ratio 3 : 5 : 8. How many gigabytes of RAM does the Database service receive?",
    type: "MCQ",
    difficulty: "EASY",
    explanation: "Total parts = 3 + 5 + 8 = 16 parts. One part = 64 GB / 16 = 4 GB. Database allocation = 8 parts * 4 GB = 32 GB.",
    options: [
      { text: "32 GB", correct: true },
      { text: "28 GB", correct: false },
      { text: "36 GB", correct: false },
      { text: "24 GB", correct: false },
    ],
  },
  {
    skillSlug: "problemsolving",
    title: "Relative Speed: Asymmetric Network Replication",
    description: "Server Cluster A transmits data to a replica at 40 MB/s. After 15 minutes (900 seconds), Server Cluster B begins transmitting to the same replica at 70 MB/s on a parallel channel. How many minutes after Cluster B begins will both clusters have transferred an equal aggregate volume of data?",
    type: "MCQ",
    difficulty: "MEDIUM",
    explanation: "Lead of Cluster A after 15 min = 40 MB/s * 900 s = 36,000 MB. Relative speed advantage of Cluster B = 70 - 40 = 30 MB/s. Time required to catch up = 36,000 / 30 = 1,200 seconds = 20 minutes.",
    options: [
      { text: "20 minutes", correct: true },
      { text: "25 minutes", correct: false },
      { text: "15 minutes", correct: false },
      { text: "30 minutes", correct: false },
    ],
  },
  {
    skillSlug: "problemsolving",
    title: "Compound Growth: Cloud Infrastructure Savings",
    description: "An enterprise purchases reserved instances worth $50,000 that generate a compound cost reduction of 10% per annum compounded semi-annually. What is the total accumulated cost savings after 2 years?",
    type: "MCQ",
    difficulty: "MEDIUM",
    explanation: "Formula: A = P(1 + r/n)^(nt) - P. Semi-annual rate = 10% / 2 = 5% = 0.05. Number of periods = 2 * 2 = 4. Multiplier = (1.05)^4 = 1.215506. Accumulated savings = $50,000 * (1.215506 - 1) = $10,775.31.",
    options: [
      { text: "$10,775.31", correct: true },
      { text: "$10,000.00", correct: false },
      { text: "$11,250.50", correct: false },
      { text: "$9,850.25", correct: false },
    ],
  },
  {
    skillSlug: "problemsolving",
    title: "System Reliability: Multi-Component Failure Probability",
    description: "A distributed microservice chain depends sequentially on 3 independent services with operational availabilities of 99.0%, 98.0%, and 95.0% respectively. What is the probability that the entire chain functions without any failure?",
    type: "MCQ",
    difficulty: "HARD",
    explanation: "Since services are independent, overall system reliability is the product of individual reliabilities: P(Success) = 0.99 * 0.98 * 0.95 = 0.92169 = 92.17%.",
    options: [
      { text: "92.17%", correct: true },
      { text: "95.00%", correct: false },
      { text: "97.33%", correct: false },
      { text: "89.50%", correct: false },
    ],
  },
  {
    skillSlug: "problemsolving",
    title: "Combinatorics: Cryptographic Key Token Generation",
    description: "A security service creates authorization tokens consisting of 4 distinct uppercase English letters followed by 2 distinct numeric digits (0-9). How many distinct authorization tokens can be generated?",
    type: "MCQ",
    difficulty: "HARD",
    explanation: "Letters: 26 * 25 * 24 * 23 = 358,800. Digits: 10 * 9 = 90. Total distinct tokens = 358,800 * 90 = 32,292,000.",
    options: [
      { text: "32,292,000", correct: true },
      { text: "26,000,000", correct: false },
      { text: "45,697,600", correct: false },
      { text: "18,480,000", correct: false },
    ],
  },

  // ==========================================
  // 2. LOGICAL REASONING (problemsolving)
  // ==========================================
  {
    skillSlug: "problemsolving",
    title: "Pattern Recognition: Prime Sequence Increments",
    description: "Identify the missing number in the sequence: 4, 9, 25, 49, 121, 169, ___",
    type: "MCQ",
    difficulty: "EASY",
    explanation: "The numbers are squares of consecutive prime numbers: 2^2=4, 3^2=9, 5^2=25, 7^2=49, 11^2=121, 13^2=169. The next prime is 17, and 17^2 = 289.",
    options: [
      { text: "289", correct: true },
      { text: "225", correct: false },
      { text: "196", correct: false },
      { text: "361", correct: false },
    ],
  },
  {
    skillSlug: "problemsolving",
    title: "Formal Syllogism: Deductive Quantifiers",
    description: "Statements: (1) All microservices are containerized. (2) Some containerized workloads are stateless. Conclusions: I. Some microservices are stateless. II. All stateless workloads are microservices. Which conclusions follow?",
    type: "MCQ",
    difficulty: "EASY",
    explanation: "Neither conclusion logically follows. The containerized workloads that are stateless could be entirely separate from microservices. An affirmative particular proposition (Some B are C) does not distribute across the universal premise (All A are B).",
    options: [
      { text: "Neither conclusion I nor II follows", correct: true },
      { text: "Only conclusion I follows", correct: false },
      { text: "Only conclusion II follows", correct: false },
      { text: "Both conclusions I and II follow", correct: false },
    ],
  },
  {
    skillSlug: "problemsolving",
    title: "Algorithmic Cipher: Caesar Offset Progression",
    description: "In a cryptographic validation check, the word 'DEPLOY' is encrypted as 'FFRNQZ'. Following the identical encoding logic, how will 'SERVER' be encrypted?",
    type: "MCQ",
    difficulty: "MEDIUM",
    explanation: "Letter position shifts: D(+2)=F, E(+1)=F, P(+2)=R, L(+2)=N, O(+2)=Q, Y(+1)=Z. Pattern is (+2, +1, +2, +2, +2, +1). Applying to SERVER: S(19)+2=U, E(5)+1=F, R(18)+2=T, V(22)+2=X, E(5)+2=G, R(18)+1=S => UFTXGS.",
    options: [
      { text: "UFTXGS", correct: true },
      { text: "UGVXIW", correct: false },
      { text: "TFSUFS", correct: false },
      { text: "UHSXHT", correct: false },
    ],
  },
  {
    skillSlug: "problemsolving",
    title: "Topology Arrangement: Circular Node Replication",
    description: "Six nodes (A, B, C, D, E, F) sit on a circular network ring. Node A is directly opposite Node D. Node B is immediately adjacent to A and directly opposite Node E. Node C sits between D and E. Which node sits directly opposite Node C?",
    type: "MCQ",
    difficulty: "MEDIUM",
    explanation: "Arranging 6 nodes around a circle: Let positions 1 to 6 be clockwise. Pos 1 = A, Pos 4 = D. B is adjacent to A and opposite E. C is between D and E. The node directly opposite to Node C in this configuration is Node F.",
    options: [
      { text: "Node F", correct: true },
      { text: "Node B", correct: false },
      { text: "Node A", correct: false },
      { text: "Node E", correct: false },
    ],
  },
  {
    skillSlug: "problemsolving",
    title: "Deductive Truth-Teller Logic",
    description: "Three engineers (X, Y, Z) are being interviewed. Exactly one always tells the truth, one always lies, and one alternates between true and false statements. X says: 'Y is a liar.' Y says: 'Z is the alternating engineer.' Z says: 'X is telling the truth.' Who is the consistent truth-teller?",
    type: "MCQ",
    difficulty: "HARD",
    explanation: "If Y is the truth-teller: Z is the alternating engineer, and X's claim ('Y is a liar') is false (X is the liar). Z's statement that X is telling truth is a false statement from the alternator. This consistently satisfies all conditions. Therefore, Y is the truth-teller.",
    options: [
      { text: "Engineer Y", correct: true },
      { text: "Engineer X", correct: false },
      { text: "Engineer Z", correct: false },
      { text: "None; the premises are contradictory", correct: false },
    ],
  },

  // ==========================================
  // 3. VERBAL ABILITY & COMMUNICATION (communication)
  // ==========================================
  {
    skillSlug: "communication",
    title: "Subject-Verb Agreement in Technical Specifications",
    description: "Identify the grammatical error in the following engineering document statement: 'Each of the distributed microservice instances [A] are monitored [B] by the centralized telemetry collector [C] without manual agent installation [D].'",
    type: "MCQ",
    difficulty: "EASY",
    explanation: "'Each' is an indefinite singular pronoun and requires a singular verb. The correct phrase is 'is monitored' instead of 'are monitored'. Therefore segment [B] is erroneous.",
    options: [
      { text: "[B] 'are monitored'", correct: true },
      { text: "[A] 'Each of the distributed microservice instances'", correct: false },
      { text: "[C] 'by the centralized telemetry collector'", correct: false },
      { text: "[D] 'without manual agent installation'", correct: false },
    ],
  },
  {
    skillSlug: "communication",
    title: "Contextual Vocabulary in Stakeholder Alignment",
    description: "In an executive briefing, the engineering director states: 'Refactoring the caching layer will move the needle on our 99th percentile response latency.' What does 'move the needle' mean in this context?",
    type: "MCQ",
    difficulty: "EASY",
    explanation: "'Move the needle' is an established idiom signifying making a noticeable, measurable, and consequential positive impact.",
    options: [
      { text: "Make a noticeable and measurable positive difference", correct: true },
      { text: "Trigger hardware throttling alarms", correct: false },
      { text: "Introduce precision logging instrumentation", correct: false },
      { text: "Shift operational responsibility to another team", correct: false },
    ],
  },
  {
    skillSlug: "communication",
    title: "Parallel Structure in Architectural Proposals",
    description: "Which version of the RFC justification demonstrates correct grammatical parallelism and conciseness?",
    type: "MCQ",
    difficulty: "MEDIUM",
    explanation: "Parallel grammatical structure requires equivalent verb forms. 'migrating legacy tables, establishing automated pipelines, and deprecating unused routes' maintains matching gerunds (-ing) throughout.",
    options: [
      { text: "The Q3 roadmap prioritizes migrating legacy tables, establishing automated pipelines, and deprecating unused routes.", correct: true },
      { text: "The Q3 roadmap prioritizes to migrate legacy tables, establishing automated pipelines, and depreciation of unused routes.", correct: false },
      { text: "The Q3 roadmap prioritizes migrating legacy tables, to establish automated pipelines, and deprecating unused routes.", correct: false },
      { text: "The Q3 roadmap prioritizes legacy table migration, establishing automated pipelines, and to deprecate unused routes.", correct: false },
    ],
  },
  {
    skillSlug: "communication",
    title: "Critical Reasoning: Implicit Architectural Assumptions",
    description: "Proposal: 'Decommissioning our on-premise compute cluster and adopting serverless functions will drastically reduce our annual operating budget.' Which implicit assumption must hold true for this conclusion to be valid?",
    type: "MCQ",
    difficulty: "MEDIUM",
    explanation: "For cost reduction to occur, the cumulative request invocation charges of serverless must not exceed the current fixed depreciation, power, and maintenance costs of on-prem servers.",
    options: [
      { text: "The variable cost of total serverless execution invocations will not exceed the current fixed on-premise operational expenses.", correct: true },
      { text: "All current engineering staff already possess certification in serverless deployment patterns.", correct: false },
      { text: "Serverless functions always guarantee zero cold start latency.", correct: false },
      { text: "On-premise hardware cannot run modern Linux container images.", correct: false },
    ],
  },
  {
    skillSlug: "communication",
    title: "Synthesis & Logical Sequence in Incident RCA",
    description: "Arrange the four statements into the most coherent sequence for a production Root Cause Analysis (RCA) report:\n[P] Consequently, upstream checkout API gateways timed out.\n[Q] A corrupted index build locked the catalog database table.\n[R] The incident was mitigated within 8 minutes by failover to the read replica.\n[S] Transaction queues rapidly backed up across all payment worker threads.",
    type: "MCQ",
    difficulty: "HARD",
    explanation: "Logical sequence: Cause ([Q] table locked) -> Immediate effect ([S] worker queues backed up) -> System-wide failure ([P] checkout API timed out) -> Mitigation ([R] failover to read replica). Sequence: Q -> S -> P -> R.",
    options: [
      { text: "Q -> S -> P -> R", correct: true },
      { text: "P -> Q -> S -> R", correct: false },
      { text: "S -> Q -> R -> P", correct: false },
      { text: "Q -> P -> S -> R", correct: false },
    ],
  },

  // ==========================================
  // 4. AGILE & SCRUM PRACTICES (agile)
  // ==========================================
  {
    skillSlug: "agile",
    title: "Mid-Sprint Scope Negotiation",
    description: "Three days into an ongoing two-week Sprint, an executive stakeholder requests an urgent, unvetted feature addition. According to Scrum methodology, how should the team and Product Owner respond?",
    type: "MCQ",
    difficulty: "EASY",
    explanation: "In Scrum, the Sprint Goal is protected. The Product Owner analyzes the requirement, creates user stories, and places them into the Product Backlog for upcoming sprint refinement, ensuring the team's ongoing commitment is not disrupted.",
    options: [
      { text: "The Product Owner captures the requirement into the Product Backlog for prioritization in future sprints without disrupting the current Sprint Goal.", correct: true },
      { text: "The developers immediately halt their current sprint tasks to code the executive's requested feature.", correct: false },
      { text: "The Scrum Master cancels the entire sprint and restarts the planning cycle immediately.", correct: false },
      { text: "The developers add it secretly to the sprint without estimating story points.", correct: false },
    ],
  },
  {
    skillSlug: "agile",
    title: "Fibonacci Story Point Estimation Principles",
    description: "Why does Agile estimation commonly employ non-linear Fibonacci sequences (1, 2, 3, 5, 8, 13, 21) rather than absolute working hours?",
    type: "MCQ",
    difficulty: "MEDIUM",
    explanation: "Fibonacci estimation accounts for the principle that uncertainty and complexity scale exponentially as task size increases, preventing false precision over speculative hours.",
    options: [
      { text: "It reflects increasing uncertainty and cognitive complexity as scope grows, discouraging false precision in time estimates.", correct: true },
      { text: "It matches the standard billing hour increments defined by enterprise accounting.", correct: false },
      { text: "It enforces that no user story can take longer than 21 minutes to implement.", correct: false },
      { text: "It is required for automatic generation of Jira burndown velocity charts.", correct: false },
    ],
  },
  {
    skillSlug: "agile",
    title: "Sprint Retrospective Action Item Ownership",
    description: "A team's Sprint Burndown repeatedly exhibits a severe flatline followed by a steep end-of-sprint cliff. During the Retrospective, what is the most effective operational remedy?",
    type: "MCQ",
    difficulty: "HARD",
    explanation: "A cliff burndown indicates stories are too large or QA occurs solely at the end. Decomposing stories into smaller vertical slices (<=3 points) and implementing continuous verification allows steady daily flow.",
    options: [
      { text: "Decompose stories into smaller vertical functional slices and enforce WIP limits so work flows continuously through testing.", correct: true },
      { text: "Mandate mandatory overtime during the final 48 hours of every future sprint.", correct: false },
      { text: "Double the total story point commitment to incentivize faster work.", correct: false },
      { text: "Eliminate code reviews and unit tests to speed up pull request approvals.", correct: false },
    ],
  },

  // ==========================================
  // 5. WORKPLACE CONFLICT RESOLUTION (conflictresolution)
  // ==========================================
  {
    skillSlug: "conflictresolution",
    title: "Constructive Code Review Feedback",
    description: "During a code review, a senior engineer spots a quadratic O(N^2) algorithm inside a critical request loop authored by a junior developer. Which comment embodies the highest standard of constructive engineering communication?",
    type: "MCQ",
    difficulty: "EASY",
    explanation: "Constructive code reviews provide objective reasoning, explain the performance rationale, suggest an alternative, and offer collaboration rather than blunt criticism.",
    options: [
      { text: "'Notice this loop is O(N^2), which could cause latency spikes on large inputs. Could we use a Map lookup to achieve O(N)? Happy to pair on this if helpful!'", correct: true },
      { text: "'This code is completely unoptimized and will bring down production. Rewrite it immediately.'", correct: false },
      { text: "'Why did you write it like this? Did you test this with any real data?'", correct: false },
      { text: "Approve the PR silently to avoid hurting the junior engineer's morale.", correct: false },
    ],
  },
  {
    skillSlug: "conflictresolution",
    title: "Cross-Functional Prioritization Deadlock",
    description: "The Engineering Lead and Lead Product Designer are deadlocked: Design insists on custom interactive 3D elements requiring a 3-week release postponement, while Engineering emphasizes meeting the committed deadline for enterprise clients. What is the most constructive resolution framework?",
    type: "MCQ",
    difficulty: "MEDIUM",
    explanation: "In agile engineering, delivering a high-quality Minimum Viable Product (MVP) using standard accessible components on schedule, followed by incremental design enhancements in a subsequent release, satisfies both commercial and UX objectives.",
    options: [
      { text: "Deploy an MVP with clean, accessible standard UI on schedule, while scheduling the advanced 3D visual enhancements as an incremental fast-follow.", correct: true },
      { text: "Cancel the feature entirely to avoid team friction.", correct: false },
      { text: "Escalate immediately to the CEO to force an authoritative command decision without dialogue.", correct: false },
      { text: "Allow Design to take complete control while engineers pause development.", correct: false },
    ],
  },
  {
    skillSlug: "conflictresolution",
    title: "Blameless Postmortem Facilitation",
    description: "Following a Sev-1 production database outage caused by an engineer executing a manual migration script with an incorrect WHERE clause, what is the best leadership action during the retrospective?",
    type: "MCQ",
    difficulty: "HARD",
    explanation: "Blameless postmortems operate on the premise that humans make mistakes; resilient systems implement safeguards (such as automated migration pipelines, transaction rollbacks, and read-only credentials) to prevent human errors from causing widespread outages.",
    options: [
      { text: "Conduct a blameless postmortem focusing on why tooling permitted unverified manual production execution and implement automated CI/CD migration guardrails.", correct: true },
      { text: "Publicly discipline the engineer in front of the department to demonstrate accountability.", correct: false },
      { text: "Revoke database access for all engineers and mandate that only managers execute scripts manually.", correct: false },
      { text: "Classify the outage as an inevitable act of nature and take no systemic preventive steps.", correct: false },
    ],
  },

  // ==========================================
  // 6. TEAM LEADERSHIP & COLLABORATION (teamleadership)
  // ==========================================
  {
    skillSlug: "teamleadership",
    title: "1-on-1 Engineering Mentorship Focus",
    description: "What is the primary objective of a recurring bi-weekly 1-on-1 meeting between an engineering manager and an individual contributor?",
    type: "MCQ",
    difficulty: "EASY",
    explanation: "1-on-1 meetings are dedicated to the contributor's long-term career growth, feedback, psychological safety, and removing systemic organizational blockers, rather than just tactical ticket status updates.",
    options: [
      { text: "To discuss career aspirations, professional growth, feedback exchange, and eliminate systemic blockers.", correct: true },
      { text: "To perform a detailed line-by-line review of Jira tickets and hourly timesheets.", correct: false },
      { text: "To assign daily task checklists for the upcoming sprint.", correct: false },
      { text: "To conduct formal annual performance appraisal scoring every two weeks.", correct: false },
    ],
  },
  {
    skillSlug: "teamleadership",
    title: "Delegation & Engineering Ownership",
    description: "A Lead Architect has designed a new distributed event ingestion subsystem. Rather than coding the entire critical path alone, how should the Lead empower mid-level team members?",
    type: "MCQ",
    difficulty: "MEDIUM",
    explanation: "Effective technical leaders author architectural RFCs, define API contracts and quality boundaries, and delegate module ownership to team members, providing guidance through pairing and reviews.",
    options: [
      { text: "Author the architectural RFC with clear interface contracts, delegate module implementations with autonomous ownership, and provide continuous mentorship through design reviews.", correct: true },
      { text: "Code the entire core in secret over the weekend and assign only documentation tasks to the team.", correct: false },
      { text: "Delegate without any architectural guidance and evaluate only after code is delivered to production.", correct: false },
      { text: "Outsource the implementation to an external vendor without team involvement.", correct: false },
    ],
  },
  {
    skillSlug: "teamleadership",
    title: "Balancing Technical Debt vs Feature Velocity",
    description: "An enterprise product team faces intense pressure from Sales to deliver five major features this quarter, but the core monolithic database is experiencing connection saturation and severe performance degradation due to technical debt. How should the engineering leader navigate this strategic dilemma?",
    type: "MCQ",
    difficulty: "HARD",
    explanation: "Strong engineering leaders present empirical telemetry and business risk analysis to stakeholders, establishing a sustainable allocation (e.g. 70% features, 30% architectural stability) to ensure ongoing reliability without halting business progress.",
    options: [
      { text: "Present empirical latency metrics and outage risk projections to executive stakeholders, negotiating a dedicated 25-30% capacity allocation for architectural stabilization while sequencing key features.", correct: true },
      { text: "Ignore the performance degradation and build all five features at maximum speed until the system crashes.", correct: false },
      { text: "Refuse to build any new features for the next 12 months while rewriting the entire application from scratch.", correct: false },
      { text: "Instruct developers to work double shifts without logging technical debt in the backlog.", correct: false },
    ],
  },
];

export async function runAptitudeSeed() {
  console.log("[SEED] Connecting to database to seed Aptitude & Soft Skills questions...");
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    database: "beyon",
  });

  const [skills] = (await conn.query("SELECT id, slug FROM skills;")) as any[];
  const skillMap: Record<string, string> = {};
  for (const s of skills) {
    skillMap[s.slug] = s.id;
  }
  const defaultSkillId = skills[0]?.id;

  console.log(`[SEED] Seeding ${APTITUDE_AND_SOFTSKILLS_QUESTIONS.length} curated Aptitude & Soft Skills questions...`);
  let inserted = 0;

  for (let i = 0; i < APTITUDE_AND_SOFTSKILLS_QUESTIONS.length; i++) {
    const q = APTITUDE_AND_SOFTSKILLS_QUESTIONS[i];
    const skillId = skillMap[q.skillSlug] || defaultSkillId;
    const qId = toUUID(`beyon-aptitude-softskill-${i}-${q.title}`);

    await conn.query(
      `INSERT INTO questions (id, skill_id, title, description, question_type, difficulty, explanation, evaluation_method, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'EXACT_MATCH', 'PUBLISHED', NOW(), NOW())
       ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), explanation=VALUES(explanation), difficulty=VALUES(difficulty);`,
      [qId, skillId, q.title, q.description, q.type, q.difficulty, q.explanation]
    );

    if (q.options) {
      await conn.query("DELETE FROM question_options WHERE question_id = ?;", [qId]);
      for (let oi = 0; oi < q.options.length; oi++) {
        const opt = q.options[oi];
        const optId = toUUID(`beyon-apt-opt-${qId}-${oi}`);
        await conn.query(
          `INSERT INTO question_options (id, question_id, option_text, is_correct, display_order, explanation)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [optId, qId, opt.text, opt.correct ? 1 : 0, oi + 1, opt.correct ? q.explanation : null]
        );
      }
    }
    inserted++;
  }

  console.log(`[SEED] Successfully seeded ${inserted} authentic Aptitude & Soft Skills questions into database.`);
  await conn.end();
}

if (import.meta.main) {
  runAptitudeSeed().catch((err) => {
    console.error("[SEED ERROR]", err.message);
    process.exit(0);
  });
}
