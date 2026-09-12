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
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
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

async function waitForPort(port: number, maxWaitMs = 15000): Promise<boolean> {
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
    line.includes('io.ReadFull(header size) failed') ||
    line.includes('wsarecv:')
  );
}

function pipeOutput(name: string, child: ChildProcess) {
  if (child.stdout) {
    const rl = readline.createInterface({ input: child.stdout });
    rl.on('line', (line) => {
      if (name === 'dolt' && shouldFilterDoltLog(line)) return;
      logService(name, line);
    });
  }
  if (child.stderr) {
    const rl = readline.createInterface({ input: child.stderr });
    rl.on('line', (line) => {
      if (name === 'dolt' && shouldFilterDoltLog(line)) return;
      logService(name, line, true);
    });
  }
}

function startService(svc: ServiceConfig): ChildProcess {
  logService(svc.name, `Starting ${svc.name}... (${svc.command} ${svc.args.join(' ')})`);

  const child = spawn(svc.command, svc.args, {
    cwd: svc.cwd,
    shell: svc.shell ?? isWin,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  pipeOutput(svc.name, child);

  child.on('exit', (code, signal) => {
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
        // Kill process tree on Windows
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
  console.log(`${COLORS.dim}Pipeline: Dolt (3306) -> Floci (4566) -> AI (8000) -> Backend (8085) -> Web (5173)${COLORS.reset}`);
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
    const doltReady = await waitForPort(3306, 20000);
    if (!doltReady) {
      throw new Error('Dolt SQL server failed to bind port 3306 within 20s');
    }
  }
  logService('dolt', `${COLORS.bold}[SUCCESS] Step 1/5 Complete: Dolt Database is ONLINE.${COLORS.reset}\n`);

  // 2. Step 2/5: Start Floci Local AWS Services
  logService('floci', '[2/5] Starting Floci AWS Services on http://localhost:4566...');
  startService({
    name: 'floci',
    color: 'floci',
    cwd: rootDir,
    command: 'bun',
    args: ['run', 'scripts/dev-floci.ts'],
  });
  const flociReady = await waitForPort(4566, 30000);
  if (!flociReady) {
    throw new Error('Floci AWS emulator failed to become ready on port 4566 within 30s');
  }
  logService('floci', `${COLORS.bold}[SUCCESS] Step 2/5 Complete: Floci AWS Services are ONLINE.${COLORS.reset}\n`);

  // 3. Step 3/5: Start FastAPI AI Service
  logService('ai', '[3/5] Starting FastAPI AI Service on http://0.0.0.0:8000...');
  startService({
    name: 'ai',
    color: 'ai',
    cwd: path.resolve(rootDir, 'ai-service'),
    command: 'python',
    args: ['-m', 'uvicorn', 'app.main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'],
  });
  const aiReady = await waitForPort(8000, 25000);
  if (!aiReady) {
    throw new Error('FastAPI AI Service failed to become ready on port 8000 within 25s');
  }
  logService('ai', `${COLORS.bold}[SUCCESS] Step 3/5 Complete: AI Service is ONLINE.${COLORS.reset}\n`);

  // 4. Step 4/5: Start Spring Boot Backend
  logService('backend', '[4/5] Starting Spring Boot Backend on port 8085...');
  startService({
    name: 'backend',
    color: 'backend',
    cwd: rootDir,
    command: 'bun',
    args: ['run', 'scripts/run-backend.ts'],
  });
  const backendReady = await waitForPort(8085, 90000);
  if (!backendReady) {
    throw new Error('Spring Boot Backend failed to become ready on port 8085 within 90s');
  }
  logService('backend', `${COLORS.bold}[SUCCESS] Step 4/5 Complete: Backend Service is ONLINE.${COLORS.reset}\n`);

  // 5. Step 5/5: Start Vite Frontend Web App
  logService('web', '[5/5] Starting Vite Web Frontend on https://localhost:5173/...');
  startService({
    name: 'web',
    color: 'web',
    cwd: rootDir,
    command: 'bun',
    args: ['run', '--filter', '@beyon/web', 'dev'],
  });
  const webReady = await waitForPort(5173, 20000);
  if (!webReady) {
    throw new Error('Vite Web Frontend failed to become ready on port 5173 within 20s');
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
