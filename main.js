const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const prompt = require('electron-prompt');
const dotenv = require('dotenv');

const envPath = path.join(app.getPath('userData'), '.env');

let mainWindow;
let apiServer;
let uiServer;

function writeEnvFile(clientId, clientSecret) {
  const content = `OSU_CLIENT_ID=${clientId}\nOSU_CLIENT_SECRET=${clientSecret}`;
  fs.mkdirSync(path.dirname(envPath), { recursive: true });
  fs.writeFileSync(envPath, content);
}

async function promptForEnv() {
  const clientId = await prompt({
    title: 'osu! API v2 Client ID',
    label: 'Enter OSU_CLIENT_ID:',
    inputAttrs: { type: 'text' },
    type: 'input',
    alwaysOnTop: true,
  });

  if (!clientId) return false;

  const clientSecret = await prompt({
    title: 'osu! API v2 Client Secret',
    label: 'Enter OSU_CLIENT_SECRET:',
    inputAttrs: { type: 'text' },
    type: 'input',
    alwaysOnTop: true,
  });

  if (!clientSecret) return false;

  writeEnvFile(clientId, clientSecret);
  return true;
}

function reloadModule(path) {
  delete require.cache[require.resolve(path)];
  return require(path);
}

async function restartServers() {
  if (apiServer) {
    apiServer.close();
    apiServer = null;
  }
  if (uiServer) {
    uiServer.close();
    uiServer = null;
  }

  const { startUIServer } = reloadModule('./ui-server.js');
  const { startAPIServer } = reloadModule('./server/server.js');

  uiServer = await startUIServer();
  apiServer = await startAPIServer();

  if (mainWindow) mainWindow.loadURL('http://localhost:4200');
}

async function handleUpdateEnv() {
  const success = await promptForEnv();
  if (!success) return;

  delete process.env.OSU_CLIENT_ID;
  delete process.env.OSU_CLIENT_SECRET;
  dotenv.config({ path: envPath });
  await restartServers();

  dialog.showMessageBox({
    message: 'API keys updated and servers restarted!',
    buttons: ['OK'],
  });
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'Update API Keys', click: handleUpdateEnv },
        { role: 'quit' },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

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

app.whenReady().then(async () => {
  if (!fs.existsSync(envPath)) {
    const success = await promptForEnv();
    if (!success) {
      app.quit();
      return;
    }
  }

  dotenv.config({ path: envPath });

  const { startUIServer } = require('./ui-server.js');
  const { startAPIServer } = require('./server/server.js');

  uiServer = await startUIServer();
  apiServer = await startAPIServer();

  createMenu();
  createWindow();
});

app.on('window-all-closed', () => {
  if (apiServer) apiServer.close();
  if (uiServer) uiServer.close();

  if (process.platform !== 'darwin') app.quit();
});
