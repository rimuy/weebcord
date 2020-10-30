const { app, BrowserWindow } = require('electron')
const url = require('url')
const path = require('path')

let window

function startApp() {
    window = new BrowserWindow({
        width: 1024,
        height: 768,
        backgroundColor: '#202225',
        frame: false,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        },
        icon: path.join(__dirname, '..', '..', 'assets', 'icons', 'icon.ico')
    })

    window.once('ready-to-show', () => window.show())
    window.on('closed', () => window = null)

    window.loadURL(url.format({
        pathname: path.join(__dirname, '..', 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // window.removeMenu()
}

app.on('ready', startApp)

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
      app.quit()
    }
})

app.on('activate', function() {
    if (window === null) {
        startApp()
    }
})
