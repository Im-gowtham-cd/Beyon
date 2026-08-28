import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const rootDir = path.resolve(__dirname, '..');
const androidDir = path.resolve(__dirname, 'android');

// Find Android SDK paths
const localAppData = process.env.LOCALAPPDATA || 'C:\\Users\\gowth\\AppData\\Local';
const androidHome = process.env.ANDROID_HOME || path.join(localAppData, 'Android', 'Sdk');

const adbPath = path.join(androidHome, 'platform-tools', 'adb.exe');
const emulatorPath = path.join(androidHome, 'emulator', 'emulator.exe');
const gradlewPath = path.join(androidDir, 'gradlew.bat');
const apkPath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

function runCmd(cmd: string, args: string[], cwd: string = androidDir) {
  const fullCmd = `"${cmd}" ${args.join(' ')}`;
  return execSync(fullCmd, { cwd, stdio: 'inherit', shell: 'cmd.exe' });
}

function getOutput(cmd: string, args: string[]): string {
  try {
    return execSync(`"${cmd}" ${args.join(' ')}`, { encoding: 'utf-8', shell: 'cmd.exe' });
  } catch {
    return '';
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('\n📱 ─── BEYON NATIVE ANDROID LAUNCHER ───');
  console.log(`🔍 Android SDK: ${androidHome}`);

  if (!fs.existsSync(adbPath)) {
    console.error(`❌ adb.exe not found at ${adbPath}`);
    process.exit(1);
  }

  // 1. Check running devices
  const devicesOutput = getOutput(adbPath, ['devices']);
  const lines = devicesOutput.split('\n').filter(l => l.trim() && !l.includes('List of devices'));
  const activeDevices = lines.filter(l => l.includes('device') && !l.includes('offline'));

  if (activeDevices.length === 0) {
    console.log('⚡ No active Android emulator detected. Starting Android Studio emulator...');
    
    let avdName = 'Pixel_7';
    if (fs.existsSync(emulatorPath)) {
      const avds = getOutput(emulatorPath, ['-list-avds']).trim().split('\n').map(a => a.trim()).filter(Boolean);
      if (avds.length > 0) {
        avdName = avds[0];
      }
    }

    console.log(`🚀 Booting Android AVD: ${avdName}...`);
    // Spawn emulator detached in background
    spawn(emulatorPath, ['-avd', avdName], {
      detached: true,
      stdio: 'ignore',
    }).unref();

    console.log('⏳ Waiting for emulator to connect to ADB...');
    execSync(`"${adbPath}" wait-for-device`, { stdio: 'inherit', shell: 'cmd.exe' });

    console.log('⏳ Waiting for Android system boot completion...');
    let booted = false;
    for (let i = 0; i < 45; i++) {
      await sleep(2000);
      const bootCheck = getOutput(adbPath, ['shell', 'getprop', 'sys.boot_completed']).trim();
      if (bootCheck === '1') {
        booted = true;
        break;
      }
    }
    if (booted) {
      console.log('✓ Android emulator fully booted and ready!');
    }
  } else {
    console.log(`✓ Active Android device/emulator detected: ${activeDevices[0].split('\t')[0]}`);
  }

  // 2. Build Debug APK using Gradle
  console.log('\n🔨 Compiling Native Android APK with Gradle...');
  try {
    runCmd(gradlewPath, ['assembleDebug']);
  } catch (err: any) {
    console.error('❌ Gradle build failed:', err?.message || err);
    process.exit(1);
  }

  // 3. Install APK
  console.log('\n📦 Installing Beyon Mobile APK onto Android emulator...');
  try {
    runCmd(adbPath, ['install', '-r', `"${apkPath}"`]);
  } catch (err: any) {
    console.error('❌ Failed to install APK via ADB:', err?.message || err);
    process.exit(1);
  }

  // 4. Launch Application
  console.log('\n🚀 Launching Beyon Mobile on Android Studio Phone Emulator...');
  runCmd(adbPath, ['shell', 'am', 'start', '-n', 'com.beyon.app/.MainActivity']);

  console.log('================================================================');
  console.log('✨ BEYON MOBILE RUNNING ON ANDROID STUDIO EMULATOR');
  console.log('📱 Application: com.beyon.app');
  console.log('🌐 Direct Portal Gateway: http://10.0.2.2:5173');
  console.log('⚡ Direct Backend Service: http://10.0.2.2:8085/api/v1');
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('Launcher error:', err);
  process.exit(1);
});
