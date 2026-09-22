import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon'
  });

  console.log('Linking student institution and approving placement drives...');

  const [instRows]: any = await conn.query("SELECT id, display_name FROM users WHERE email IN ('konguengineeringcollege@kongu.edu', 'principal@kongu.edu') LIMIT 1");
  const kecInstId = instRows[0]?.id;
  console.log('KEC Institution ID:', kecInstId);

  const [students]: any = await conn.query("SELECT id, email FROM users WHERE email LIKE '%@kongu.edu' OR email LIKE '%@students.kec-demo.local' OR email LIKE '%@example.beyon.test'");
  console.log(`Found ${students.length} students to link.`);

  for (const s of students) {
    await conn.query("UPDATE student_profiles SET institution = 'Kongu Engineering College' WHERE user_id = ?", [s.id]);

    const [existingLink]: any = await conn.query("SELECT id FROM institution_students WHERE student_id = ? AND institution_id = ?", [s.id, kecInstId]);
    if (existingLink.length === 0) {
      await conn.query(
        "INSERT INTO institution_students (id, institution_id, student_id, department, batch, admission_year, graduation_year, placement_status, verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())",
        [randomUUID(), kecInstId, s.id, 'Computer Science and Engineering', '2022-2026', 2022, 2026, 'NOT_PLACED']
      );
    }
  }

  const [opps]: any = await conn.query("SELECT id, title, company_user_id, package_lpa FROM company_opportunities");
  for (const opp of opps) {
    await conn.query(
      "UPDATE company_opportunities SET target_institution_ids = ?, target_institution_names = 'Kongu Engineering College' WHERE id = ?",
      [kecInstId, opp.id]
    );

    const [existingDrive]: any = await conn.query("SELECT id FROM placement_drives WHERE opportunity_id = ? AND institution_id = ?", [opp.id, kecInstId]);
    if (existingDrive.length > 0) {
      await conn.query("UPDATE placement_drives SET status = 'APPROVED' WHERE id = ?", [existingDrive[0].id]);
    } else {
      await conn.query(
        "INSERT INTO placement_drives (id, opportunity_id, institution_id, company_user_id, title, description, status, package_lpa, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'APPROVED', ?, NOW(), NOW())",
        [randomUUID(), opp.id, kecInstId, opp.company_user_id, opp.title, 'Campus recruitment drive approved for KEC students.', opp.package_lpa || 12.00]
      );
    }
  }

  console.log('Successfully linked students and approved placement drives for KEC!');
  await conn.end();
}

main().catch(console.error);
