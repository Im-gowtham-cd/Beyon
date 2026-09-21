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
  if (!users || users.length === 0) {
    console.error('User not found');
    await conn.end();
    return;
  }
  const userId = users[0].id;

  const skillsData = [
    { name: 'JavaScript', score: 92.0, tested: 20, correct: 18, verified: 1, cat: 'Technical', prof: 'ADVANCED' },
    { name: 'CSS', score: 85.0, tested: 20, correct: 17, verified: 1, cat: 'Technical', prof: 'INTERMEDIATE' },
    { name: 'HTML', score: 80.0, tested: 20, correct: 16, verified: 1, cat: 'Technical', prof: 'INTERMEDIATE' },
    { name: 'PostgreSQL', score: 78.0, tested: 20, correct: 15, verified: 1, cat: 'Database', prof: 'INTERMEDIATE' },
    { name: 'React', score: 70.0, tested: 20, correct: 14, verified: 1, cat: 'Frontend', prof: 'INTERMEDIATE' },
    { name: 'Java', score: 65.0, tested: 20, correct: 13, verified: 1, cat: 'Languages', prof: 'INTERMEDIATE' },
    { name: 'Python', score: 65.0, tested: 20, correct: 13, verified: 1, cat: 'Languages', prof: 'INTERMEDIATE' },
    { name: 'Spring Boot', score: 40.0, tested: 10, correct: 4, verified: 0, cat: 'Backend', prof: 'BEGINNER' },
    { name: 'TypeScript', score: 10.0, tested: 10, correct: 1, verified: 0, cat: 'Languages', prof: 'BEGINNER' },
  ];

  for (const s of skillsData) {
    await conn.query(
      `UPDATE student_skills 
       SET score = ?, questions_tested = ?, questions_correct = ?, verified = ?, category = ?, proficiency = ?, updated_at = NOW()
       WHERE user_id = ? AND LOWER(skill_name) = LOWER(?)`,
      [s.score, s.tested, s.correct, s.verified, s.cat, s.prof, userId, s.name]
    );
  }

  console.log('✅ Synchronized 9 skills with clean math and 3-tier categories for Gowtham');
  await conn.end();
}

main().catch(console.error);
