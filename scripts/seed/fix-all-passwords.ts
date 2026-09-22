import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const ADMIN_PASSWORDS: Record<string, string> = {
  'superadmin@beyon.io': 'Superadmin@2026',
  'verifier@beyon.io': 'Verifier@2026',
  'skillcontent@beyon.io': 'Skillcontent@2026',
  'questionsetter@beyon.io': 'Questionsetter@2026',
  'supportadmin@beyon.io': 'Supportadmin@2026',
  'analytics@beyon.io': 'Analytics@2026',
};

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  console.log('Connected to Dolt DB (beyon)...');

  const defaultHash = bcrypt.hashSync('Password@123', 10);

  const [users]: any = await conn.query('SELECT id, email, role FROM users');
  console.log(`Found ${users.length} users to update.`);

  let updatedCount = 0;
  for (const u of users) {
    let pw = 'Password@123';
    let targetHash = defaultHash;

    if (ADMIN_PASSWORDS[u.email.toLowerCase()]) {
      pw = ADMIN_PASSWORDS[u.email.toLowerCase()];
      targetHash = bcrypt.hashSync(pw, 10);
    }

    await conn.query('UPDATE users SET password_hash = ? WHERE id = ?', [targetHash, u.id]);
    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} users with fresh password hashes!`);

  // Verify test accounts
  const testEmails = [
    'gowthamcd.23cse@kongu.edu',
    'incharge.cse@kongu.edu',
    'recruiter@infosys.com',
    'konguengineeringcollege@kongu.edu',
    'principal.test@kongu.edu',
    'principal@kongu.edu',
    'coord.test@kongu.edu',
    'gotm@grito.in',
    'superadmin@beyon.io'
  ];

  for (const email of testEmails) {
    const [rows]: any = await conn.query('SELECT email, password_hash, role, status FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      const u = rows[0];
      const expectedPw = ADMIN_PASSWORDS[email.toLowerCase()] || 'Password@123';
      const ok = bcrypt.compareSync(expectedPw, u.password_hash);
      console.log(`[VERIFIED] ${email} -> password "${expectedPw}" valid: ${ok}`);
    } else {
      console.log(`[MISSING] ${email} not found in users table!`);
    }
  }

  await conn.end();
}

main().catch(console.error);
