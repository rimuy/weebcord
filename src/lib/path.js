const Path = require('path');
const { userInfo } = require('os');
const { existsSync, mkdirSync } = require('fs');

const DataStructure = [
    'LocalStorage',
    'logs',
    'lists'
];

const ExtendedPath = {
    ...Path,
    OSLocalPath: () => {
        const osPaths = {
            'win32': `C:\\Users\\${userInfo().username}\\AppData\\Local\\`,
            'darwin': `/Users/${userInfo().username}/Library/Preferences/`,
            'linux': `/home/${userInfo().username}/.local/share/`
        };

        const os = osPaths[process.platform];
        if (!os) {
            console.error(`Platform ${process.platform} not supported.`);
            return process.exit(1);
        }

        const appPath = Path.join(os, 'Weebcord');
        if (!existsSync(appPath)) mkdirSync(appPath);

        DataStructure.forEach(f => {
            const p = Path.join(appPath, f);
            if (!existsSync(p)) mkdirSync(p);
        });

        return appPath;
    }
};

module.exports = ExtendedPath;