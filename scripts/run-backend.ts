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

  if (action === '-v' || action === '--version' || action === 'version') {
    const child = spawn(mvnwCmd, ['-v'], { cwd: backendDir, stdio: 'inherit', shell: true });
    child.on('exit', (code) => process.exit(code || 0));
    return;
  }

  if (action === 'test') {
    const child = spawn(mvnwCmd, ['test', ...args.slice(1)], { cwd: backendDir, stdio: 'inherit', shell: true });
    child.on('exit', (code) => process.exit(code || 0));
    return;
  }

  if (action === 'compile' || action === 'build') {
    const child = spawn(mvnwCmd, ['package', '-DskipTests', ...args.slice(1)], { cwd: backendDir, stdio: 'inherit', shell: true });
    child.on('exit', (code) => process.exit(code || 0));
    return;
  }

  // Check if Dolt is reachable
  const doltRunning = await checkPort(3306);
  if (!doltRunning) {
    console.warn('\x1b[33m[Warning] Dolt SQL server is NOT detected on 127.0.0.1:3306.\x1b[0m');
    console.warn('\x1b[33mPlease ensure Dolt is running ("bun run dev:dolt") so backend can connect to the database.\x1b[0m\n');
  } else {
    console.log('\x1b[32m[OK] Dolt SQL server detected on 127.0.0.1:3306.\x1b[0m');
  }

  const jarPath = path.resolve(backendDir, 'target/beyon-backend-0.1.0.jar');
  const fs = await import('fs');
  let hasJar = fs.existsSync(jarPath);

  if (!hasJar) {
    console.log(`\x1b[36m[Backend] Backend JAR not found. Building executable JAR first...\x1b[0m`);
    await new Promise<void>((resolve, reject) => {
      const buildProc = spawn(mvnwCmd, ['package', '-DskipTests'], {
        cwd: backendDir,
        stdio: 'inherit',
        shell: true,
      });
      buildProc.on('exit', (code) => {
        if (code === 0) {
          hasJar = true;
          resolve();
        } else {
          reject(new Error(`Backend build failed with exit code ${code}`));
        }
      });
      buildProc.on('error', reject);
    });
  }

  const extraArgs = args.filter((a) => a !== 'run' && a !== 'dev');

  console.log(`\x1b[36m[Backend] Launching packaged Spring Boot JAR: ${jarPath}...\x1b[0m`);
  const javaArgs = ['-jar', jarPath, '--spring.profiles.active=dev', ...extraArgs];
  console.log(`\x1b[36m[Backend] Command: java ${javaArgs.join(' ')}\x1b[0m\n`);

  const child = spawn('java', javaArgs, {
    cwd: backendDir,
    stdio: 'inherit',
    shell: false,
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });

  child.on('error', (err) => {
    console.error(`\x1b[31m[Backend Error] Failed to start backend via java:\x1b[0m`, err);
    process.exit(1);
  });
}

main();
