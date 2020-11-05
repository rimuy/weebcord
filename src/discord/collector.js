const fs = require('fs');
const Notify = require('../lib/notifications');
const Settings = require('../lib/settings');
const Path = require('../lib/path');

const listsPath = Path.join(Path.OSLocalPath(), 'lists/');

module.exports = {
    'name': 'message',
    'run': (Connection, message) => {

        const { bot, selectedList, notifications } = Settings.get();
        const modulePath = Path.join(__dirname, '../', 'bots', `${bot}.js`);

        if (fs.existsSync(modulePath)) {
            require(modulePath)(
                Connection,
                message,
                fs.readFileSync(listsPath + selectedList, { encoding: 'utf8', flag: 'r' }).split('\n'),
                (() => { if (notifications) return Notify; })()
            );
        }

    }
};