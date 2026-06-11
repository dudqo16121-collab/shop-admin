const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow = null;
let splashWindow = null;

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 420,
    height: 300,
    frame: false,
    transparent: false,
    resizable: false,
    center: true,
    alwaysOnTop: true,
    webPreferences: { nodeIntegration: false },
    backgroundColor: '#1A1917',
  });
  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
}

function createMain() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'ShopAdmin',
    show: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
    backgroundColor: '#F8F7F5',
  });

  const isDev = process.env.NODE_ENV !== 'production';
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, 'out/index.html')}`);

  // 메인 창 로드 완료 시 스플래시 닫고 메인 표시
  mainWindow.webContents.on('did-finish-load', () => {
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
        splashWindow = null;
      }
      mainWindow.show();
      mainWindow.focus();
    }, 2200); // 스플래시 최소 노출 시간
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createSplash();
  createMain();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMain();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});