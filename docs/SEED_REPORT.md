# BEYON TEST DATA SEED REPORT
Generated: 2026-08-27T16:19:02.033Z

========================================
ENVIRONMENT  : development
SEED VALUE   : 20260826
ELAPSED      : 31.3s
OVERALL      : PASS
========================================

RECORDS CREATED
───────────────
Users               : 125
Students            : 61
Institutions        : 25
Companies           : 30
Skills              : 109
Questions           : 300
Assessments/Tests   : 11
Opportunities       : 30
Applications        : 184
Coin Transactions   : 653
Notifications       : 457
Follows             : 186
Daily Challenges    : 21

========================================
VALIDATION RESULTS
══════════════════
PASS  | Users                                  | 125 records
PASS  | Student Profiles                       | 61 records
PASS  | Institution Profiles                   | 25 records
PASS  | Company Profiles                       | 30 records
PASS  | Skills                                 | 109 records
PASS  | Questions                              | 300 records
PASS  | Tests                                  | 11 records
PASS  | Opportunities                          | 30 records
PASS  | Applications                           | 184 records
PASS  | Coin Wallets                           | 61 records
PASS  | Coin Transactions                      | 653 records
PASS  | Notifications                          | 457 records
PASS  | Follows                                | 186 records
PASS  | Daily Challenges                       | 21 records
PASS  | Coin Ledger Reconciliation             | All wallet balances reconcile with transactions
PASS  | Application Referential Integrity      | All applications reference valid students

========================================
Integrity Checks    : PASS
Coin Reconciliation : PASS
========================================

KNOWN NOTES
• Generated student accounts use password='SEEDED_NO_AUTH' (no real login possible)
• Only fixed test accounts (example.beyon.test) support actual login via Appwrite
• Run 'bun run seed.ts validate' to re-run checks at any time
• Run 'bun run seed.ts reset' to wipe all seeded data
