
const { app, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'dist/preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  await win.loadFile('dist/renderer/index.html');
  const result = await win.webContents.executeJavaScript(    fetch('http://localhost:8085/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'gowthamcd.cse@beyon.init', password: 'Beyon_io@2026' })
    })
    .then(r => r.json())
    .then(data => ({ success: true, data }))
    .catch(err => ({ success: false, error: err.message, stack: err.stack }));
  \);
  console.log('FETCH_RESULT:', JSON.stringify(result));
  app.quit();
});
