import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  const [committedUsers]: any = await conn.query('SELECT email, password_hash, role FROM users AS OF "n268idmp3bas18kk0imjnn0lf127hrgu"');
  console.log('--- COMMITTED ORIGINAL PASSWORDS ---');
  for (const u of committedUsers) {
    console.log(`${u.email} -> ${u.password_hash}`);
  }

  await conn.end();
}

main().catch(console.error);
