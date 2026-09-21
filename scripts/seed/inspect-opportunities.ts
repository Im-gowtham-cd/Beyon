import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  const [oppCols]: any = await conn.query('DESC company_opportunities');
  console.log('company_opportunities cols:', oppCols.map((c: any) => c.Field));

  const [skillCols]: any = await conn.query('DESC student_skills');
  console.log('student_skills cols:', skillCols.map((c: any) => c.Field));

  const [skills]: any = await conn.query("SELECT * FROM student_skills LIMIT 5");
  console.log('student_skills sample:', skills);

  const [opps]: any = await conn.query('SELECT id, title, opportunity_type, required_skills, min_cgpa, package_lpa FROM company_opportunities');
  console.log('Opps count:', opps.length);
  for (const o of opps) {
    console.log(`Opp: [${o.opportunity_type}] ${o.title} | Skills: ${o.required_skills} | CGPA: ${o.min_cgpa}`);
  }

  await conn.end();
}

main().catch(console.error);
