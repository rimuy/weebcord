const { Client, Collection } = require('discord.js-plus')
const Path = require('./path')
const moment = require('moment')
const fs = require('fs')

const connections = new Collection()

class ClientUser {
    constructor() {

        const client = this.Client
        const folder = Path.join(__dirname, '../', 'discord/')
        const files = fs.readdirSync(folder)
            .filter(f => f.endsWith('.js'))

        files.forEach(f => {
            delete require.cache[folder + f]
            const eventFile = require(folder + f)

            try {
                client.on(eventFile.name, (...args) => 
                    eventFile.run(this, ...args))
            } catch(e) {
                console.log(e.message)
            }
        })

    }

    Client = new Client()

    waitUntilReady = () => new Promise((res, rej) => {
        const timeOut = setTimeout(() => rej('Time expired.'), 30000)

        this.Client.on('ready', async() => {
            clearTimeout(timeOut)
            res('Ready!')
        })
    })

    update = () => {
        const client = this.Client
        const user = client.user

        const filePath = Path.join(Path.OSLocalPath(), 'LocalStorage', 'accounts.json')
        const accounts = require(filePath)

        accounts[user.id] = {
            "info": {
                "username": user.username,
                "tag": user.discriminator,
                "id": user.id,
                "lastLogin": moment().format('YYYY/MM/DD HH:mm'),
                "status": user.presence.status
            },
            "token": client.token
        }

        if (user.avatar) accounts[user.id].info.avatar = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`

        fs.writeFileSync(filePath, JSON.stringify(accounts, null, 4))
        return this
    }

    addConnection = client => {
        connections.set(client.user.id, this)
        return this
    }

    connections = () => connections

    disconnect = () => new Promise((res, rej) => {
        const id = this.Client.user.id

        try {
            this.Client.destroy()
            connections.delete(id)
            res("Successfully disconnected.")
        } catch(e) { rej(new Error(e.message)) }
        
    })

}

module.exports = { ClientUser, connections }