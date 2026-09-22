import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  const [uRows]: any = await conn.query("SELECT id, email FROM users WHERE email = 'gowthamcd.23cse@kongu.edu'");
  const user = uRows[0];
  console.log('User:', user);

  const [skills]: any = await conn.query("SELECT * FROM student_skills WHERE user_id = ?", [user.id]);
  console.log('Gowtham skills count:', skills.length);
  console.log(skills.map((s: any) => ({ name: s.skill_name, score: s.score, verified: s.verified, proficiency: s.proficiency })));

  const [weakConcepts]: any = await conn.query("SELECT * FROM student_question_attempts WHERE student_id = ? LIMIT 10", [user.id]);
  console.log('Attempts count:', weakConcepts.length);

  await conn.end();
}

main().catch(console.error);
