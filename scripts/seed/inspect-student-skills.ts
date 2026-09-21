import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  const [users]: any = await conn.query('SELECT id, email FROM users WHERE email = "gowthamcd.23cse@kongu.edu"');
  const user = users[0];

  const [skills]: any = await conn.query('SELECT * FROM student_skills WHERE user_id = ? ORDER BY skill_name', [user.id]);
  console.log(`Total student_skills rows for Gowtham: ${skills.length}`);
  console.table(skills);

  await conn.end();
}

main().catch(console.error);
