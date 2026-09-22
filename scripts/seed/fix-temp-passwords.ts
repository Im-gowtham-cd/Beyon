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

  const [users]: any = await conn.query('SELECT id, email, role, status, must_change_password, password_hash FROM users WHERE must_change_password = 1 OR email LIKE "%incharge%"');
  console.log('Users found:', users.length);
  for (const u of users) {
    console.log(`Email: ${u.email} | Role: ${u.role} | MustChange: ${u.must_change_password} | Hash: ${u.password_hash}`);
  }

  const hash123 = bcrypt.hashSync('Password@123', 10);
  const [res1]: any = await conn.query('UPDATE users SET password_hash = ? WHERE email = ?', [hash123, 'incharge.cse@kongu.edu']);
  console.log('Updated incharge.cse@kongu.edu affected rows:', res1.affectedRows);

  const [res2]: any = await conn.query('UPDATE users SET password_hash = ? WHERE must_change_password = 1', [hash123]);
  console.log('Updated must_change_password = 1 users affected rows:', res2.affectedRows);

  await conn.end();
}

main().catch(console.error);
