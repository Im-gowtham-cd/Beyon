import mysql from 'mysql2/promise';

const VALID_ROLES = new Set([
  'PLATFORM_ADMIN', 'VERIFICATION_ADMIN', 'CONTENT_ADMIN', 'QUESTION_SETTER',
  'MODERATION_ADMIN', 'ANALYTICS_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'INSTITUTION_MANAGER',
  'INSTITUTION_ADMIN', 'INSTITUTION_PLACEMENT_OFFICER', 'INSTITUTION_FACULTY',
  'INSTITUTION_COORDINATOR', 'INSTITUTION_VIEWER', 'INSTITUTION', 'PRINCIPAL',
  'PLACEMENT_COORDINATOR', 'DEPARTMENT_PLACEMENT_INCHARGE',
  'COMPANY_ADMIN', 'COMPANY_RECRUITER', 'COMPANY_HR', 'COMPANY_HIRING_MANAGER',
  'COMPANY_INTERVIEWER', 'COMPANY_LEARNING_MANAGER', 'COMPANY',
  'STUDENT'
]);

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  const [rows]: any = await conn.query('SELECT DISTINCT role, COUNT(*) as count FROM users GROUP BY role');
  console.log('Distinct roles in DB:', rows);

  for (const row of rows) {
    if (!VALID_ROLES.has(row.role)) {
      console.log(`[INVALID ROLE] ${row.role} (${row.count} users)`);
    }
  }

  // Update invalid roles to their correct UserRole enum mapping
  console.log('Fixing invalid roles...');
  await conn.query("UPDATE users SET role = 'INSTITUTION_FACULTY' WHERE role = 'FACULTY'");
  await conn.query("UPDATE users SET role = 'INSTITUTION_COORDINATOR' WHERE role = 'COORDINATOR'");
  await conn.query("UPDATE users SET role = 'COMPANY_RECRUITER' WHERE role = 'RECRUITER'");

  const [afterRows]: any = await conn.query('SELECT DISTINCT role, COUNT(*) as count FROM users GROUP BY role');
  console.log('Distinct roles after fix:', afterRows);

  await conn.end();
}

main().catch(console.error);
