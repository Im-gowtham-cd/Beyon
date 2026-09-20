# BEYON TEST DATA SEED REPORT
Generated: 2026-09-20T05:32:22.368Z

========================================
ENVIRONMENT  : development
SEED VALUE   : 20260826
ELAPSED      : 282.8s
OVERALL      : PASS
========================================

RECORDS CREATED
───────────────
Users               : 28
Students            : 11
Institutions        : 9
Companies           : 24
Skills              : 110
Questions           : 34412
Assessments/Tests   : 21
Opportunities       : 48
Applications        : 296
Coin Transactions   : 7639
Notifications       : 750
Follows             : 1827
Daily Challenges    : 2618

========================================
VALIDATION RESULTS
══════════════════
PASS  | Users                                  | 553 records
PASS  | Student Profiles                       | 460 records
PASS  | Institution Profiles                   | 9 records
PASS  | Company Profiles                       | 24 records
PASS  | Skills                                 | 110 records
PASS  | Questions                              | 34412 records
PASS  | Tests                                  | 21 records
PASS  | Opportunities                          | 48 records
PASS  | Applications                           | 296 records
PASS  | Coin Wallets                           | 461 records
PASS  | Coin Transactions                      | 7639 records
PASS  | Notifications                          | 750 records
PASS  | Follows                                | 1827 records
PASS  | Daily Challenges                       | 2618 records
WARN  | Coin Ledger Reconciliation             | 5 wallets have minor balance drift (may be due to seeding order)
PASS  | Application Referential Integrity      | All applications reference valid students

========================================
Integrity Checks    : PASS
Coin Reconciliation : WARN
========================================

KNOWN NOTES
• Generated student accounts use password='SEEDED_NO_AUTH' (no real login possible)
• Only fixed test accounts (example.beyon.test) support actual login via Appwrite
• Run 'bun run seed.ts validate' to re-run checks at any time
• Run 'bun run seed.ts reset' to wipe all seeded data
