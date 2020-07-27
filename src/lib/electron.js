const { app, BrowserWindow } = require('electron')
const url = require('url')

let window

function startApp() {
    window = new BrowserWindow({
        width: 1024,
        height: 768,
        backgroundColor: '#202225',
        frame: false,
        show: false,
        webPreferences: {
            nodeIntegration: true
        },
        icon: `${__dirname}/../../assets/icons/icon.ico`
    })

    window.once('ready-to-show', () => window.show())
    window.on('closed', () => window = null)

    window.loadURL(url.format({
        pathname: `${__dirname}/../index.html`,
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
