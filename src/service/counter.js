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
    messenger.emit('count', count.toString())
}

export const setCount = amount => {
    if(Number.isInteger(amount)) {
        debug && console.log('setting count amount: ', amount)
        count = amount
    }
    else {
        debug && console.log('wrong amount: ', amount)
        return false
    }
}