const { autoUpdater } = require('electron-updater');

module.exports = (win, ipcMain) => {
    autoUpdater.on('update-available', info => {
        send(win, 'update-available', info)
        send(win, 'test')
    })

    autoUpdater.on('download-progress', info => {
        send(win, 'download-progress', info)
    })

    autoUpdater.on('update-downloaded', info => {
        send(win, 'update-downloaded', info)
    })

    autoUpdater.checkForUpdates()
}

function send(win, channel, text) {
    win.webContents.send(channel, text)
}