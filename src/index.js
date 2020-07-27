const { remote } = require('electron')
const Path = require('./lib/path')
const fs = require('fs')
const Settings = require('./lib/settings')
const Notify = require('./lib/notifications')
const Lists = require('./lib/waifulists')
const $ = require('./lib/jquery')

const accountsPath = Path.join(Path.OSLocalPath(), 'LocalStorage', 'accounts.json')
!fs.existsSync(accountsPath) && fs.writeFileSync(accountsPath, '{}')

const StatusColors = {
    "online": "#43b581",
    "idle": "#faa61a",
    "dnd": "#f04747",
    "invisible": "#747f8d",
    "offline": "#747f8d"
}

let tryingConnection
let disconnecting

async function ConnectToDiscord(token) {
    if (tryingConnection) return
    tryingConnection = 1

    const { ClientUser } = require('./lib/discord')
    const rs = $('.registerStatus')

    if (CheckConnection(token)) {
        rs.html('User is already connected.')
        rs.css('color', '#FBC02D')
        tryingConnection = 0
        return
    }

    rs.html('Connecting to user ...')
    rs.attr('id', 'noselect')
    rs.css('color', '#99AAB5')

    const conn = new ClientUser()
    await conn.Client.login(token)
        .then(async () => {

            rs.html('Waiting for client to be ready ...')
            const id = conn.Client.user.id
            
            const connection = $(`p.connection.${id}`)
            if (connection) $(connection).html('Waiting for client ...')

            await conn.waitUntilReady()
                .then(() => {
                    $('.registerBox').val('')
                    rs.html('Successfully connected!')
                    rs.css('color', '#04f430')

                    conn.addConnection(conn.Client)
                    conn.update()

                    const userTag = `${conn.Client.user.username}#${conn.Client.user.discriminator}`

                    Notify('Weebcord', userTag + ' is ready!')
                })
                .catch(e => {
                    console.log(e)
                    rs.html(e)
                    rs.css('color', '#b71c1c')
                })
                .finally(() => {
                    tryingConnection = 0
                    LoadAccounts()
                    FocusAccount(id, require(accountsPath)[id])
                })
            
        })
        .catch(e => {
            console.log(e.message)
            rs.html(e.message)
            rs.css('color', '#b71c1c')
            tryingConnection = 0
            LoadAccounts()
        })

}

async function DisconnectClient(token) {
    if (disconnecting) return
    disconnecting = 1
    
    const conn = CheckConnection(token)

    if (conn) {

        const id = conn.Client.user.id
        const element = `p.connection.${id}`

        $(element).html('Disconnecting ...')
        $(element).css('color', '#99AAB5')

        await conn.disconnect()
            .then(() => {
                $(`div.userLogs.${id} .userLog`).not(':last').remove()

                const userTag = `${conn.Client.user.username}#${conn.Client.user.discriminator}`
                Notify('Weebcord', userTag + ' has disconnected!')

            }).catch(e => console.log(e.message))
            .finally(() => {
                const account = require(accountsPath)[id]

                disconnecting = 0
                LoadAccounts()
                account && FocusAccount(id, account)
            })
    }
}

function DeleteAccount(token) {
    if (tryingConnection || disconnecting) return
    const accounts = require(accountsPath)
    const account = Object.keys(accounts)
        .filter(e => accounts[e].token === token)[0]

    if (account) {

        delete accounts[account]
        console.log('deleted ' + account, accounts)

        fs.writeFileSync(
            Path.join(accountsPath), 
            JSON.stringify(accounts, null, 4)
        )

        CheckConnection(token) ? DisconnectClient(token) : LoadAccounts()
    
        const focusAccount = Object.keys(accounts).sort()[0]
        FocusAccount(
            focusAccount, 
            accounts[focusAccount]
        )
    }
    
}

function CheckConnection(token) {
    const { connections } = require('./lib/discord')
    return connections.filter(c => c.Client.token === token).first()
}

function LoadUserData(data) { 
    $('.username').html(`${data.info.username}<label class="tag">#${data.info.tag}</label>`)
    $('.userid').html(data.info.id)
    $('.lastLogin').html(data.info.lastLogin)
    $('.userImage').attr('src', `${data.info.avatar ? data.info.avatar : '../assets/images/usertemplate.png'}`)

    const conn = CheckConnection(data.token)
    const color =  conn ? StatusColors[conn.Client.user.presence.status] : StatusColors.offline

    $('.userImage').css('border', `6px solid ${color}`)
}

function FocusAccount(id, data) {
    const acc = $(`div.l-tabElement.${id}`)
    const logs = $(`div.userLogs.${id}`)

    if (acc && logs) {
        $('.register').attr('id', 'hidden')
        $('.l-tabElement').each((_, e) => $(e).attr('id', ''))
        $(acc).attr('id', 'selected')
        $('.pannel').attr('id', '')

        $('.userLogs').each((_, e) => 
            $(e).attr('id', 'hidden'))

        $(logs).attr('id', '')

        if (data) { 
            document.title = `${data.info.username}#${data.info.tag} - Weebcord`
            LoadUserData(data)
        }
    }
}

function LoadAccounts() {
    const { connections } = require('./lib/discord')
    const accounts = require(accountsPath)
    const accountsTab = $('#accounts').empty()

    document.title = 'Weebcord'

    Object.keys(accounts).sort().forEach(id => {
        const token = accounts[id].token
        const acc = $(`<div class="l-tabElement ${id}">`)
        $(acc).html(accounts[id].info.username)

        const connection = $(`<p class="connection ${id}">`)
        $(connection).css('font-style', 'italic')

        if (connections.get(id)) {
            $(connection).html('Connected')
            $(connection).css('color', '#00C853')
        } else {
            $(connection).html('Disconnected')
              $(connection).css('color', '#56626b')
        }

        const deleteButton = $('<i class="material-icons" id="deleteAccount">')
        $(deleteButton).html('remove_circle')
        $(deleteButton).css('position', 'absolute')
        $(deleteButton).css('margin-top', '-30px')
        $(deleteButton).css('margin-left', '160px')

        /* Check user logs */
        let logs = $(`div.userLogs.${id}`)

        if (!logs.length) {
            logs = $('.userLogs:first').clone().addClass(id)
            $('.pannelTab:first').append(logs)
        }

        $(acc).append(connection)
        $(acc).append(deleteButton)
        $(accountsTab).append(acc)

        $(deleteButton).click(() => DeleteAccount(token))

        /* Events */
        $(acc).click(() => {
            if ($(acc).attr('id')) return

            FocusAccount(id, accounts[id])
        })

        $(acc).dblclick(() => {
            if (tryingConnection || disconnecting) return

            if (CheckConnection(token)) {
                DisconnectClient(token)
            } else {
                $(connection).html('Connecting ...')
                $(connection).css('color', '#99AAB5')
                ConnectToDiscord(token)
            }

        })

        if (CheckConnection(token)) FocusAccount(id, accounts[id])
    })

    /* New Accounts Button */
    const createNew = $('<div class="l-tabElement l-tabCreate">')
    $(createNew).html('+ New Account')
    $(accountsTab).append(createNew)

    $(createNew).click(() => {
        if (!createNew.attr('id')) {
            $(createNew).attr('id', 'registerSelected')
            $('.register').attr('id', '')
            $('.registerStatus').attr('id', 'hidden')
        } else {
            $(createNew).attr('id', '')
            $('.register').attr('id', 'hidden')
        }
    })

}

$(document).ready(function() {

    $.fn.capitalize = s => 
        s[0].toUpperCase() + s.slice(1)

    $('#close').click(() => 
        remote.getCurrentWindow().close())

    $('#minimize').click(() => 
        remote.getCurrentWindow().minimize())

    $('#maximize').click(() => {
        const window = remote.getCurrentWindow()
        window.isMaximized() ? window.unmaximize() : window.maximize()
    })

    $('.tab').each((_, e) => {
        $(e).click(() => {
            if (!e.id.length)

            $('.account .tab').each((_, em) => $(em).attr('id', ''))
            $('.pannelTab').each((_, em) => $(em).attr('id', 'hidden'))

            $(e).attr('id', 'selected')

            $('.pannelTab').each((_, em) => {
                const attribute = em.attributes.getNamedItem(`wm-${e.innerHTML.toLowerCase()}`)
                attribute ? $(em).attr('id', '') : $(em).attr('id', 'hidden')
            })

        })
    })

    $('.dropzone__input').each((_, e) => {
        const dropzone = $(e).closest('.dropzone')

        $(dropzone).click(() => e.click())

        $(dropzone).on('drag dragstart dragend dragover dragenter dragleave drop', ev => {
            ev.preventDefault()
            ev.stopPropagation()
        })

        $(dropzone).on('dragover dragenter', () => 
            $(dropzone).addClass('dropzone-drag')
        );

        $(dropzone).on('dragleave dragend drop', () => 
            $(dropzone).removeClass('dropzone-drag')
        )

        $(dropzone).on('drop', ev => {
            const data = ev.originalEvent.dataTransfer.files
            data[0] && Lists.register(data)
        })

        $(e).change(() => 
            e.files.length && Lists.register(e.files)
        )
    })

    /* Waifu Lists */

    Lists.update()
    Lists.load()

    $('.listSelect option')
        .removeAttr('selected')
        .filter(`[value="${Settings.get('selectedList')}"]`)
        .attr('selected', true)

    $('.listSelect').change(() => {
        Settings.set('selectedList', $('.listSelect option:selected').prop('value'))
        Lists.load()
    })

    $('#deleteList').click(() => Lists.delete())

    /* Checkboxes */
    $('input:checkbox').each((_, e) => {
        const id = $(e).attr('id')
        const update = () => 
            $(e).prop('checked', Settings.get(id) ? 'yes' : '')

        update()

        $(e).click(() => {
            Settings.toggle(id)
            update()
            console.log(id, Settings.get(id))
        })

    })

    LoadAccounts()
    $('.registerButton').click(() => ConnectToDiscord($('.registerBox').val()))
})
