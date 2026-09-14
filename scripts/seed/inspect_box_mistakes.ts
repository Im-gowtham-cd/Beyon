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
    `SELECT a.id as attemptId, a.question_id, a.user_answer, a.is_correct, a.time_spent_seconds, a.created_at,
            q.title, q.description, q.difficulty, q.tags
     FROM student_question_attempts a
     JOIN questions q ON q.id = a.question_id
     WHERE a.student_id = ? AND (q.tags LIKE '%box%' OR q.tags LIKE '%typography%' OR q.title LIKE '%Box Model%')
     ORDER BY a.created_at DESC`,
    [studentId]
  );

  for (const r of rows as any[]) {
    const [options] = await conn.query(
      `SELECT id, option_text, is_correct, explanation FROM question_options WHERE question_id = ? ORDER BY display_order`,
      [r.question_id]
    );
    r.options = options;
  }

  console.log(JSON.stringify(rows, null, 2));
  await conn.end();
}

main().catch(console.error);
