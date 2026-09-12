const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false,          // 无边框
    transparent: true,     // 透明窗口：启动时显示桌面
    backgroundColor: '#00000000',
    resizable: true,
    fullscreenable: true,
    webPreferences: {
      contextIsolation: true
    }
  });

  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'index.html'));

  // 入梦后按需进入全屏（由页面触发）
  win.webContents.on('before-input-event', () => {});
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
