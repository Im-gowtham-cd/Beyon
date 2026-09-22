import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  const [cols]: any = await conn.query('DESC student_question_attempts');
  console.log('student_question_attempts columns:', cols.map((c: any) => `${c.Field} (${c.Type})`));

  await conn.end();
}

main().catch(console.error);
