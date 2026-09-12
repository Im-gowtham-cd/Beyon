import { app, BrowserWindow, ipcMain, screen, session } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let isWindowLocked = false;
let shortcutsDisabled = false;

// Register beyon:// protocol for deep-linking from web portal
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('beyon', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('beyon');
}

function extractDeepLinkParams(arg: string): Record<string, string> | null {
  if (!arg || !arg.startsWith('beyon://')) return null;
  try {
    const url = new URL(arg);
    const params: Record<string, string> = {};
    url.searchParams.forEach((v, k) => {
      params[k] = v;
    });
    return params;
  } catch {
    const qIndex = arg.indexOf('?');
    if (qIndex !== -1) {
      const sp = new URLSearchParams(arg.substring(qIndex + 1));
      const params: Record<string, string> = {};
      sp.forEach((v, k) => {
        params[k] = v;
      });
      return params;
    }
  }
  return null;
}

function getDeepLinkParamsFromArgs(args: string[]): Record<string, string> | null {
  for (const a of args) {
    const p = extractDeepLinkParams(a);
    if (p) return p;
  }
  return null;
}

function extractTokenFromArg(arg: string): string | null {
  if (!arg) return null;
  if (arg.startsWith('beyon://')) {
    try {
      const url = new URL(arg);
      return url.searchParams.get('token');
    } catch {
      const match = arg.match(/token=([^&]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    }
  }
  return null;
}

function getLaunchTokenFromArgs(args: string[]): string | null {
  for (const a of args) {
    const t = extractTokenFromArg(a);
    if (t) return t;
  }
  return null;
}

function getTokenPath() {
  return path.join(app.getPath('userData'), 'beyon-auth.json');
}

function readToken(): string | null {
  try {
    const data = fs.readFileSync(getTokenPath(), 'utf-8');
    return JSON.parse(data).token || null;
  } catch {
    return null;
  }
}

function writeToken(token: string) {
  fs.writeFileSync(getTokenPath(), JSON.stringify({ token }), 'utf-8');
}

function clearToken() {
  try {
    fs.unlinkSync(getTokenPath());
  } catch {}
}

ipcMain.handle('auth:get-token', () => readToken());
ipcMain.handle('auth:set-token', (_event, token: string) => writeToken(token));
ipcMain.handle('auth:clear-token', () => clearToken());
ipcMain.handle('app:exit', () => {
  isWindowLocked = false;
  app.exit(0);
});

ipcMain.handle('app:force-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(true);
    mainWindow.focus();
  }
  return true;
});

ipcMain.handle('assessment:enter-fullscreen', async () => {
  if (mainWindow) {
    mainWindow.setFullScreen(true);
    mainWindow.focus();
    mainWindow.setMenuBarVisibility(false);
  }
  return true;
});

ipcMain.handle('assessment:exit-fullscreen', async () => {
  if (mainWindow && mainWindow.isFullScreen()) {
    mainWindow.setFullScreen(false);
  }
  return true;
});

ipcMain.handle('assessment:is-fullscreen', () => {
  return mainWindow?.isFullScreen() ?? false;
});

ipcMain.handle('assessment:lock-window', () => {
  isWindowLocked = true;
  if (mainWindow) {
    mainWindow.setResizable(false);
    mainWindow.setMovable(false);
    mainWindow.setFullScreen(true);
    mainWindow.focus();
  }
  return true;
});

ipcMain.handle('assessment:unlock-window', () => {
  isWindowLocked = false;
  if (mainWindow) {
    mainWindow.setResizable(true);
    mainWindow.setMovable(true);
  }
  return true;
});

ipcMain.handle('assessment:disable-shortcuts', () => {
  shortcutsDisabled = true;
  return true;
});

ipcMain.handle('assessment:enable-shortcuts', () => {
  shortcutsDisabled = false;
  return true;
});

ipcMain.handle('assessment:system-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    release: os.release(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    cpus: os.cpus().length,
  };
});

ipcMain.handle('assessment:device-info', () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  return {
    platform: process.platform,
    arch: process.arch,
    os: `${os.type()} ${os.release()}`,
    screenWidth: primaryDisplay.size.width,
    screenHeight: primaryDisplay.size.height,
    pixelRatio: primaryDisplay.scaleFactor,
    hostname: os.hostname(),
  };
});

ipcMain.handle('assessment:local-ip', () => {
  const nets = os.networkInterfaces();
  let wifiIp = '';
  let hotspotIp = '';
  const ips: string[] = [];

  for (const name of Object.keys(nets)) {
    const lname = name.toLowerCase();
    if (lname.includes('virtual') || lname.includes('wsl') || lname.includes('hyper-v') || lname.includes('vethernet') || lname.includes('docker') || lname.includes('tailscale')) {
      continue;
    }
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        if (net.address.startsWith('10.') || net.address.startsWith('192.168.') || net.address.startsWith('172.')) {
          ips.push(net.address);
          if (lname.includes('wi-fi') || lname.includes('wireless') || lname.includes('wlan')) {
            wifiIp = net.address;
          } else if (net.address.startsWith('192.168.137.')) {
            hotspotIp = net.address;
          }
        }
      }
    }
  }

  const primaryIp = wifiIp || (ips.length > 0 ? ips[0] : '10.1.32.243');
  return {
    primaryIp,
    wifiIp: wifiIp || primaryIp,
    hotspotIp: hotspotIp || '192.168.137.1',
    allIps: ips.length > 0 ? ips : [primaryIp],
  };
});

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    minimizable: false,
    autoHideMenuBar: true,
    backgroundColor: '#f4f6fb',
    title: 'Beyon — Secure Lockdown Assessment Client',
    icon: path.join(__dirname, '../../public/logo-icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  mainWindow.setFullScreen(true);
  mainWindow.setMenuBarVisibility(false);

  mainWindow.webContents.session.setPermissionRequestHandler(
    (_webContents, permission, callback) => {
      const allowedPermissions = [
        'media',
        'camera',
        'microphone',
        'display-capture',
        'notifications',
      ];
      callback(allowedPermissions.includes(permission));
    }
  );

  mainWindow.webContents.session.setPermissionCheckHandler(
    (_webContents, permission) => {
      const allowedPermissions = [
        'media',
        'camera',
        'microphone',
        'display-capture',
        'notifications',
      ];
      return allowedPermissions.includes(permission);
    }
  );

  const initialParams = getDeepLinkParamsFromArgs(process.argv);
  const initialToken = initialParams?.token || getLaunchTokenFromArgs(process.argv);
  if (initialToken) {
    writeToken(initialToken);
  }

  const queryParams = new URLSearchParams(initialParams || (initialToken ? { token: initialToken } : {}));

  if (process.env.VITE_DEV_SERVER_URL) {
    const qs = queryParams.toString();
    const devUrl = qs
      ? `${process.env.VITE_DEV_SERVER_URL}?${qs}`
      : process.env.VITE_DEV_SERVER_URL;
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'), {
      query: Object.fromEntries(queryParams.entries()),
    });
  }

  mainWindow.on('close', (e) => {
    if (isWindowLocked) {
      e.preventDefault();
      mainWindow?.webContents.send('proctoring:before-quit');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('enter-full-screen', () => {
    mainWindow?.webContents.send('proctoring:fullscreen-change', true);
  });

  mainWindow.on('leave-full-screen', () => {
    mainWindow?.webContents.send('proctoring:fullscreen-change', false);
  });

  mainWindow.on('focus', () => {
    mainWindow?.webContents.send('proctoring:focus-change', true);
  });

  mainWindow.on('blur', () => {
    mainWindow?.webContents.send('proctoring:focus-change', false);
  });

  mainWindow.on('minimize', () => {
    mainWindow?.webContents.send('proctoring:minimize');
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.restore();
        mainWindow.setFullScreen(true);
        mainWindow.focus();
      }
    }, 50);
  });

  mainWindow.on('restore', () => {
    mainWindow?.webContents.send('proctoring:restore');
  });
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      const params = getDeepLinkParamsFromArgs(commandLine);
      const token = params?.token || getLaunchTokenFromArgs(commandLine);
      if (token) {
        writeToken(token);
        mainWindow.webContents.send('auth:launch-token', token);
      }
      if (params) {
        mainWindow.webContents.send('auth:launch-params', params);
      }
    }
  });

  app.whenReady().then(() => {
    session.defaultSession.setPermissionRequestHandler(
      (_webContents, permission, callback) => {
        const allowed = ['media', 'camera', 'microphone', 'display-capture', 'notifications'];
        callback(allowed.includes(permission));
      }
    );
    session.defaultSession.setPermissionCheckHandler(
      (_webContents, permission) => {
        const allowed = ['media', 'camera', 'microphone', 'display-capture', 'notifications'];
        return allowed.includes(permission);
      }
    );

    createWindow();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}

