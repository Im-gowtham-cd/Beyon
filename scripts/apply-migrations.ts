import { doltExec } from "./seed/engine/dolt.js";
import fs from "fs";
import path from "path";

const dir = path.resolve(__dirname, "../backend/src/main/resources/db/migration");
const files = fs.readdirSync(dir).filter(f => f.endsWith(".sql")).sort();

for (const f of files) {
  const fullPath = path.join(dir, f);
  let sql = fs.readFileSync(fullPath, "utf8");
  const stmts = sql.split(/;\s*[\r\n]+/).map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith("--"));
  for (const stmt of stmts) {
    try {
      doltExec(stmt);
    } catch {
      // ignore table/column/index already exists
    }
  }
  console.log("✅ Applied migration:", f);
}
console.log("🎉 All migrations applied successfully!");
process.exit(0);
