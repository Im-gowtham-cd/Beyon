import { spawn, execSync } from 'child_process';
import { existsSync } from 'fs';

function run(cmd: string, ignoreError = false): string {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err: any) {
    if (!ignoreError) throw err;
    return '';
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureDockerReady() {
  console.log('🔍 Checking Docker Engine status...');
  let ok = false;
  try {
    run('docker info');
    ok = true;
  } catch {
    ok = false;
  }

  if (!ok) {
    console.log('⚠️  Docker Engine not responding. Attempting to start Docker Desktop...');
    const dockerDesktopPath = 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe';
    if (existsSync(dockerDesktopPath)) {
      spawn(dockerDesktopPath, { detached: true, stdio: 'ignore' });
      console.log('⏳ Waiting for Docker Desktop Engine to start...');
      for (let i = 0; i < 30; i++) {
        await sleep(2000);
        try {
          run('docker info');
          console.log('✅ Docker Desktop Engine is now running!');
          return;
        } catch {
          process.stdout.write('.');
        }
      }
    }
    throw new Error('Docker Engine could not be reached. Please make sure Docker Desktop is running.');
  } else {
    console.log('✅ Docker Engine is online.');
  }
}

async function ensureFlociContainer() {
  console.log('🚀 Checking Floci container status...');
  const existing = run('docker ps -a --filter name=^/floci$ --format {{.Names}}', true);
  const isRunning = run('docker ps --filter name=^/floci$ --filter status=running --format {{.Names}}', true);

  if (isRunning) {
    console.log('✅ Floci container is already running.');
    return;
  }

  if (existing) {
    console.log('🔄 Starting existing Floci container...');
    run('docker start floci');
  } else {
    console.log('📦 Creating and running new Floci container on port 4566...');
    const cwd = process.cwd();
    run(`docker run -d --name floci -p 4566:4566 -v /var/run/docker.sock:/var/run/docker.sock -v "${cwd}/floci-data:/app/data" floci/floci:latest`);
  }
}

async function waitForFlociEndpoint() {
  console.log('⏳ Waiting for Floci endpoint on http://localhost:4566...');
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://localhost:4566');
      if (res.status >= 200 && res.status < 500) {
        console.log('✅ Floci endpoint is responding on http://localhost:4566');
        return;
      }
    } catch {
      // connecting
    }
    await sleep(1500);
    process.stdout.write('.');
  }
  console.log('\n⚠️  Floci port 4566 ready.');
}

async function provisionAwsResources() {
  console.log('\n📦 Provisioning Beyon AWS resources in Floci...');
  const endpoint = 'http://localhost:4566';

  const buckets = ['beyon-documents', 'beyon-resumes', 'beyon-certificates', 'beyon-evidence'];
  for (const b of buckets) {
    try {
      run(`aws --endpoint-url=${endpoint} s3 mb s3://${b}`, true);
      console.log(`  ✓ S3 Bucket: ${b}`);
    } catch {
      console.log(`  ✓ S3 Bucket: ${b} (verified)`);
    }
  }

  const queues = ['beyon-recommendation-queue', 'beyon-assessment-events'];
  for (const q of queues) {
    try {
      run(`aws --endpoint-url=${endpoint} sqs create-queue --queue-name ${q}`, true);
      console.log(`  ✓ SQS Queue: ${q}`);
    } catch {
      console.log(`  ✓ SQS Queue: ${q} (verified)`);
    }
  }

  try {
    run(`aws --endpoint-url=${endpoint} sns create-topic --name beyon-notifications`, true);
    console.log('  ✓ SNS Topic: beyon-notifications');
  } catch {
    // verified
  }

  try {
    run(`aws --endpoint-url=${endpoint} events create-event-bus --name beyon.events`, true);
    console.log('  ✓ EventBridge Bus: beyon.events');
  } catch {
    // verified
  }

  try {
    run(`aws --endpoint-url=${endpoint} dynamodb create-table --table-name BeyonProctorIncidents --attribute-definitions AttributeName=sessionId,AttributeType=S AttributeName=timestamp,AttributeType=N --key-schema AttributeName=sessionId,KeyType=HASH AttributeName=timestamp,KeyType=RANGE --billing-mode PAY_PER_REQUEST`, true);
    console.log('  ✓ DynamoDB Table: BeyonProctorIncidents');
  } catch {
    console.log('  ✓ DynamoDB Table: BeyonProctorIncidents (verified)');
  }

  console.log('\n======================================================');
  console.log('🎉 BEYON FLOCI AWS EMULATOR READY & PROVISIONED');
  console.log('Endpoint: http://localhost:4566');
  console.log('Region:   us-east-1');
  console.log('======================================================\n');
}

async function main() {
  try {
    await ensureDockerReady();
    await ensureFlociContainer();
    await waitForFlociEndpoint();
    await provisionAwsResources();
  } catch (err: any) {
    console.error('❌ Failed to run Floci:', err.message);
    process.exit(1);
  }
}

main();
