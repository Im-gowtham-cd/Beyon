import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

async function main() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    database: "beyon",
    multipleStatements: true,
  });

  const dir = path.resolve(__dirname, "../../backend/src/main/resources/db/migration");
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".sql")).sort();

  for (const f of files) {
    const fullPath = path.join(dir, f);
    const sql = fs.readFileSync(fullPath, "utf8");
    const stmts = sql
      .split(/;\s*[\r\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"));

    let count = 0;
    for (const stmt of stmts) {
      try {
        await conn.query(stmt);
        count++;
      } catch (err: any) {
        // ignore already exists or duplicate index
      }
    }
    console.log(`✅ Applied ${f} (${count} statements)`);
  }

  const [tables] = await conn.query("SHOW TABLES;");
  console.log(`Total Tables in Dolt Server: ${(tables as any[]).length}`);
  await conn.end();
  process.exit(0);
}

main().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
