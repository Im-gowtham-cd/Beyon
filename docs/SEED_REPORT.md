# BEYON TEST DATA SEED REPORT
Generated: 2026-08-28T01:48:37.539Z

========================================
ENVIRONMENT  : development
SEED VALUE   : 20260826
ELAPSED      : 82.8s
OVERALL      : PASS
========================================

RECORDS CREATED
───────────────
Users               : 185
Students            : 121
Institutions        : 25
Companies           : 30
Skills              : 47
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
PASS  | Users                                  | 185 records
PASS  | Student Profiles                       | 121 records
PASS  | Institution Profiles                   | 25 records
PASS  | Company Profiles                       | 30 records
PASS  | Skills                                 | 47 records
PASS  | Questions                              | 300 records
PASS  | Tests                                  | 16 records
PASS  | Opportunities                          | 35 records
PASS  | Applications                           | 293 records
PASS  | Coin Wallets                           | 121 records
PASS  | Coin Transactions                      | 1880 records
PASS  | Notifications                          | 750 records
PASS  | Follows                                | 378 records
PASS  | Daily Challenges                       | 1825 records
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
