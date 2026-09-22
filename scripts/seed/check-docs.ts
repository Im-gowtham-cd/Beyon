import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  const [users]: any = await conn.query('SELECT id, email FROM users WHERE email = ?', ['gowthamcd.23cse@kongu.edu']);
  const userId = users[0].id;

  const [profiles]: any = await conn.query('SELECT student_id_card_url, resume_url, internship_experience FROM student_profiles WHERE user_id = ?', [userId]);
  const [files]: any = await conn.query('SELECT * FROM file_documents WHERE user_id = ?', [userId]);

  console.log('--- PROFILES ---');
  console.log(profiles[0]);
  console.log('--- FILE DOCUMENTS ---');
  console.log(files);

  await conn.end();
}

main().catch(console.error);
