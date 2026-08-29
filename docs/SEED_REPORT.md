# BEYON TEST DATA SEED REPORT
Generated: 2026-08-29T04:49:58.371Z

========================================
ENVIRONMENT  : development
SEED VALUE   : 20260826
ELAPSED      : 76.1s
OVERALL      : PASS
========================================

RECORDS CREATED
───────────────
Users               : 190
Students            : 123
Institutions        : 26
Companies           : 31
Skills              : 109
Questions           : 300
Assessments/Tests   : 16
Opportunities       : 35
Applications        : 293
Coin Transactions   : 1880
Notifications       : 750
Follows             : 378
Daily Challenges    : 1825

========================================
VALIDATION RESULTS
══════════════════
PASS  | Users                                  | 190 records
PASS  | Student Profiles                       | 123 records
PASS  | Institution Profiles                   | 26 records
PASS  | Company Profiles                       | 31 records
PASS  | Skills                                 | 109 records
PASS  | Questions                              | 300 records
PASS  | Tests                                  | 16 records
PASS  | Opportunities                          | 35 records
PASS  | Applications                           | 293 records
PASS  | Coin Wallets                           | 123 records
PASS  | Coin Transactions                      | 1880 records
PASS  | Notifications                          | 750 records
PASS  | Follows                                | 378 records
PASS  | Daily Challenges                       | 1825 records
WARN  | Coin Ledger Reconciliation             | 2 wallets have minor balance drift (may be due to seeding order)
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
