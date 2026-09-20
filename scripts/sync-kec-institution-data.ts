import { doltExec, doltQuery, esc } from "./seed/engine/dolt.js";

const srcId = "47c27bbf-ab39-46e3-a316-faea928e44c4";
const dstId = "c79fe93e-d36e-4497-be65-c6c928bf8c27"; // konguengineeringcollege@kongu.edu

console.log("Synchronizing full KEC seed dataset to konguengineeringcollege@kongu.edu (dstId)...");

const tablesWithInstId = [
  "institution_profiles",
  "institution_departments",
  "institution_students",
  "placement_drives",
  "placement_records",
  "recruitment_applications",
  "recruitment_placements",
  "student_academic_records",
  "institution_ratings",
  "institution_rating_snapshots",
  "institution_placement_stats"
];

for (const tableName of tablesWithInstId) {
  try {
    const cols = doltQuery(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'beyon' AND table_name = '${tableName}'
      ORDER BY ordinal_position;
    `).map(r => r.COLUMN_NAME || r.column_name);

    console.log(`Copying data for table: ${tableName} (${cols.join(", ")})...`);

    // Check if table has institution_id or user_id
    const instCol = cols.includes("institution_id") ? "institution_id" : (cols.includes("user_id") ? "user_id" : null);
    if (!instCol) continue;

    doltExec(`DELETE FROM \`${tableName}\` WHERE \`${instCol}\` = ${esc(dstId)};`);

    const selectExprs = cols.map(c => {
      if (c === "id") return "UUID()";
      if (c === instCol) return esc(dstId);
      return `\`${c}\``;
    }).join(", ");

    const insertCols = cols.map(c => `\`${c}\``).join(", ");

    doltExec(`
      INSERT INTO \`${tableName}\` (${insertCols})
      SELECT ${selectExprs}
      FROM \`${tableName}\`
      WHERE \`${instCol}\` = ${esc(srcId)};
    `);

    const cnt = doltQuery(`SELECT count(*) as c FROM \`${tableName}\` WHERE \`${instCol}\` = ${esc(dstId)};`)[0]?.c;
    console.log(`  ✓ Successfully populated ${cnt} rows in ${tableName}`);
  } catch (err) {
    console.error(`  ❌ Error copying ${tableName}:`, err);
  }
}

// Update users table for konguengineeringcollege@kongu.edu
doltExec(`UPDATE users SET institution_id = ${esc(dstId)} WHERE email = 'konguengineeringcollege@kongu.edu';`);

console.log("Completed dynamic dataset synchronization!");
