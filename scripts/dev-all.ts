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

function pipeOutput(name: string, child: ChildProcess) {
  if (child.stdout) {
    const rl = readline.createInterface({ input: child.stdout });
    rl.on('line', (line) => logService(name, line));
  }
  if (child.stderr) {
    const rl = readline.createInterface({ input: child.stderr });
    rl.on('line', (line) => logService(name, line, true));
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
  console.log(`${COLORS.bold}BEYON UNIFIED MULTI-SERVICE DEV RUNNER${COLORS.reset}`);
  console.log(`${COLORS.dim}Services: Dolt DB (3306) | Floci AWS (4566) | Backend (8085) | AI (8000) | Web (5173)${COLORS.reset}`);
  console.log(`${COLORS.bold}======================================================${COLORS.reset}\n`);

  // 1. Check or Start Dolt Database
  const doltAlreadyRunning = await checkPort(3306);
  if (doltAlreadyRunning) {
    logService('dolt', 'Dolt SQL server is already running on 127.0.0.1:3306');
  } else {
    logService('dolt', 'Starting Dolt SQL server on 127.0.0.1:3306...');
    startService({
      name: 'dolt',
      color: 'dolt',
      cwd: rootDir,
      command: 'dolt',
      args: ['sql-server', '--host=127.0.0.1', '--port=3306'],
    });

    logService('dolt', 'Waiting for Dolt SQL server to become ready on port 3306...');
    const doltReady = await waitForPort(3306, 15000);
    if (doltReady) {
      logService('dolt', 'Dolt SQL server is ready on 127.0.0.1:3306');
    } else {
      logService('dolt', 'Warning: Dolt SQL server took longer than expected to bind port 3306.', true);
    }
  }

  // 2. Start Floci Local AWS Services
  startService({
    name: 'floci',
    color: 'floci',
    cwd: rootDir,
    command: 'bun',
    args: ['run', 'scripts/dev-floci.ts'],
  });

  // 3. Start Spring Boot Backend
  startService({
    name: 'backend',
    color: 'backend',
    cwd: rootDir,
    command: 'bun',
    args: ['run', 'scripts/run-backend.ts'],
  });

  // 4. Start FastAPI AI Service
  startService({
    name: 'ai',
    color: 'ai',
    cwd: path.resolve(rootDir, 'ai-service'),
    command: 'python',
    args: ['-m', 'uvicorn', 'app.main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'],
  });

  // 5. Start Vite Frontend Web App
  startService({
    name: 'web',
    color: 'web',
    cwd: rootDir,
    command: 'bun',
    args: ['run', '--filter', '@beyon/web', 'dev'],
  });
}

main().catch((err) => {
  console.error('Fatal error starting services:', err);
  shutdown();
});
