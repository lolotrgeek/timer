import messenger from '../constants/Messenger'

let debug = false
let count = 0
let counter

export const runCounter = () => {
    debug && console.log('[Timer node] run timer ')
    clearInterval(counter)
    counter = setInterval(() => {
        debug && console.log(`running counter: ${count}`)
        messenger.emit('count', count.toString())
        count++
    }, 1000)
}
export const stopCounter = () => {
    debug && console.log('[Timer node] Stop Counter')
    clearInterval(counter)
    messenger.emit('notify', { state: "stop" })
}

export const setCount = amount => {
    if(Number.isInteger(amount)) {
        console.log('setting count amount')
        count = amount
    }
    else {
        console.log('wrong amount')
        return false
    }
}