import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  const [cols]: any = await conn.query('DESCRIBE questions');
  console.log('Columns in questions:');
  console.table(cols);

  const [sample]: any = await conn.query('SELECT * FROM questions LIMIT 3');
  console.log('Sample questions:', sample);

  const [skills]: any = await conn.query('SELECT skill_id, count(*) as count FROM questions GROUP BY skill_id ORDER BY count DESC LIMIT 10');
  console.log('Questions by skill_id:', skills);

  await conn.end();
}

main().catch(console.error);
