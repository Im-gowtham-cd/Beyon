import { doltBatch, esc, escNum, doltQuery, toUUID } from "../engine/dolt.js";
import { studentUserIds } from "./04-users.js";
import { opportunityIds } from "./08-opportunities.js";
import { SeededRandom } from "../utils/faker.js";
import type { SeedConfig } from "../config.js";

async function ensureAppRefs(): Promise<void> {
  if (studentUserIds.length === 0) {
    const srows = doltQuery("SELECT id FROM users WHERE role='STUDENT'");
    for (const r of srows) studentUserIds.push(r.id);
  }
  if (opportunityIds.length === 0) {
    const orows = doltQuery("SELECT id FROM company_opportunities");
    for (const r of orows) opportunityIds.push(r.id);
  }
}

const APP_STATUSES = [
  "PENDING", "PENDING", "PENDING",
  "UNDER_REVIEW", "SHORTLISTED",
  "REJECTED", "WITHDRAWN",
] as const;

const COIN_EARN_REASONS = [
  { reason: "DAILY_CHALLENGE", amount: 20 },
  { reason: "WEEKEND_TEST", amount: 100 },
  { reason: "QUESTION_SOLVED", amount: 10 },
  { reason: "CERTIFICATION", amount: 250 },
  { reason: "STREAK_BONUS", amount: 50 },
  { reason: "REFERRAL_BONUS", amount: 75 },
  { reason: "PROFILE_COMPLETE", amount: 100 },
];

export async function seedApplicationsAndCoins(cfg: SeedConfig): Promise<void> {
  console.log("\n📋 Seeding applications & coin transactions...");

  await ensureAppRefs();

  const rng = new SeededRandom(cfg.seed + 5000);
  const appStmts: string[] = [];
  const coinStmts: string[] = [];

  if (opportunityIds.length === 0 || studentUserIds.length === 0) {
    console.log("  ⚠️  No opportunities or students — skipping applications");
    return;
  }

  // ─── Applications ───
  let appCount = 0;
  const used = new Set<string>(); // prevent duplicate (student, opty)

  for (let i = 0; i < cfg.counts.applications; i++) {
    const studentId = rng.pick(studentUserIds);
    const optyId = rng.pick(opportunityIds);
    const key = `${studentId}::${optyId}`;
    if (used.has(key)) continue;
    used.add(key);

    const status = rng.pick(APP_STATUSES);
    const coinsSpent = rng.pick([0, 100, 250, 500]);
    const id = toUUID(`beyon-app-${i}`);

    const daysAgo = rng.int(1, 350);
    const updatedDaysAgo = Math.max(0, daysAgo - rng.int(0, 20));

    appStmts.push(
      `INSERT IGNORE INTO opportunity_applications
        (id, opportunity_id, student_id, status, coins_spent, applied_at, updated_at)
       VALUES (
         ${esc(id)}, ${esc(optyId)}, ${esc(studentId)},
         ${esc(status)}, ${coinsSpent},
         DATE_SUB(NOW(), INTERVAL ${daysAgo} DAY),
         DATE_SUB(NOW(), INTERVAL ${updatedDaysAgo} DAY)
       );`
    );
    appCount++;
  }

  // ─── Coin Ledger ───
  // For every student, seed a chronological transaction history over 365 days
  let coinTxCount = 0;
  for (const studentId of studentUserIds) {
    const txCount = rng.int(8, 25);
    let balance = 0;

    for (let t = 0; t < txCount; t++) {
      const isEarn = rng.bool(0.78);
      const txDaysAgo = Math.max(0, Math.floor(365 - ((t + 1) * (365 / (txCount + 1)))));

      if (isEarn) {
        const earn = rng.pick(COIN_EARN_REASONS);
        balance += earn.amount;
        const id = toUUID(`beyon-ctx-earn-${studentId}-${t}`);
        coinStmts.push(
          `INSERT IGNORE INTO coin_transactions (id, student_id, amount, type, reason, balance_after, created_at)
           VALUES (${esc(id)}, ${esc(studentId)}, ${earn.amount}, 'EARN', ${esc(earn.reason)}, ${balance},
                   DATE_SUB(NOW(), INTERVAL ${txDaysAgo} DAY));`
        );
      } else {
        const spendAmount = rng.pick([50, 100, 250]);
        if (balance >= spendAmount) {
          balance -= spendAmount;
          const id = toUUID(`beyon-ctx-spend-${studentId}-${t}`);
          coinStmts.push(
            `INSERT IGNORE INTO coin_transactions (id, student_id, amount, type, reason, balance_after, created_at)
             VALUES (${esc(id)}, ${esc(studentId)}, ${spendAmount}, 'SPEND', 'COMPANY_ASSESSMENT', ${balance},
                     DATE_SUB(NOW(), INTERVAL ${txDaysAgo} DAY));`
          );
        }
      }
      coinTxCount++;
    }

    // Update wallet balance
    coinStmts.push(
      `UPDATE coin_wallets SET balance = ${balance}, total_earned = ${balance + 300}, updated_at = NOW()
       WHERE student_id = ${esc(studentId)};`
    );
  }

  doltBatch(appStmts, 100);
  doltBatch(coinStmts, 200);

  console.log(`  ✅ ${appCount} applications`);
  console.log(`  ✅ ${coinTxCount} coin transactions`);
}
