const { remote } = require('electron');
const Settings = require('./settings');
const path = require('path');

module.exports = (title, message) => {
    const window = remote.getCurrentWindow();
    if (Notification.permission !== 'granted' ||
        window.isFocused() || !Settings.get('notifications')) return;

    new Notification(title, {
        body: message,
        icon: path.join(__dirname, '..', '..', 'assets', 'icons', 'icon.png')
    })
        .onclick = () => window.focus();
};