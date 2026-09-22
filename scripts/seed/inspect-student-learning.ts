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
  console.log('User:', user);

  const [topics]: any = await conn.query('SELECT * FROM student_learning_topics WHERE user_id = ?', [user.id]);
  console.log('Student learning topics count for Gowtham:', topics.length);
  console.table(topics.slice(0, 10));

  const [skills]: any = await conn.query('SELECT * FROM student_skills WHERE user_id = ?', [user.id]);
  console.log('Student verified skills for Gowtham:', skills.length);
  console.table(skills.map((s: any) => ({ name: s.skill_name, score: s.score, verified: s.verified, prof: s.proficiency })));

  await conn.end();
}

main().catch(console.error);
