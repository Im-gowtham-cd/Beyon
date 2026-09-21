import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  const [dupes]: any = await conn.query(`
    SELECT user_id, LOWER(skill_name) as skill_clean, COUNT(*) as cnt
    FROM student_skills
    GROUP BY user_id, LOWER(skill_name)
    HAVING cnt > 1
  `);

  console.log(`Total duplicate (user, skill) groups in database: ${dupes.length}`);
  console.table(dupes);

  await conn.end();
}

main().catch(console.error);
