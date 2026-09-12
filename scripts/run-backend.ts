import { spawn } from 'child_process';
import path from 'path';
import net from 'net';

const isWin = process.platform === 'win32';
const backendDir = path.resolve(__dirname, '../backend');
const mvnwCmd = isWin ? 'mvnw.cmd' : './mvnw';

// Check if Dolt DB is running on port 3306
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

async function main() {
  const args = process.argv.slice(2);
  const action = args[0] || 'run';

  let mavenArgs: string[] = [];

  if (action === '-v' || action === '--version' || action === 'version') {
    mavenArgs = ['-v'];
  } else if (action === 'test') {
    mavenArgs = ['test', ...args.slice(1)];
  } else if (action === 'compile') {
    mavenArgs = ['compile', ...args.slice(1)];
  } else {
    // Check if Dolt is reachable
    const doltRunning = await checkPort(3306);
    if (!doltRunning) {
      console.warn('\x1b[33m[Warning] Dolt SQL server is NOT detected on 127.0.0.1:3306.\x1b[0m');
      console.warn('\x1b[33mPlease ensure Dolt is running ("bun run dev:dolt") so backend can connect to the database.\x1b[0m\n');
    } else {
      console.log('\x1b[32m[OK] Dolt SQL server detected on 127.0.0.1:3306.\x1b[0m');
    }

    const extraArgs = args.filter((a) => a !== 'run' && a !== 'dev');
    mavenArgs = ['spring-boot:run', '-Dspring-boot.run.profiles=dev', ...extraArgs];
  }

  console.log(`\x1b[36m[Backend] Starting Spring Boot in ${backendDir}...\x1b[0m`);
  console.log(`\x1b[36m[Backend] Command: ${mvnwCmd} ${mavenArgs.join(' ')}\x1b[0m\n`);

  const child = spawn(mvnwCmd, mavenArgs, {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true, // Enables finding .cmd on Windows
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });

  child.on('error', (err) => {
    console.error(`\x1b[31m[Backend Error] Failed to start backend:\x1b[0m`, err);
    process.exit(1);
  });
}

main();
