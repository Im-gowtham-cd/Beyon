import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const AUTHENTIC_HASHES: Record<string, string> = {
  'gowthamcd.23cse@kongu.edu': '$2b$10$s3855CduR4SV7tOdnQB0BObl.fIaBDOkvW7PJZWvh27Lv5pK3sLYO',
  'gowthamcdstudies@gmail.com': '$2a$10$PdKuoxeQTPr2rZ8GugWqfO2Co0AxPYta9fN7QcrZJhtuMm5WR/Q0i',
  'konguengineeringcollege@kongu.edu': '$2a$10$.8ZM6LghRJc52u9MideaxO6AFU.FE2QIdxXjA.AS9lq3ADXz/w7k6',
  'incharge.cse@kongu.edu': '$2a$10$jvdTqk3YOmYsDKvHabt6UubVGA2KEyd9Ny91VF3jxujRueFPQRnMS',
  'coord.test@kongu.edu': '$2a$10$9qBqJNGafZQWcL/7pyI0Vu4QPV/gCvq1uP8OfH51tm5yylXd1DdQm',
  'principal.test@kongu.edu': '$2a$10$ufEAzvx6SqCtTt48qdt2heVh3NROZr74ratBvf.T/90tdfjW0b0xC',
  'gotm@grito.in': '$2a$10$JuH1Lxgi7LztrP8AWMUf3.l.XpCyv40QyU2WAsU2whAdwYiMWZNaq',
  'recruiter@infosys.com': '$2a$10$6MDpHrfxLfWulTV/rsPLrO8YasO6YYhx1WG4bu2Zk3aUdDxDSs6SG',
  'superadmin@beyon.io': '$2a$10$trVSJHzMLc9sP.9wHvMN/O4/FFvPtMDU9YOFbiiWQekWdobObBWb6',
  'verifier@beyon.io': '$2a$10$0Al4DPaLLWX0cka8tHj9COmEj15SmtiiSxfYiHdMkUJPIdjB2eKD.',
  'skillcontent@beyon.io': '$2a$10$OTBrf5KFcHI7uy1orde6auaTFmAzr8Qw.yBPzMrnoXuiDcxvACrI2',
  'questionsetter@beyon.io': '$2a$10$tD9I6rwgf1tQQ2eWEYsbceJlIrC5VamtMJxQgm7cP83DdwufIpYXO',
  'supportadmin@beyon.io': '$2a$10$0Zids6x/CRFhRikDF0ltjuVg04aP0fal4OfHeOPVdfcmHiEmB3zQe',
  'analytics@beyon.io': '$2a$10$C6fDb4RmmJztsGXHQIR3T.WAqtwjMMt.yJ9l.SBz1IQiD05XnGEF6'
};

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  console.log('Restoring authentic user password hashes...');

  for (const [email, hash] of Object.entries(AUTHENTIC_HASHES)) {
    const [res]: any = await conn.query('UPDATE users SET password_hash = ? WHERE LOWER(email) = LOWER(?)', [hash, email]);
    console.log(`Updated ${email} (${res.affectedRows} affected)`);
  }

  // Also verify student accounts
  const [rows]: any = await conn.query('SELECT email, password_hash, role FROM users WHERE email LIKE "%gowtham%"');
  console.table(rows);

  await conn.end();
  console.log('Done.');
}

main().catch(console.error);
