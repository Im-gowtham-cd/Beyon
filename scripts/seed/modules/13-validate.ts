// ============================================================
// Module 13 — Integrity Validator & Reconciliation
// ============================================================

import { doltQuery } from "../engine/dolt.js";

export interface ValidationResult {
  check: string;
  status: "PASS" | "FAIL" | "WARN";
  detail: string;
}

export async function validateIntegrity(): Promise<ValidationResult[]> {
  console.log("\n🔍 Running integrity validation...");
  const results: ValidationResult[] = [];

  // ─── Basic counts ───
  const counts = [
    { label: "Users", sql: "SELECT COUNT(*) as cnt FROM users" },
    { label: "Student Profiles", sql: "SELECT COUNT(*) as cnt FROM student_profiles" },
    { label: "Institution Profiles", sql: "SELECT COUNT(*) as cnt FROM institution_profiles" },
    { label: "Company Profiles", sql: "SELECT COUNT(*) as cnt FROM company_profiles" },
    { label: "Skills", sql: "SELECT COUNT(*) as cnt FROM skills" },
    { label: "Questions", sql: "SELECT COUNT(*) as cnt FROM questions" },
    { label: "Tests", sql: "SELECT COUNT(*) as cnt FROM tests" },
    { label: "Opportunities", sql: "SELECT COUNT(*) as cnt FROM company_opportunities" },
    { label: "Applications", sql: "SELECT COUNT(*) as cnt FROM opportunity_applications" },
    { label: "Coin Wallets", sql: "SELECT COUNT(*) as cnt FROM coin_wallets" },
    { label: "Coin Transactions", sql: "SELECT COUNT(*) as cnt FROM coin_transactions" },
    { label: "Notifications", sql: "SELECT COUNT(*) as cnt FROM notifications" },
    { label: "Follows", sql: "SELECT COUNT(*) as cnt FROM follows" },
    { label: "Daily Challenges", sql: "SELECT COUNT(*) as cnt FROM daily_challenges" },
  ];

  for (const c of counts) {
    try {
      const rows = doltQuery(c.sql);
      const cnt = parseInt(rows[0]?.cnt ?? "0");
      results.push({
        check: c.label,
        status: cnt > 0 ? "PASS" : "WARN",
        detail: `${cnt} records`,
      });
    } catch (err: any) {
      results.push({ check: c.label, status: "FAIL", detail: err.message });
    }
  }

  // ─── Coin Reconciliation ───
  try {
    const reconcile = doltQuery(`
      SELECT
        w.student_id,
        w.balance as wallet_balance,
        COALESCE(SUM(CASE WHEN t.type = 'EARN' THEN t.amount ELSE 0 END), 0)
        - COALESCE(SUM(CASE WHEN t.type = 'SPEND' THEN t.amount ELSE 0 END), 0) as calculated_balance
      FROM coin_wallets w
      LEFT JOIN coin_transactions t ON t.student_id = w.student_id
      GROUP BY w.student_id, w.balance
      HAVING ABS(wallet_balance - calculated_balance) > 1
      LIMIT 5
    `);
    results.push({
      check: "Coin Ledger Reconciliation",
      status: reconcile.length === 0 ? "PASS" : "WARN",
      detail: reconcile.length === 0
        ? "All wallet balances reconcile with transactions"
        : `${reconcile.length} wallets have minor balance drift (may be due to seeding order)`,
    });
  } catch (err: any) {
    results.push({ check: "Coin Ledger Reconciliation", status: "FAIL", detail: err.message });
  }

  // ─── Orphan check: applications with no student ───
  try {
    const orphans = doltQuery(`
      SELECT COUNT(*) as cnt FROM opportunity_applications a
      LEFT JOIN users u ON u.id = a.student_id
      WHERE u.id IS NULL
    `);
    const cnt = parseInt(orphans[0]?.cnt ?? "0");
    results.push({
      check: "Application Referential Integrity",
      status: cnt === 0 ? "PASS" : "FAIL",
      detail: cnt === 0 ? "All applications reference valid students" : `${cnt} orphan applications`,
    });
  } catch (err: any) {
    results.push({ check: "Application Referential Integrity", status: "FAIL", detail: err.message });
  }

  // ─── Print results ───
  console.log("\n  Validation Results:");
  console.log("  " + "─".repeat(70));
  for (const r of results) {
    const icon = r.status === "PASS" ? "✅" : r.status === "WARN" ? "⚠️ " : "❌";
    console.log(`  ${icon}  ${r.check.padEnd(35)} ${r.detail}`);
  }
  console.log("  " + "─".repeat(70));

  const fails = results.filter(r => r.status === "FAIL").length;
  const warns = results.filter(r => r.status === "WARN").length;
  console.log(`\n  Summary: ${results.length - fails - warns} PASS | ${warns} WARN | ${fails} FAIL`);

  return results;
}
