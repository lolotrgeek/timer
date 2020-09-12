const messenger = require('./src/Messenger')
const { secondsToString } = require('./src/Functions')

let debug = false
let count = 0
let counter

exports.runCounter = () => {
    debug && console.log('[Timer node] run timer ')
    clearInterval(counter)
    counter = setInterval(() => {
        debug && console.log(`running counter: ${count}`)
        messenger.emit('count', secondsToString(count))
        count++
    }, 1000)
}
exports.stopCounter = () => {
    debug && console.log('[Timer node] Stop Counter')
    clearInterval(counter)
    messenger.emit('count', secondsToString(count))
}

exports.setCount = amount => {
    if (Number.isInteger(amount)) {
        debug && console.log('setting count amount: ', amount)
        count = amount
    }
    else {
        debug && console.log('wrong amount: ', amount)
        return false
    }
}