import messenger from '../constants/Messenger'

let debug = false
let count = 0
let counter

let running
messenger.on('running', msg => running = msg)

export const runCounter = () => {
    debug && console.log('[Timer node] run timer ')
    clearInterval(counter)

    if (running && running.name && running.status === 'running') {
        counter = setInterval(() => {
            if (!running || running.status !== 'running') {
                clearInterval(counter)
                return;
            }
            // debug && console.log(`running counter: ${running.id} | project: ${running.project}`)
            messenger.emit('count', count.toString())
            count++
        }, 1000)
    }
}
export const stopCounter = () => {
    debug && console.log('[Timer node] Stop Counter')
    clearInterval(counter)
    messenger.emit('notify', { state: "stop" })
}

export const setCount = amount => amount && typeof amount === 'number' ? count = amount : NaN