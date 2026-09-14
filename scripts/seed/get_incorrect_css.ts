import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });
  const studentId = '1853170b-89ad-41ec-b73d-14109608e84c';

  const [rows] = await conn.query(
    'SELECT a.id as attemptId, a.question_id, a.user_answer, a.is_correct, a.time_spent_seconds, a.created_at, ' +
    'q.title, q.description, q.difficulty, q.tags, q.evaluation_method ' +
    'FROM student_question_attempts a ' +
    'JOIN questions q ON q.id = a.question_id ' +
    'JOIN skills s ON s.id = q.skill_id ' +
    'WHERE a.student_id = ? AND s.name = "CSS" ' +
    'ORDER BY a.created_at DESC',
    [studentId]
  );

  for (const r of rows as any[]) {
    const [options] = await conn.query(
      'SELECT id, option_text, is_correct, explanation FROM question_options WHERE question_id = ? ORDER BY display_order',
      [r.question_id]
    );
    r.options = options;
  }

  const incorrect = (rows as any[]).filter(r => r.is_correct === 0);
  console.log('Total CSS attempts:', (rows as any[]).length);
  console.log('Total Incorrect CSS attempts:', incorrect.length);
  console.log(JSON.stringify(incorrect, null, 2));

  await conn.end();
}

main().catch(console.error);
