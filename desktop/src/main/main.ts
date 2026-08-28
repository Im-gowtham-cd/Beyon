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

ipcMain.handle('assessment:enter-fullscreen', async () => {
  if (mainWindow) {
    // On Windows, setFullScreen can cause a minimize flash.
    // Use maximize + focus instead for a stable lockdown experience.
    if (process.platform === 'win32') {
      mainWindow.maximize();
      mainWindow.focus();
      mainWindow.setMenuBarVisibility(false);
    } else {
      if (!mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(true);
        mainWindow.setMenuBarVisibility(false);
      }
    }
  }
  return true;
});

ipcMain.handle('assessment:exit-fullscreen', async () => {
  if (mainWindow) {
    if (process.platform === 'win32') {
      mainWindow.unmaximize();
      mainWindow.setMenuBarVisibility(true);
    } else {
      if (mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(false);
      }
    }
  }
  return true;
});

ipcMain.handle('assessment:is-fullscreen', () => {
  if (process.platform === 'win32') {
    return mainWindow?.isMaximized() ?? false;
  }
  return mainWindow?.isFullScreen() ?? false;
});

ipcMain.handle('assessment:lock-window', () => {
  isWindowLocked = true;
  if (mainWindow) {
    mainWindow.setResizable(false);
    mainWindow.setMovable(false);
    // Do NOT call setAlwaysOnTop(true) — on Windows it causes an immediate
    // minimize/focus-steal flash. Window protection is via minimize auto-restore.
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

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    title: 'Beyon — Secure Lockdown Assessment Client',
    backgroundColor: '#f4f6fb',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // ── Grant camera, microphone, and display permissions ──────────────────────
  // Electron blocks getUserMedia by default; we must explicitly allow it.
  mainWindow.webContents.session.setPermissionRequestHandler(
    (_webContents, permission, callback) => {
      const allowedPermissions = [
        'media',           // camera + microphone via getUserMedia
        'camera',          // explicit camera
        'microphone',      // explicit microphone
        'display-capture', // screen capture (proctoring)
        'notifications',   // assessment notifications
      ];
      callback(allowedPermissions.includes(permission));
    }
  );

  // Also allow permission checks (for permissionState / checkPermission calls)
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

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
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

  // ── Minimize detection: notify renderer + auto-restore if window is locked ──
  mainWindow.on('minimize', () => {
    mainWindow?.webContents.send('proctoring:minimize');
    if (isWindowLocked) {
      // Restore the window immediately — candidate cannot minimize during exam
      setTimeout(() => {
        if (mainWindow && isWindowLocked) {
          mainWindow.restore();
          mainWindow.focus();
          if (process.platform === 'win32') {
            mainWindow.maximize();
          }
        }
      }, 200);
    }
  });

  mainWindow.on('restore', () => {
    mainWindow?.webContents.send('proctoring:restore');
  });
}

app.whenReady().then(() => {
  // ── App-level default session permission handler ───────────────────────────
  // Grants camera / microphone / display-capture before the window is created
  // so that any early permission checks (Permissions API, getUserMedia) resolve.
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
