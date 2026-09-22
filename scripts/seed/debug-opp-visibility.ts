import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  const [uRows]: any = await conn.query("SELECT id, display_name FROM users WHERE email = 'gowthamcd.23cse@kongu.edu'");
  const student = uRows[0];
  console.log('Student:', student);

  const [profRows]: any = await conn.query("SELECT * FROM student_profiles WHERE user_id = ?", [student.id]);
  console.log('Student Profile:', profRows[0]);

  const [instStudRows]: any = await conn.query("SELECT * FROM institution_students WHERE student_id = ?", [student.id]);
  console.log('Institution Student Link:', instStudRows);

  const [instUsers]: any = await conn.query("SELECT id, email, display_name FROM users WHERE role = 'INSTITUTION'");
  console.log('Institution Users in DB:', instUsers);

  const [oppRows]: any = await conn.query("SELECT id, title, opportunity_type, target_institution_ids, status FROM company_opportunities LIMIT 5");
  console.log('Opportunities sample:', oppRows);

  await conn.end();
}

main().catch(console.error);
