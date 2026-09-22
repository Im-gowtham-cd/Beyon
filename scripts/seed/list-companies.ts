import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  const [rows]: any = await conn.query("SELECT email, role FROM users WHERE role LIKE '%COMPANY%' OR role LIKE '%RECRUITER%'");
  console.log('Company accounts in DB:', rows);
  await conn.end();
}

main().catch(console.error);
