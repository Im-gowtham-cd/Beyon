import { doltBatch, esc, doltQuery, toUUID } from "../engine/dolt.js";
import { studentUserIds } from "./04-users.js";
import { companyUserIds } from "./03-companies.js";
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
}

const POST_TITLES = [
  "How I cracked my first SDE interview", "Tips for DSA practice",
  "My experience with Spring Boot microservices", "Getting started with AWS",
  "Python vs Java for backend development", "How to improve your CGPA",
  "My placement journey at a Tier-1 company", "React hooks explained simply",
  "Why system design matters for freshers", "10 SQL queries you must know",
  "Building a portfolio project from scratch", "Docker for beginners",
  "How to write a winning resume", "My internship experience",
  "Competitive programming — worth it?",
];

export async function seedCommunity(cfg: SeedConfig): Promise<void> {
  console.log("\n💬 Seeding community data...");

  await ensureCommunityRefs();

  const rng = new SeededRandom(cfg.seed + 8000);
  const followStmts: string[] = [];

  // ─── Follow relationships (student → company) ───
  const compUserIdList = Object.values(companyUserIds);
  let followCount = 0;
  const followUsed = new Set<string>();

  for (const studentId of studentUserIds) {
    const numFollows = rng.int(1, Math.min(5, compUserIdList.length));
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
  console.log(`  ✅ Community seeded`);
}
