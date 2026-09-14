import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import net from 'node:net';
import mysql from 'mysql2/promise';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure isolated user data and disable GPU shader cache to eliminate Windows disk cache access errors (0x5)
app.setName('BeyonWorkbench');
try {
  const customUserData = path.join(app.getPath('appData'), 'BeyonWorkbench');
  app.setPath('userData', customUserData);
} catch {}

app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

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

// In-memory cache for heavy read queries so rapid UI interactions never block or lag
const queryCache = new Map<string, { data: any; expires: number }>();

async function runAws(args: string[], useCache = true, ttlMs = 10000): Promise<any> {
  const cacheKey = args.join(' ');
  const now = Date.now();
  if (useCache) {
    const cached = queryCache.get(cacheKey);
    if (cached && cached.expires > now) {
      return cached.data;
    }
  }

  try {
    const fullArgs = [`--endpoint-url=${FLOCI_ENDPOINT}`, `--region=${FLOCI_REGION}`, ...args];
    const { stdout } = await execFileAsync('aws', fullArgs, { encoding: 'utf-8' });
    const trimmed = stdout ? stdout.trim() : '';
    if (!trimmed) return null;
    let result: any;
    try {
      result = JSON.parse(trimmed);
    } catch {
      result = trimmed;
    }
    if (useCache) {
      queryCache.set(cacheKey, { data: result, expires: now + ttlMs });
    }
    return result;
  } catch (err: any) {
    const msg = err.stderr ? err.stderr.toString().trim() : err.message;
    throw new Error(msg || 'AWS CLI error');
  }
}

function invalidateAwsCache() {
  queryCache.clear();
}

async function checkTcpPort(host: string, port: number, timeoutMs = 1200): Promise<{ online: boolean; latencyMs: number }> {
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
    backgroundColor: '#0c1427',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
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
// IPC: DOLT DATABASE (3306)
// ==========================================

ipcMain.handle('dolt:status', async () => {
  const tcp = await checkTcpPort(DOLT_CONFIG.host, DOLT_CONFIG.port);
  if (!tcp.online) return { online: false, tablesCount: 0, error: 'Cannot connect to Dolt port 3306' };
  try {
    const pool = getDoltPool();
    const [rows]: any = await pool.query('SHOW TABLES');
    return {
      online: true,
      tablesCount: rows.length,
      database: DOLT_CONFIG.database,
      host: `${DOLT_CONFIG.host}:${DOLT_CONFIG.port}`,
      latencyMs: tcp.latencyMs,
    };
  } catch (err: any) {
    return { online: false, tablesCount: 0, error: err.message };
  }
});

ipcMain.handle('dolt:tables', async () => {
  try {
    const pool = getDoltPool();
    const [rows]: any = await pool.query('SHOW FULL TABLES WHERE Table_type = "BASE TABLE"');
    const tables = rows.map((r: any) => {
      const name = Object.values(r)[0] as string;
      const type = Object.values(r)[1] as string;
      return { name, type };
    });
    return { success: true, tables };
  } catch (err: any) {
    return { success: false, error: err.message, tables: [] };
  }
});

ipcMain.handle('dolt:schema', async (_event, tableName: string) => {
  try {
    const pool = getDoltPool();
    const [columns]: any = await pool.query(`DESCRIBE \`${tableName.replace(/`/g, '')}\``);
    return { success: true, columns };
  } catch (err: any) {
    return { success: false, error: err.message, columns: [] };
  }
});

ipcMain.handle('dolt:rows', async (_event, { tableName, limit = 50, offset = 0, search }: { tableName: string; limit?: number; offset?: number; search?: string }) => {
  try {
    const pool = getDoltPool();
    const cleanTable = tableName.replace(/`/g, '');
    let query = `SELECT * FROM \`${cleanTable}\``;
    const params: any[] = [];

    if (search && search.trim()) {
      const [cols]: any = await pool.query(`DESCRIBE \`${cleanTable}\``);
      const textCols = cols
        .filter((c: any) => c.Type.includes('char') || c.Type.includes('text') || c.Type.includes('varchar'))
        .map((c: any) => `\`${c.Field}\` LIKE ?`);
      if (textCols.length > 0) {
        query += ` WHERE ${textCols.join(' OR ')}`;
        textCols.forEach(() => params.push(`%${search.trim()}%`));
      }
    }

    const [totalRows]: any = await pool.query(`SELECT COUNT(*) as cnt FROM \`${cleanTable}\``);
    const total = totalRows[0]?.cnt || 0;

    query += ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;
    const [rows, fields]: any = await pool.query(query, params);
    const columns = (fields || []).map((f: any) => f.name);

    return {
      success: true,
      rows,
      columns,
      total,
      limit,
      offset,
    };
  } catch (err: any) {
    return { success: false, error: err.message, rows: [], columns: [], total: 0 };
  }
});

ipcMain.handle('dolt:query', async (_event, sql: string) => {
  const t0 = Date.now();
  try {
    const pool = getDoltPool();
    const [result, fields]: any = await pool.query(sql);
    const durationMs = Date.now() - t0;

    if (Array.isArray(result)) {
      const columns = (fields || []).map((f: any) => f.name);
      return {
        success: true,
        isSelect: true,
        columns,
        rows: result,
        count: result.length,
        durationMs,
      };
    } else {
      return {
        success: true,
        isSelect: false,
        affectedRows: result.affectedRows,
        insertId: result.insertId,
        message: result.message || 'Query OK',
        durationMs,
      };
    }
  } catch (err: any) {
    return { success: false, error: err.message, durationMs: Date.now() - t0 };
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
    const out = await runAws(['s3api', 'list-buckets'], true, 15000);
    const buckets = out?.Buckets || [];
    return { success: true, buckets };
  } catch (err: any) {
    return { success: false, error: err.message, buckets: [] };
  }
});

ipcMain.handle('floci:s3:list-objects', async (_event, bucketName: string) => {
  try {
    const out = await runAws(['s3api', 'list-objects-v2', '--bucket', bucketName], false);
    const objects = out?.Contents || [];
    return { success: true, objects };
  } catch (err: any) {
    return { success: false, error: err.message, objects: [] };
  }
});

// SQS
ipcMain.handle('floci:sqs:list-queues', async () => {
  try {
    const out = await runAws(['sqs', 'list-queues'], true, 10000);
    const urls: string[] = out?.QueueUrls || [];

    const queuePromises = urls.map(async (url) => {
      const qName = url.substring(url.lastIndexOf('/') + 1);
      try {
        const attrOut = await runAws(['sqs', 'get-queue-attributes', '--queue-url', url, '--attribute-names', 'All'], true, 10000);
        const attrs = attrOut?.Attributes || {};
        return {
          url,
          name: qName,
          visible: parseInt(attrs.ApproximateNumberOfMessages || '0', 10),
          inFlight: parseInt(attrs.ApproximateNumberOfMessagesNotVisible || '0', 10),
          delayed: parseInt(attrs.ApproximateNumberOfMessagesDelayed || '0', 10),
          createdTimestamp: attrs.CreatedTimestamp,
          isDlq: qName.includes('-dlq'),
        };
      } catch {
        return {
          url,
          name: qName,
          visible: 0,
          inFlight: 0,
          delayed: 0,
          isDlq: qName.includes('-dlq'),
        };
      }
    });

    const queues = await Promise.all(queuePromises);
    return { success: true, queues };
  } catch (err: any) {
    return { success: false, error: err.message, queues: [] };
  }
});

ipcMain.handle('floci:sqs:peek-messages', async (_event, queueUrl: string) => {
  try {
    const out = await runAws([
      'sqs', 'receive-message',
      '--queue-url', queueUrl,
      '--max-number-of-messages', '10',
      '--visibility-timeout', '0'
    ], false);
    const messages = out?.Messages || [];
    return { success: true, messages };
  } catch (err: any) {
    return { success: false, error: err.message, messages: [] };
  }
});

ipcMain.handle('floci:sqs:send-message', async (_event, { queueUrl, messageBody }: { queueUrl: string; messageBody: string }) => {
  try {
    invalidateAwsCache();
    const out = await runAws(['sqs', 'send-message', '--queue-url', queueUrl, '--message-body', messageBody], false);
    return { success: true, messageId: out?.MessageId };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('floci:sqs:purge-queue', async (_event, queueUrl: string) => {
  try {
    invalidateAwsCache();
    await runAws(['sqs', 'purge-queue', '--queue-url', queueUrl], false);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

// DynamoDB
ipcMain.handle('floci:dynamo:list-tables', async () => {
  try {
    const out = await runAws(['dynamodb', 'list-tables'], true, 15000);
    const tableNames: string[] = out?.TableNames || [];

    const tablePromises = tableNames.map(async (name) => {
      try {
        const descOut = await runAws(['dynamodb', 'describe-table', '--table-name', name], true, 15000);
        const tb = descOut?.Table || {};
        return {
          TableName: name,
          ItemCount: tb.ItemCount ?? 0,
          TableSizeBytes: tb.TableSizeBytes ?? 0,
          KeySchema: tb.KeySchema || [],
          AttributeDefinitions: tb.AttributeDefinitions || [],
        };
      } catch {
        return {
          TableName: name,
          ItemCount: 0,
          TableSizeBytes: 0,
          KeySchema: [],
          AttributeDefinitions: [],
        };
      }
    });

    const tables = await Promise.all(tablePromises);
    return { success: true, tables };
  } catch (err: any) {
    return { success: false, error: err.message, tables: [] };
  }
});

ipcMain.handle('floci:dynamo:scan-table', async (_event, tableName: string) => {
  try {
    const out = await runAws(['dynamodb', 'scan', '--table-name', tableName, '--limit', '50'], false);
    const items = out?.Items || [];
    return { success: true, items, scannedCount: out?.Count || items.length };
  } catch (err: any) {
    return { success: false, error: err.message, items: [], scannedCount: 0 };
  }
});

// SNS
ipcMain.handle('floci:sns:list-topics', async () => {
  try {
    const out = await runAws(['sns', 'list-topics'], true, 15000);
    const topics = out?.Topics || [];
    return { success: true, topics };
  } catch (err: any) {
    return { success: false, error: err.message, topics: [] };
  }
});

// EventBridge
ipcMain.handle('floci:events:list-rules', async () => {
  try {
    const out = await runAws(['events', 'list-rules', '--event-bus-name', 'beyon.events'], true, 15000);
    const rules = out?.Rules || [];
    return { success: true, rules };
  } catch (err: any) {
    return { success: false, error: err.message, rules: [] };
  }
});

ipcMain.handle('floci:events:put-event', async (_event, { source, detailType, detail }: { source: string; detailType: string; detail: string }) => {
  try {
    invalidateAwsCache();
    const entry = {
      Source: source,
      DetailType: detailType,
      Detail: detail,
      EventBusName: 'beyon.events',
    };
    const out = await runAws(['events', 'put-events', '--entries', JSON.stringify([entry])], false);
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
