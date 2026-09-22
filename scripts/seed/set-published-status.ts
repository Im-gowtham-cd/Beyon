import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  await conn.query("UPDATE company_opportunities SET status = 'PUBLISHED' WHERE status = 'OPEN' OR status IS NULL");
  console.log('Updated opportunities status to PUBLISHED.');

  // Also verify student placement drives
  const [rows]: any = await conn.query("SELECT id, title, opportunity_type, status, required_skills FROM company_opportunities WHERE status = 'PUBLISHED'");
  console.log(`Found ${rows.length} PUBLISHED opportunities.`);

  await conn.end();
}

main().catch(console.error);
