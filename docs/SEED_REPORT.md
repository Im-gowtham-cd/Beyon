# BEYON TEST DATA SEED REPORT
Generated: 2026-08-27T02:07:10.946Z

========================================
ENVIRONMENT  : development
SEED VALUE   : 20260826
ELAPSED      : 23.5s
OVERALL      : FAIL
========================================

RECORDS CREATED
───────────────
Users               : 125
Students            : 60
Institutions        : 50
Companies           : 60
Skills              : 109
Questions           : 300
Assessments/Tests   : 11
Opportunities       : 30
Applications        : 187
Coin Transactions   : 16
Notifications       : 475
Follows             : 181
Daily Challenges    : 21

========================================
VALIDATION RESULTS
══════════════════
PASS  | Users                                  | 125 records
PASS  | Student Profiles                       | 120 records
PASS  | Institution Profiles                   | 50 records
PASS  | Company Profiles                       | 60 records
PASS  | Skills                                 | 109 records
PASS  | Questions                              | 300 records
PASS  | Tests                                  | 11 records
PASS  | Opportunities                          | 30 records
PASS  | Applications                           | 187 records
PASS  | Coin Wallets                           | 116 records
PASS  | Coin Transactions                      | 16 records
PASS  | Notifications                          | 475 records
PASS  | Follows                                | 181 records
PASS  | Daily Challenges                       | 21 records
WARN  | Coin Ledger Reconciliation             | 5 wallets have minor balance drift (may be due to seeding order)
FAIL  | Application Referential Integrity      | 187 orphan applications

========================================
Integrity Checks    : FAIL
Coin Reconciliation : WARN
========================================

KNOWN NOTES
• Generated student accounts use password='SEEDED_NO_AUTH' (no real login possible)
• Only fixed test accounts (example.beyon.test) support actual login via Appwrite
• Run 'bun run seed.ts validate' to re-run checks at any time
• Run 'bun run seed.ts reset' to wipe all seeded data
