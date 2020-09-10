const messenger = require('./Messenger')
const {parse} = require('./src/Functions')
const {getOne, getAll, putAll, setAll, offAll } = require('./src/Store')

const debug = false 

messenger.on('get', msg => {
    debug && console.log('[React node] incoming get: ' + typeof msg, msg)
    try {
        debug && console.log('[GUN node] Getting : ' + msg)
        getOne(msg)
    } catch (error) {
        debug && console.log('[GUN node] : Getting failed' + error)
    }
})

messenger.on('getAll', msg => {
    debug && console.log('[React node] incoming getAll: ' + typeof msg, msg)
    try {
        debug && console.log('[GUN node] Getting All: ' + msg)
        getAll(msg)
    } catch (error) {
        debug && console.log('[GUN node] : Getting All failed ' + error)
    }
})

messenger.on('put', msg => {
    debug && console.log('[React node] incoming put: ' + typeof msg, msg)
    try {
        debug && console.log('[React node] storing - ' , msg)
        let input = parse(msg)
        if(input && typeof input === 'object')
        putAll(input.key, input.value)
    } catch (error) {
        debug && console.log('[GUN node] : Putting failed ' + error)
    }
})

messenger.on('set', msg => {
    debug && console.log('[React node] incoming set: ' + typeof msg, msg)
    try {
        debug && console.log('[React node] storing - ' , msg)
        let input = parse(msg)
        if(input && typeof input === 'object')
        setAll(input.key, input.value)
    } catch (error) {
        debug && console.log('[GUN node] : Setting failed ' + error)
    }
})

messenger.on('off', msg => {
    debug && console.log('[React node] incoming off: ' + typeof msg, msg)
    try {
        debug && console.log('[React node] Off - ' + msg)
        offAll(msg)
    } catch (error) {
        debug && console.log('[GUN node] : Off failed ' + error)
    }
})