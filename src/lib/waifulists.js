const Settings = require('./settings')
const Path = require('./path')
const fs = require('fs')
const $ = require('./jquery')

const listsPath = Path.join(Path.OSLocalPath(), 'lists/')

module.exports = {
    update: Update,
    load: Load,
    register: data => {
        Array.from(data).forEach(f => {
            const newFile = Path.join(listsPath, f.name)

            if (
                (f.name.endsWith('.txt') || !f.name.includes('.')) && 
                !fs.existsSync(newFile)
            ) {
                fs.copyFileSync(f.path, newFile)
                
                Update()
                $('.listSelect option')
                    .removeAttr('selected')
                    .filter(`[value="${f.name}"]`)
                    .attr('selected', true)

                Settings.set('selectedList', 
                    $('.listSelect option:selected').prop('value'))
                    
                Load()
            }
            
        })
    },
    delete: () => {
        const selected = Settings.get('selectedList')
        if (selected === 'default') return

        const file = Path.join(listsPath, selected)
        fs.unlinkSync(file)

        Settings.set('selectedList', 'default')

        Update()
        Load()
    }
}

function Update() {
    $('.listSelect option').not(':first').remove()

    fs.readdirSync(listsPath).forEach(f => {
        if (f === 'default') return
        const name = f.split('.txt')[0]
        const element = $(`<option value="${f}">`)

        $(element).html($.fn.capitalize(name))
        $('.listSelect').append(element)
    })
}

function Load() {
    // Start with a default list
    if (!fs.existsSync(Path.join(listsPath, 'default'))) {
        fs.copyFileSync(
            Path.join(__dirname, '..', '..', 'docs', 'default'),
            Path.join(listsPath, 'default')
        )
    }

    const list = Settings.get('selectedList')
    const file = fs.readFileSync(
        Path.join(listsPath, list), 
        { encoding: 'utf8', flag: 'r' }
    )

    if (file) {
        $('.listsScroll').empty()

        file.split('\n').forEach(text => {
            $('.listsScroll').append(`<p>${text}`)
        })
    }
}