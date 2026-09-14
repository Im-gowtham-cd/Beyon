import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import net from 'node:net';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let doltPool: mysql.Pool | null = null;

const DOLT_CONFIG = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'beyon',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const FLOCI_ENDPOINT = 'http://localhost:4566';
const FLOCI_REGION = 'us-east-1';

function getDoltPool(): mysql.Pool {
  if (!doltPool) {
    doltPool = mysql.createPool(DOLT_CONFIG);
  }
  return doltPool;
}

function runAws(args: string[]): any {
  try {
    const fullArgs = [`--endpoint-url=${FLOCI_ENDPOINT}`, `--region=${FLOCI_REGION}`, ...args];
    const out = execFileSync('aws', fullArgs, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    if (!out) return null;
    try {
      return JSON.parse(out);
    } catch {
      return out;
    }
  } catch (err: any) {
    const msg = err.stderr ? err.stderr.toString().trim() : err.message;
    throw new Error(msg || 'AWS CLI error');
  }
}

async function checkTcpPort(host: string, port: number, timeoutMs = 1500): Promise<{ online: boolean; latencyMs: number }> {
  const start = Date.now();
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      if (!settled) {
        settled = true;
        const latency = Date.now() - start;
        socket.destroy();
        resolve({ online: true, latencyMs: latency });
      }
    });

    socket.on('timeout', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({ online: false, latencyMs: -1 });
      }
    });

    socket.on('error', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({ online: false, latencyMs: -1 });
      }
    });

    socket.connect(port, host);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 700,
    title: 'Beyon Realtime Database & Cloud Workbench',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const rendererPath = path.join(__dirname, '../renderer/index.html');
  mainWindow.loadFile(rendererPath);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ==========================================
// IPC: DOLT DATABASE (MySQL Protocol)
// ==========================================

ipcMain.handle('dolt:status', async () => {
  try {
    const pool = getDoltPool();
    const t0 = Date.now();
    const [rows]: any = await pool.query('SELECT VERSION() as version, DATABASE() as db, active_branch() as branch');
    const latencyMs = Date.now() - t0;
    return {
      online: true,
      latencyMs,
      version: rows[0]?.version || 'Dolt SQL Server',
      database: rows[0]?.db || 'beyon',
      branch: rows[0]?.branch || 'main',
    };
  } catch (err: any) {
    return { online: false, latencyMs: -1, error: err.message };
  }
});

ipcMain.handle('dolt:tables', async () => {
  try {
    const pool = getDoltPool();
    const sql = `
      SELECT 
        table_name as name, 
        table_rows as rowCount, 
        data_length as dataBytes, 
        engine, 
        create_time as createdAt
      FROM information_schema.tables 
      WHERE table_schema = 'beyon' 
      ORDER BY table_name ASC
    `;
    const [rows]: any = await pool.query(sql);
    return { success: true, tables: rows };
  } catch (err: any) {
    return { success: false, error: err.message, tables: [] };
  }
});

ipcMain.handle('dolt:schema', async (_event, tableName: string) => {
  try {
    const pool = getDoltPool();
    const colSql = `
      SELECT 
        column_name as name, 
        column_type as type, 
        is_nullable as isNullable, 
        column_key as columnKey, 
        column_default as defaultValue, 
        extra
      FROM information_schema.columns 
      WHERE table_schema = 'beyon' AND table_name = ?
      ORDER BY ordinal_position ASC
    `;
    const [columns]: any = await pool.query(colSql, [tableName]);

    const idxSql = `SHOW KEYS FROM \`${tableName.replace(/`/g, '')}\``;
    const [indexes]: any = await pool.query(idxSql);

    return { success: true, columns, indexes };
  } catch (err: any) {
    return { success: false, error: err.message, columns: [], indexes: [] };
  }
});

ipcMain.handle('dolt:rows', async (_event, { tableName, limit = 50, offset = 0, search = '' }: { tableName: string; limit?: number; offset?: number; search?: string }) => {
  try {
    const pool = getDoltPool();
    const safeTable = tableName.replace(/`/g, '');
    const [countRows]: any = await pool.query(`SELECT COUNT(*) as total FROM \`${safeTable}\``);
    const total = countRows[0]?.total || 0;

    let query = `SELECT * FROM \`${safeTable}\``;
    const params: any[] = [];

    if (search && search.trim()) {
      query += ` LIMIT 100`;
    } else {
      query += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number(offset));
    }

    const [rows]: any = await pool.query(query, params);
    return { success: true, rows, total, limit, offset };
  } catch (err: any) {
    return { success: false, error: err.message, rows: [], total: 0 };
  }
});

ipcMain.handle('dolt:query', async (_event, sqlQuery: string) => {
  const t0 = Date.now();
  try {
    const pool = getDoltPool();
    const [rows, fields]: any = await pool.query(sqlQuery);
    const durationMs = Date.now() - t0;

    if (Array.isArray(rows)) {
      const columns = fields ? fields.map((f: any) => f.name) : (rows.length > 0 ? Object.keys(rows[0]) : []);
      return {
        success: true,
        isSelect: true,
        durationMs,
        columns,
        rows,
        rowCount: rows.length,
      };
    } else {
      return {
        success: true,
        isSelect: false,
        durationMs,
        affectedRows: rows.affectedRows ?? 0,
        message: rows.message || 'Query executed successfully',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      durationMs: Date.now() - t0,
      error: err.message,
      rows: [],
      columns: [],
    };
  }
});

ipcMain.handle('dolt:log', async () => {
  try {
    const pool = getDoltPool();
    const [rows]: any = await pool.query('SELECT commit_hash, committer, email, date, message FROM dolt_log ORDER BY date DESC LIMIT 50');
    return { success: true, commits: rows };
  } catch (err: any) {
    return { success: false, error: err.message, commits: [] };
  }
});

ipcMain.handle('dolt:branches', async () => {
  try {
    const pool = getDoltPool();
    const [rows]: any = await pool.query('SELECT name, hash, latest_committer, latest_commit_date, latest_commit_message FROM dolt_branches');
    return { success: true, branches: rows };
  } catch (err: any) {
    return { success: false, error: err.message, branches: [] };
  }
});

ipcMain.handle('dolt:diff', async (_event, tableName?: string) => {
  try {
    const pool = getDoltPool();
    let sql = 'SELECT * FROM dolt_status';
    const [statusRows]: any = await pool.query(sql);

    let diffRows: any[] = [];
    if (tableName) {
      try {
        const [dRows]: any = await pool.query(`SELECT * FROM dolt_diff_${tableName.replace(/`/g, '')} LIMIT 50`);
        diffRows = dRows;
      } catch {}
    }
    return { success: true, status: statusRows, diffs: diffRows };
  } catch (err: any) {
    return { success: false, error: err.message, status: [], diffs: [] };
  }
});

// ==========================================
// IPC: FLOCI AWS SERVICES (4566)
// ==========================================

ipcMain.handle('floci:status', async () => {
  try {
    const res = await fetch(FLOCI_ENDPOINT);
    return { online: res.status >= 200 && res.status < 500, endpoint: FLOCI_ENDPOINT };
  } catch {
    return { online: false, endpoint: FLOCI_ENDPOINT };
  }
});

// S3
ipcMain.handle('floci:s3:list-buckets', async () => {
  try {
    const out = runAws(['s3api', 'list-buckets']);
    const buckets = out?.Buckets || [];
    return { success: true, buckets };
  } catch (err: any) {
    return { success: false, error: err.message, buckets: [] };
  }
});

ipcMain.handle('floci:s3:list-objects', async (_event, bucketName: string) => {
  try {
    const out = runAws(['s3api', 'list-objects-v2', '--bucket', bucketName]);
    const objects = out?.Contents || [];
    return { success: true, objects };
  } catch (err: any) {
    return { success: false, error: err.message, objects: [] };
  }
});

// SQS
ipcMain.handle('floci:sqs:list-queues', async () => {
  try {
    const out = runAws(['sqs', 'list-queues']);
    const urls: string[] = out?.QueueUrls || [];
    const queues = [];

    for (const url of urls) {
      const qName = url.substring(url.lastIndexOf('/') + 1);
      try {
        const attrOut = runAws(['sqs', 'get-queue-attributes', '--queue-url', url, '--attribute-names', 'All']);
        const attrs = attrOut?.Attributes || {};
        queues.push({
          url,
          name: qName,
          visibleMessages: parseInt(attrs.ApproximateNumberOfMessages || '0', 10),
          inFlightMessages: parseInt(attrs.ApproximateNumberOfMessagesNotVisible || '0', 10),
          delayedMessages: parseInt(attrs.ApproximateNumberOfMessagesDelayed || '0', 10),
          createdTimestamp: attrs.CreatedTimestamp,
          isDlq: qName.includes('-dlq'),
        });
      } catch {
        queues.push({
          url,
          name: qName,
          visibleMessages: 0,
          inFlightMessages: 0,
          delayedMessages: 0,
          isDlq: qName.includes('-dlq'),
        });
      }
    }

    return { success: true, queues };
  } catch (err: any) {
    return { success: false, error: err.message, queues: [] };
  }
});

ipcMain.handle('floci:sqs:peek-messages', async (_event, queueUrl: string) => {
  try {
    const out = runAws([
      'sqs', 'receive-message',
      '--queue-url', queueUrl,
      '--max-number-of-messages', '10',
      '--visibility-timeout', '0'
    ]);
    const messages = out?.Messages || [];
    return { success: true, messages };
  } catch (err: any) {
    return { success: false, error: err.message, messages: [] };
  }
});

ipcMain.handle('floci:sqs:send-message', async (_event, { queueUrl, messageBody }: { queueUrl: string; messageBody: string }) => {
  try {
    const out = runAws(['sqs', 'send-message', '--queue-url', queueUrl, '--message-body', messageBody]);
    return { success: true, messageId: out?.MessageId };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('floci:sqs:purge-queue', async (_event, queueUrl: string) => {
  try {
    runAws(['sqs', 'purge-queue', '--queue-url', queueUrl]);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// DynamoDB
ipcMain.handle('floci:dynamo:list-tables', async () => {
  try {
    const out = runAws(['dynamodb', 'list-tables']);
    const tableNames: string[] = out?.TableNames || [];
    const tables = [];

    for (const name of tableNames) {
      try {
        const descOut = runAws(['dynamodb', 'describe-table', '--table-name', name]);
        const tb = descOut?.Table || {};
        tables.push({
          name,
          itemCount: tb.ItemCount ?? 0,
          sizeBytes: tb.TableSizeBytes ?? 0,
          status: tb.TableStatus || 'ACTIVE',
          keySchema: tb.KeySchema || [],
          attributeDefinitions: tb.AttributeDefinitions || [],
        });
      } catch {
        tables.push({ name, itemCount: 0, sizeBytes: 0, status: 'UNKNOWN', keySchema: [], attributeDefinitions: [] });
      }
    }

    return { success: true, tables };
  } catch (err: any) {
    return { success: false, error: err.message, tables: [] };
  }
});

ipcMain.handle('floci:dynamo:scan-table', async (_event, tableName: string) => {
  try {
    const out = runAws(['dynamodb', 'scan', '--table-name', tableName, '--limit', '50']);
    const items = out?.Items || [];
    return { success: true, items, count: out?.Count || items.length };
  } catch (err: any) {
    return { success: false, error: err.message, items: [] };
  }
});

// SNS
ipcMain.handle('floci:sns:list-topics', async () => {
  try {
    const out = runAws(['sns', 'list-topics']);
    const topics = out?.Topics || [];
    const subOut = runAws(['sns', 'list-subscriptions']);
    const subscriptions = subOut?.Subscriptions || [];
    return { success: true, topics, subscriptions };
  } catch (err: any) {
    return { success: false, error: err.message, topics: [], subscriptions: [] };
  }
});

// EventBridge
ipcMain.handle('floci:events:list-rules', async () => {
  try {
    const out = runAws(['events', 'list-rules', '--event-bus-name', 'beyon.events']);
    const rules = out?.Rules || [];
    return { success: true, rules };
  } catch (err: any) {
    return { success: false, error: err.message, rules: [] };
  }
});

ipcMain.handle('floci:events:put-event', async (_event, { source, detailType, detail }: { source: string; detailType: string; detail: string }) => {
  try {
    const entry = {
      Source: source,
      DetailType: detailType,
      Detail: detail,
      EventBusName: 'beyon.events',
    };
    const out = runAws(['events', 'put-events', '--entries', JSON.stringify([entry])]);
    return { success: true, result: out };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// ==========================================
// IPC: SYSTEM CLUSTER HEALTH & AI ENGINE
// ==========================================

ipcMain.handle('system:health', async () => {
  const [dolt, floci, ai, backend, mongo] = await Promise.all([
    checkTcpPort('127.0.0.1', 3306),
    checkTcpPort('127.0.0.1', 4566),
    checkTcpPort('127.0.0.1', 8000),
    checkTcpPort('127.0.0.1', 8085),
    checkTcpPort('127.0.0.1', 27017),
  ]);

  let aiCapabilities: string[] = [];
  if (ai.online) {
    try {
      const res = await fetch('http://localhost:8000/health');
      if (res.ok) {
        const d: any = await res.json();
        aiCapabilities = d.capabilities || [];
      }
    } catch {}
  }

  return {
    dolt: { ...dolt, port: 3306, service: 'Dolt SQL Server' },
    floci: { ...floci, port: 4566, service: 'Floci AWS Cloud Emulator' },
    ai: { ...ai, port: 8000, service: 'FastAPI AI Engine (Qwen 3.5:4b)', capabilities: aiCapabilities },
    backend: { ...backend, port: 8085, service: 'Spring Boot Backend API' },
    mongo: { ...mongo, port: 27017, service: 'MongoDB Telemetry Store' },
    timestamp: new Date().toISOString(),
  };
});

ipcMain.handle('ai:test-endpoint', async (_event, { path: endpointPath, method = 'GET', body }: { path: string; method?: string; body?: any }) => {
  const t0 = Date.now();
  try {
    const url = `http://localhost:8000${endpointPath}`;
    const opts: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body && (method === 'POST' || method === 'PUT')) {
      opts.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    const data = await res.json();
    return {
      success: res.ok,
      status: res.status,
      durationMs: Date.now() - t0,
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      status: 0,
      durationMs: Date.now() - t0,
      error: err.message,
    };
  }
});
