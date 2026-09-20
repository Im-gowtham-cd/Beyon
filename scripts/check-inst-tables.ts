import { doltQuery, doltExec, esc } from "./seed/engine/dolt.js";

const tables = doltQuery(`
  SELECT table_name, column_name 
  FROM information_schema.columns 
  WHERE table_schema = 'beyon' 
    AND (column_name LIKE '%institution%' OR column_name = 'college_id');
`);

console.log("Found columns:", tables);

const kecSeedId = "47c27bbf-ab39-46e3-a316-faea928e44c4";
const realKecId = "c79fe93e-d36e-4497-be65-c6c928bf8c27";

for (const row of tables) {
  const t = row.TABLE_NAME || row.table_name;
  const c = row.COLUMN_NAME || row.column_name;
  try {
    const counts = doltQuery(`SELECT count(*) as cnt FROM \`${t}\` WHERE \`${c}\` = '${kecSeedId}';`);
    const count = counts[0]?.cnt || 0;
    if (Number(count) > 0) {
      console.log(`Table ${t}.${c} has ${count} rows referencing ${kecSeedId}`);
    }
  } catch (e) {
    // ignore
  }
}
