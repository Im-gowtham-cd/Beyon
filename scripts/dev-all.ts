import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import net from 'net';
import readline from 'readline';

const isWin = process.platform === 'win32';
const rootDir = path.resolve(__dirname, '..');

interface ServiceConfig {
  name: string;
  color: string;
  cwd: string;
  command: string;
  args: string[];
  shell?: boolean;
}

const COLORS: Record<string, string> = {
  dolt: '\x1b[34m',    // Blue
  floci: '\x1b[35m',   // Magenta
  backend: '\x1b[32m', // Green
  ollama: '\x1b[36m',  // Cyan
  ai: '\x1b[33m',      // Yellow
  web: '\x1b[36m',     // Cyan
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

const processes: { name: string; process: ChildProcess }[] = [];
let isShuttingDown = false;

function checkPort(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1200);
    socket.on('connect', () => {
      socket.end();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function waitForPort(port: number, maxWaitMs = 30000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    if (await checkPort(port)) return true;
    await new Promise((r) => setTimeout(r, 600));
  }
  return false;
}

function logService(name: string, line: string, isError = false) {
  const color = COLORS[name] || '\x1b[37m';
  const prefix = `${color}[${name.padEnd(7)}]${COLORS.reset} `;
  if (isError) {
    process.stderr.write(prefix + line + '\n');
  } else {
    process.stdout.write(prefix + line + '\n');
  }
}

function shouldFilterDoltLog(line: string): boolean {
  return (
    line.includes('ConnectionClosed') ||
    line.includes('NewConnection') ||
    line.includes('level=info') ||
    line.includes('Cannot read client handshake response') ||
    line.includes('Cannot send HandshakeV10 packet') ||
    line.includes('Write(packet) failed') ||
    line.includes('io.ReadFull(header size) failed') ||
    line.includes('wsasend:') ||
    line.includes('wsarecv:')
  );
}

function startService(
  svc: ServiceConfig,
  onLine?: (line: string) => void,
  onExit?: (code: number | null, signal: string | null) => void
): ChildProcess {
  logService(svc.name, `Starting ${svc.name}... (${svc.command} ${svc.args.join(' ')})`);

  const child = spawn(svc.command, svc.args, {
    cwd: svc.cwd,
    shell: svc.shell ?? isWin,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  if (child.stdout) {
    const rl = readline.createInterface({ input: child.stdout });
    rl.on('line', (line) => {
      if (onLine) onLine(line);
      if (svc.name === 'dolt' && shouldFilterDoltLog(line)) return;
      logService(svc.name, line);
    });
  }

  if (child.stderr) {
    const rl = readline.createInterface({ input: child.stderr });
    rl.on('line', (line) => {
      if (onLine) onLine(line);
      if (svc.name === 'dolt' && shouldFilterDoltLog(line)) return;
      logService(svc.name, line, true);
    });
  }

  child.on('exit', (code, signal) => {
    if (onExit) onExit(code, signal);
    if (!isShuttingDown) {
      logService(svc.name, `Process exited with code ${code ?? signal}`);
    }
  });

  child.on('error', (err) => {
    logService(svc.name, `Error starting service: ${err.message}`, true);
  });

  processes.push({ name: svc.name, process: child });
  return child;
}

function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n${COLORS.bold}Shutting down all services...${COLORS.reset}`);

  for (const { name, process: proc } of processes) {
    try {
      if (isWin && proc.pid) {
        spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { stdio: 'ignore' });
      } else {
        proc.kill('SIGTERM');
      }
    } catch {
      // Ignored during shutdown
    }
  }

  setTimeout(() => {
    process.exit(0);
  }, 1200);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function main() {
  console.log(`${COLORS.bold}======================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}BEYON UNIFIED SEQUENTIAL SERVICE DEV RUNNER${COLORS.reset}`);
  console.log(`${COLORS.dim}Pipeline: Dolt (3306) -> Floci (4566) -> Backend (8085) -> AI (8000) -> Web (5173)${COLORS.reset}`);
  console.log(`${COLORS.bold}======================================================${COLORS.reset}\n`);

  // 1. Step 1/5: Check or Start Dolt Database
  logService('dolt', '[1/5] Checking / Starting Dolt Database on 127.0.0.1:3306...');
  const doltAlreadyRunning = await checkPort(3306);
  if (doltAlreadyRunning) {
    logService('dolt', 'Dolt SQL server is already running on 127.0.0.1:3306');
  } else {
    startService({
      name: 'dolt',
      color: 'dolt',
      cwd: rootDir,
      command: 'dolt',
      args: ['sql-server', '--host=127.0.0.1', '--port=3306', '--loglevel=warning'],
    });

    logService('dolt', 'Waiting for Dolt SQL server to become ready on port 3306...');
    const doltReady = await waitForPort(3306, 30000);
    if (!doltReady) {
      throw new Error('Dolt SQL server failed to bind port 3306 within 30s');
    }
  }
  logService('dolt', `${COLORS.bold}[SUCCESS] Step 1/5 Complete: Dolt Database is ONLINE.${COLORS.reset}\n`);

  // 2. Step 2/5: Start Floci Local AWS Services (Strict Sequential Wait)
  logService('floci', '[2/5] Starting Floci AWS Services on http://localhost:4566...');
  let flociProvisioned = false;
  let flociExited = false;
  let flociExitCode: number | string | null = null;

  startService(
    {
      name: 'floci',
      color: 'floci',
      cwd: rootDir,
      command: 'bun',
      args: ['run', 'scripts/dev-floci.ts'],
    },
    (line) => {
      if (
        line.includes('ALL BEYON AWS SERVICES & AI EMULATORS OPERATIONAL') ||
        line.includes('[Floci] Daemon running')
      ) {
        flociProvisioned = true;
      }
    },
    (code, signal) => {
      flociExited = true;
      flociExitCode = code ?? signal;
    }
  );

  logService('floci', 'Waiting for Floci container and full AWS resource provisioning (up to 20s)...');
  const startFloci = Date.now();
  while (Date.now() - startFloci < 20000) {
    if (flociProvisioned) break;
    if (flociExited) {
      logService('floci', `Notice: Floci process exited (${flociExitCode}). Continuing startup...`);
      break;
    }
    await new Promise((r) => setTimeout(r, 600));
  }

  if (flociProvisioned) {
    logService('floci', `${COLORS.bold}[SUCCESS] Step 2/5 Complete: Floci AWS Services are ONLINE.${COLORS.reset}\n`);
  } else {
    logService('floci', `${COLORS.bold}[NOTICE] Step 2/5: Floci AWS Services initializing in background. Proceeding to Step 3.${COLORS.reset}\n`);
  }

  // 3. Step 3/5: Start Spring Boot Backend (Strict Sequential Wait)
  logService('backend', '[3/5] Starting Spring Boot Backend on port 8085...');
  let backendReadySignal = false;
  let backendExited = false;
  let backendExitCode: number | string | null = null;

  startService(
    {
      name: 'backend',
      color: 'backend',
      cwd: rootDir,
      command: 'bun',
      args: ['run', 'scripts/run-backend.ts'],
    },
    (line) => {
      if (line.includes('Started BeyonApplication') || line.includes('Tomcat started on port 8085')) {
        backendReadySignal = true;
      }
    },
    (code, signal) => {
      backendExited = true;
      backendExitCode = code ?? signal;
    }
  );

  logService('backend', 'Waiting for Spring Boot Backend to compile and bind port 8085 (up to 300s)...');
  const startBackend = Date.now();
  while (Date.now() - startBackend < 300000) {
    if (backendReadySignal) break;
    if (backendExited && !backendReadySignal) {
      throw new Error(`Spring Boot Backend process terminated unexpectedly with code ${backendExitCode} before becoming ready`);
    }
    if (await checkPort(8085)) {
      backendReadySignal = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  if (!backendReadySignal) {
    throw new Error('Spring Boot Backend failed to become ready on port 8085 within 300s');
  }
  logService('backend', `${COLORS.bold}[SUCCESS] Step 3/5 Complete: Backend Service is ONLINE.${COLORS.reset}\n`);

  // Optional: Check or Start Ollama LLM Service (Port 11434)
  const ollamaRunning = await checkPort(11434);
  if (ollamaRunning) {
    logService('ollama', 'Ollama LLM service is already running on http://127.0.0.1:11434 (Qwen 3.5 4B)');
  } else {
    try {
      logService('ollama', 'Starting Ollama background LLM service on http://127.0.0.1:11434...');
      startService({
        name: 'ollama',
        color: 'ollama',
        cwd: rootDir,
        command: 'ollama',
        args: ['serve'],
      });
      await waitForPort(11434, 5000);
    } catch {
      logService('ollama', 'Notice: Ollama not found on PATH or failed to start. AI Service will use heuristic fallback.');
    }
  }

  // 4. Step 4/5: Start FastAPI AI Service (Strict Sequential Wait)
  logService('ai', '[4/5] Starting FastAPI AI Service on http://0.0.0.0:8000...');
  let aiReadySignal = false;
  startService(
    {
      name: 'ai',
      color: 'ai',
      cwd: path.resolve(rootDir, 'ai-service'),
      command: 'python',
      args: ['-m', 'uvicorn', 'app.main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'],
    },
    (line) => {
      if (line.includes('Application startup complete') || line.includes('Uvicorn running')) {
        aiReadySignal = true;
      }
    }
  );

  logService('ai', 'Waiting for FastAPI AI Service to bind port 8000 (up to 60s)...');
  const startAi = Date.now();
  while (Date.now() - startAi < 60000) {
    if (aiReadySignal) break;
    if (await checkPort(8000)) {
      aiReadySignal = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 600));
  }

  if (!aiReadySignal) {
    throw new Error('FastAPI AI Service failed to become ready on port 8000 within 60s');
  }
  logService('ai', `${COLORS.bold}[SUCCESS] Step 4/5 Complete: AI Service is ONLINE.${COLORS.reset}\n`);

  // 5. Step 5/5: Start Vite Frontend Web App (Strict Sequential Wait)
  logService('web', '[5/5] Starting Vite Web Frontend on https://localhost:5173/...');
  startService({
    name: 'web',
    color: 'web',
    cwd: rootDir,
    command: 'bun',
    args: ['run', '--filter', '@beyon/web', 'dev'],
  });
  logService('web', 'Waiting for Vite Web Frontend to bind port 5173 (up to 45s)...');
  const webReady = await waitForPort(5173, 45000);
  if (!webReady) {
    throw new Error('Vite Web Frontend failed to become ready on port 5173 within 45s');
  }
  logService('web', `${COLORS.bold}[SUCCESS] Step 5/5 Complete: Web Frontend is ONLINE.${COLORS.reset}\n`);

  console.log(`${COLORS.bold}======================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}ALL 5 BEYON SERVICES OPERATIONAL AND READY${COLORS.reset}`);
  console.log(`Web App:     https://localhost:5173/`);
  console.log(`Backend API: http://localhost:8085/api/v1`);
  console.log(`AI Engine:   http://localhost:8000`);
  console.log(`AWS Floci:   http://localhost:4566`);
  console.log(`Dolt DB:     127.0.0.1:3306 (beyon)`);
  console.log(`${COLORS.bold}======================================================${COLORS.reset}\n`);
}

main().catch((err) => {
  console.error('Fatal error starting services:', err);
  shutdown();
});
