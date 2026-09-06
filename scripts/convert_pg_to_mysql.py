"""
Convert PostgreSQL Flyway migrations to MySQL-compatible syntax for Dolt.
Reads all V*.sql files and outputs a single consolidated MySQL migration.
"""

import os
import re
import glob

MIGRATION_DIR = "backend/src/main/resources/db/migration"
OUTPUT_FILE = "backend/src/main/resources/db/migration/V26__mysql_consolidated_schema.sql"

def convert_sql(content):
    """Convert PostgreSQL SQL to MySQL-compatible syntax."""
    sql = content

    sql = re.sub(r'CREATE EXTENSION IF NOT EXISTS.*?;', '', sql, flags=re.IGNORECASE)

    sql = re.sub(r'DO\s+\$\$.*?\$\$;', '-- [Anonymous block removed - not supported in MySQL]', sql, flags=re.IGNORECASE | re.DOTALL)

    sql = re.sub(r'COMMENT ON.*?;', '', sql, flags=re.IGNORECASE)

    sql = sql.replace('gen_random_uuid()', 'UUID()')
    sql = sql.replace('gen_random_uuid ()', 'UUID()')

    sql = re.sub(r'\bTIMESTAMPTZ\b', 'TIMESTAMP', sql, flags=re.IGNORECASE)

    sql = re.sub(r'\bSERIAL\b(?!\s*\()', 'INT AUTO_INCREMENT', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\bBIGSERIAL\b', 'BIGINT AUTO_INCREMENT', sql, flags=re.IGNORECASE)

    sql = re.sub(r'\bBOOLEAN\b', 'TINYINT(1)', sql, flags=re.IGNORECASE)
    sql = re.sub(r'DEFAULT\s+FALSE', 'DEFAULT 0', sql, flags=re.IGNORECASE)
    sql = re.sub(r'DEFAULT\s+true', 'DEFAULT 1', sql, flags=re.IGNORECASE)
    sql = re.sub(r'DEFAULT\s+TRUE', 'DEFAULT 1', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\bfalse\b', '0', sql)
    sql = re.sub(r'\btrue\b', '1', sql)

    sql = re.sub(r"CHECK\s*\(\s*(\w+)\s+IN\s*\(([^)]+)\)\s*\)", 
                 r"/* CHECK: \1 IN (\2) */", sql, flags=re.IGNORECASE)

    sql = re.sub(r'\bJSONB\b', 'JSON', sql, flags=re.IGNORECASE)

    sql = re.sub(r'ALTER TABLE (\w+) ADD COLUMN IF NOT EXISTS', 
                 r'ALTER TABLE \1 ADD COLUMN', sql, flags=re.IGNORECASE)

    sql = re.sub(r'ON CONFLICT.*?DO NOTHING', '', sql, flags=re.IGNORECASE)
    sql = re.sub(r'ON CONFLICT.*?DO UPDATE.*?;', ';', sql, flags=re.IGNORECASE | re.DOTALL)

    sql = re.sub(r'CREATE INDEX CONCURRENTLY', 'CREATE INDEX', sql, flags=re.IGNORECASE)

    sql = re.sub(r'CREATE INDEX \w+ ON \w+ \(lower\([^)]+\)\);', '', sql, flags=re.IGNORECASE)
    sql = re.sub(r'CREATE INDEX \w+ ON \w+ \(upper\([^)]+\)\);', '', sql, flags=re.IGNORECASE)
    sql = re.sub(r'CREATE INDEX \w+ ON \w+ \(\w+::\w+\);', '', sql, flags=re.IGNORECASE)
    sql = re.sub(r'(CREATE INDEX \w+ ON \w+ \([^)]+\))\s+WHERE\s+[^;]+;', r'\1;', sql, flags=re.IGNORECASE)

    sql = re.sub(r'DROP TYPE IF EXISTS.*?;', '', sql, flags=re.IGNORECASE)

    sql = re.sub(r'ARRAY\[([^\]]*)\]', r"'\1'", sql, flags=re.IGNORECASE)
    sql = re.sub(r'(\w+)(?:\([^)]+\))?\[\]', 'TEXT', sql, flags=re.IGNORECASE)
    sql = re.sub(r'INTEGER\[\]', 'TEXT', sql, flags=re.IGNORECASE)
    sql = re.sub(r'UUID\[\]', 'TEXT', sql, flags=re.IGNORECASE)

    sql = re.sub(r'CREATE OR REPLACE FUNCTION.*?END;\s*\$\$\s*LANGUAGE.*?;', 
                 '-- [Function removed - not supported in MySQL]', sql, flags=re.IGNORECASE | re.DOTALL)
    sql = re.sub(r'CREATE OR REPLACE FUNCTION.*?END;\s*LANGUAGE.*?;', 
                 '-- [Function removed - not supported in MySQL]', sql, flags=re.IGNORECASE | re.DOTALL)

    sql = re.sub(r'CREATE TRIGGER.*?;', '-- [Trigger removed - not supported in MySQL]', sql, flags=re.IGNORECASE)

    sql = re.sub(r'RETURNS TRIGGER', '', sql, flags=re.IGNORECASE)

    sql = re.sub(r'\bUUID\b(?!\(\d+\))(?!\s*\()', 'VARCHAR(36)', sql)
    sql = sql.replace('VARCHAR(36)(36)', 'VARCHAR(36)')

    sql = re.sub(r'\n{3,}', '\n\n', sql)

    sql = re.sub(r'\s+REFERENCES\s+\w+\s*\([^)]+\)(?:\s+ON\s+DELETE\s+\w+)?(?:\s+ON\s+UPDATE\s+\w+)?', '', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\s+ON\s+DELETE\s+\w+(?:\s+ON\s+UPDATE\s+\w+)?', '', sql, flags=re.IGNORECASE)

    sql = sql.replace("DEFAULT UUID()", "DEFAULT (UUID())")

    sql = re.sub(r',\s*\)', ')', sql)

    sql = re.sub(r'-- \[.*?removed.*?\]\s*\n\s*\n', '\n', sql)
    sql = re.sub(r'/\* CHECK:.*?\*/', '', sql)

    sql = re.sub(r'INSERT INTO', 'INSERT IGNORE INTO', sql, flags=re.IGNORECASE)

    sql = re.sub(r'CREATE TABLE (?!IF NOT EXISTS)(\w+)', r'CREATE TABLE IF NOT EXISTS \1', sql, flags=re.IGNORECASE)

    sql = re.sub(r'DROP INDEX IF EXISTS \w+ ON \w+;\n', '', sql)
    sql = re.sub(r'CREATE INDEX [^;]+;', '', sql, flags=re.IGNORECASE)

    sql = re.sub(r'ALTER TABLE (\w+) ADD COLUMN IF NOT EXISTS', r'ALTER TABLE \1 ADD COLUMN', sql, flags=re.IGNORECASE)

    sql = re.sub(r' +\n', '\n', sql)

    return sql.strip()

def main():
    """Read all migration files and create a consolidated MySQL migration."""
    migration_files = sorted(glob.glob(os.path.join(MIGRATION_DIR, "V[0-9]*.sql")), 
                             key=lambda x: int(re.search(r'V(\d+)', os.path.basename(x)).group(1)))

    migration_files = [f for f in migration_files if not f.endswith("V26__mysql_consolidated_schema.sql")]

    all_sql = []
    all_sql.append("-- ============================================================")
    all_sql.append("-- Beyon Consolidated MySQL Schema for Dolt")
    all_sql.append("-- Auto-generated from PostgreSQL migrations V1-V25")
    all_sql.append("-- Converted from PostgreSQL to MySQL-compatible syntax")
    all_sql.append("-- ============================================================")
    all_sql.append("")
    all_sql.append("SET NAMES utf8mb4;")
    all_sql.append("SET CHARACTER SET utf8mb4;")
    all_sql.append("")

    seen_tables = set()

    for migration_file in migration_files:
        filename = os.path.basename(migration_file)
        print(f"Processing: {filename}")

        with open(migration_file, 'r', encoding='utf-8') as f:
            content = f.read()

        converted = convert_sql(content)

        if converted.strip():
            all_sql.append(f"-- ============================================================")
            all_sql.append(f"-- Source: {filename}")
            all_sql.append(f"-- ============================================================")
            all_sql.append("")
            all_sql.append(converted)
            all_sql.append("")

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(all_sql))

    print(f"\nConsolidated migration written to: {OUTPUT_FILE}")
    print(f"Processed {len(migration_files)} migration files")

if __name__ == "__main__":
    main()
