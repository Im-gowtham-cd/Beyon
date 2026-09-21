import mysql from "mysql2/promise";

async function check() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "beyon"
  });

  const [opps]: any = await conn.execute("SELECT id, title, opportunity_type, status, target_institution_ids FROM company_opportunities");
  console.log("Opportunities in DB count:", opps.length);
  for (const o of opps) {
    console.log(`- [${o.opportunity_type}] ${o.title} | Status: ${o.status} | Targets: ${o.target_institution_ids}`);
  }

  const [users]: any = await conn.execute("SELECT id, email, role FROM users WHERE email = 'gowthamcd.23cse@kongu.edu'");
  console.log("User:", users);

  const [profiles]: any = await conn.execute("SELECT user_id, institution, department FROM student_profiles WHERE user_id = ?", [users[0]?.id]);
  console.log("Profile:", profiles);

  const [instUsers]: any = await conn.execute("SELECT id, email, display_name, role FROM users WHERE role LIKE '%INSTITUTION%'");
  console.log("Institution Users:", instUsers);

  const [instProfiles]: any = await conn.execute("SELECT user_id, institution_name, institution_code FROM institution_profiles");
  console.log("Institution Profiles:", instProfiles);

  const [instStudents]: any = await conn.execute("SELECT * FROM institution_students WHERE student_id = ?", [users[0]?.id]);
  console.log("Institution Students Links:", instStudents);

  const [drives]: any = await conn.execute("SELECT id, opportunity_id, institution_id, status FROM placement_drives");
  console.log("Placement Drives count:", drives.length);
  for (const d of drives) {
    console.log(`- Drive ${d.id}: Opp ${d.opportunity_id} | Inst ${d.institution_id} | Status: ${d.status}`);
  }

  await conn.end();
}

check().catch(console.error);
