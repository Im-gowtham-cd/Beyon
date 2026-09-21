import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  const [users]: any = await conn.query('SELECT id, email, role, password_hash, status, must_change_password FROM users WHERE email LIKE "%incharge%" OR email LIKE "%kongu.edu%"');
  console.log(`Found matching users: ${users.length}`);

  for (const u of users) {
    console.log(`\n--- USER ---`);
    console.log(`Email: ${u.email}`);
    console.log(`Role: ${u.role}`);
    console.log(`Status: ${u.status}`);
    console.log(`MustChange: ${u.must_change_password}`);
    console.log(`Hash: ${u.password_hash}`);
  }

  await conn.end();
}

main().catch(console.error);
