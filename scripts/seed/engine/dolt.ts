// ============================================================
// Beyon Seed — Dolt SQL Engine
// Executes SQL against the beyon Dolt database via CLI
// ============================================================

import * as crypto from "crypto";
import { execSync, spawnSync } from "child_process";
import { DOLT_DB_DIR } from "../config.js";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

let _queryCount = 0;

export function getQueryCount() { return _queryCount; }

/**
 * Convert any string key into a deterministic RFC-4122 UUID v4 format.
 */
export function toUUID(str: string): string {
  if (!str) return str;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return str.toLowerCase();
  }
  const hash = crypto.createHash("md5").update(str).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`.toLowerCase();
}

/**
 * Execute a single SQL statement (or small batch) against Dolt.
 */
export function doltExec(sql: string): void {
  _queryCount++;
  // Write to temp file to avoid shell quoting issues
  const tmpFile = path.join(os.tmpdir(), `beyon_seed_${Date.now()}_${Math.random().toString(36).slice(2)}.sql`);
  try {
    const fullSql = sql.startsWith("USE ") ? sql : `USE beyon;\n${sql}`;
    fs.writeFileSync(tmpFile, fullSql, "utf8");
    const result = spawnSync(
      "dolt",
      ["sql", `--file=${tmpFile}`],
      { cwd: DOLT_DB_DIR, encoding: "utf8", maxBuffer: 50 * 1024 * 1024 }
    );
    if (result.status !== 0) {
      const errMsg = result.stderr || result.stdout || "(no output)";
      // Ignore duplicate key errors for idempotency
      if (
        errMsg.includes("Duplicate entry") ||
        errMsg.includes("duplicate key") ||
        errMsg.includes("ER_DUP_ENTRY")
      ) {
        return;
      }
      throw new Error(`Dolt SQL error:\n${errMsg}\nSQL:\n${sql.slice(0, 500)}`);
    }
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}

/**
 * Execute a SQL query and return parsed rows.
 */
export function doltQuery(sql: string): Record<string, string>[] {
  const tmpFile = path.join(os.tmpdir(), `beyon_seed_q_${Date.now()}.sql`);
  try {
    const fullSql = sql.startsWith("USE ") ? sql : `USE beyon;\n${sql}`;
    fs.writeFileSync(tmpFile, fullSql, "utf8");
    const result = spawnSync(
      "dolt",
      ["sql", "--result-format=csv", `--file=${tmpFile}`],
      { cwd: DOLT_DB_DIR, encoding: "utf8", maxBuffer: 50 * 1024 * 1024 }
    );
    if (result.status !== 0) {
      throw new Error(`Dolt query error: ${result.stderr}`);
    }
    return parseCSV(result.stdout || "");
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row;
  });
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && !inQuotes) { inQuotes = true; continue; }
    if (ch === '"' && inQuotes) {
      if (line[i + 1] === '"') { current += '"'; i++; } else inQuotes = false;
      continue;
    }
    if (ch === "," && !inQuotes) { result.push(current); current = ""; continue; }
    current += ch;
  }
  result.push(current);
  return result;
}

/**
 * Batch-execute multiple SQL statements from an array, chunking for performance.
 */
export function doltBatch(statements: string[], chunkSize = 200): void {
  if (statements.length === 0) return;
  for (let i = 0; i < statements.length; i += chunkSize) {
    const chunk = statements.slice(i, i + chunkSize);
    const sql = chunk.join("\n");
    doltExec(sql);
  }
}

/**
 * Escape a string for safe insertion in SQL.
 */
export function esc(val: string | null | undefined): string {
  if (val == null) return "NULL";
  return `'${String(val).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

export function escNum(val: number | null | undefined): string {
  if (val == null) return "NULL";
  return String(val);
}
