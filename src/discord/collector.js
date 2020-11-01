const fs = require('fs')
const moment = require('moment')
const Notify = require('../lib/notifications')
const Settings = require('../lib/settings')
const Path = require('path')

const $ = require('../lib/jquery')

const listsPath = Path.join(__dirname, '..', '..', 'docs/')

module.exports = {
    "name": "message",
    "run": (Connection, message) => {

        const { bot, selectedList, notifications } = Settings.get()
        const modulePath = Path.join(__dirname, '../', 'bots', bot + '.js')

        if (fs.existsSync(modulePath)) {
            require(modulePath)(
                Connection, 
                message, 
                fs.readFileSync(listsPath + selectedList, { encoding: 'utf8', flag: 'r' }).split('\n'),
                (() => { if (notifications) return Notify })()
            )

            /* General Logs */
            const now = moment().format('YYYY-MM-DD HH:mm:ss')
            fs.appendFileSync(
                Path.join(__dirname, '..', '..', 'logs', `${process.getCreationTime()}.log`), 
                `[${now}] [${$.fn.capitalize(bot)}] ${message.content}\n`
            )
            
        }

    }
}