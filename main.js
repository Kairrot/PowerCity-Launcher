// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, autoUpdater} = require('electron')
const path = require('path')

require('electron-reload')(__dirname)

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 980,
    height: 552,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    resizable: false,
    //backgroundColor: '#171614'
  })

  /* CHARGEMENT */
  require('./app/assets/js/preloader');
  require('./app/assets/js/updater')(mainWindow, ipcMain)
  /* CHARGEMENT */

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile('app/index.html');
}

app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('update', (event) => {
  autoUpdater.quitAndInstall();
})

const XboxLiveAuth = require('@xboxreplay/xboxlive-auth')
ipcMain.handle('auth', async (event, options) => {
  try {
    return await XboxLiveAuth.authenticate(options.username, options.password, { XSTSRelyingParty: 'rp://api.minecraftservices.com/' });
  } catch (e) { return null; }
})