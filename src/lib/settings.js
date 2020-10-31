const fs = require('fs')
const Path = require('./path')

const settingsPath = Path.join(Path.OSLocalPath(), 'LocalStorage', 'settings.json')
const settings = fs.existsSync(settingsPath) 
    ? require(settingsPath)  
    : {
        bot: "mudae",
        selectedList: "default",
        notifications: true,
        generalLogs: true,
        blacklist: []
    }

const write = () => 
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4))

module.exports = {
    get: key => key ? settings[key] : settings,
    set: (key, value) => {
        if (typeof settings[key] === typeof value) {
            settings[key] = value
            write()
        }
    },
    toggle: key => {
        if (typeof settings[key] === 'boolean') {
            settings[key] = !settings[key]
            write()
        }
    }
}