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

  const [instUsers]: any = await conn.query("SELECT id, email, display_name FROM users WHERE role = 'INSTITUTION' AND (email LIKE '%@kongu.edu' OR display_name LIKE '%Kongu%')");
  const kecIds = instUsers.map((u: any) => u.id);
  console.log('KEC Institution IDs:', kecIds);

  const targetIdsJoined = kecIds.join(',');

  // Update all company_opportunities
  await conn.query("UPDATE company_opportunities SET target_institution_ids = ?, target_institution_names = 'Kongu Engineering College'", [targetIdsJoined]);

  // For each opportunity and each KEC institution ID, create/approve placement_drive
  const [opps]: any = await conn.query("SELECT id, title, company_user_id, package_lpa FROM company_opportunities");
  for (const opp of opps) {
    for (const instId of kecIds) {
      const [existing]: any = await conn.query("SELECT id FROM placement_drives WHERE opportunity_id = ? AND institution_id = ?", [opp.id, instId]);
      if (existing.length > 0) {
        await conn.query("UPDATE placement_drives SET status = 'APPROVED' WHERE id = ?", [existing[0].id]);
      } else {
        await conn.query(
          "INSERT INTO placement_drives (id, opportunity_id, institution_id, company_user_id, title, description, status, package_lpa, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'APPROVED', ?, NOW(), NOW())",
          [randomUUID(), opp.id, instId, opp.company_user_id, opp.title, 'Approved for KEC students.', opp.package_lpa || 12.00]
        );
      }
    }
  }

  console.log('Successfully approved drives across all KEC institution profiles!');
  await conn.end();
}

main().catch(console.error);
