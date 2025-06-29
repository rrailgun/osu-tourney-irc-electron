const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let apiServer;
let uiServer;
Menu.setApplicationMenu(null);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL('http://localhost:4200');
}

app.whenReady().then(() => {
  uiServer = spawn('node', ['ui-server.js'], {
    cwd: __dirname,
    detached: false,
    stdio: 'ignore',
  });

  apiServer = spawn('node', ['server/server.js'], {
    cwd: __dirname,
    detached: false,
    stdio: 'ignore',
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (apiServer) apiServer.kill();
  if (uiServer) uiServer.kill();
  if (process.platform !== 'darwin') app.quit();
});
