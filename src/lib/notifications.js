const { remote } = require('electron')
const Settings = require('./settings')

module.exports = (title, message) => {
    const window = remote.getCurrentWindow()
    if (Notification.permission !== 'granted' || 
        window.isFocused() || !Settings.get('notifications')) return

    new Notification(title, {
        body: message,
        icon: '../assets/icons/linux.png'
    })
    .onclick = () => window.focus()
}