import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

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

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    title: 'Beyon Assessment',
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
