import { totalTime, parse, trimSoul } from '../constants/Functions'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import * as store from '../data/Store'


let debug = true
let timerState = {}
let current // current project in view state
let running = { id: 'none', name: 'none', project: 'none' }

messenger.on('getTimer', msg => {
    console.log('timer', msg.timerId)
    getTimer(msg.timerId).then(timer => {
        messenger.emit(`${msg.timerId}`, timer)
    })
})


const getTimer = timerId => {
    return new Promise((resolve, reject) => {
        if (!timerId) reject('no timerId passed')
        try {
            // OPTIMIZE: listen for changes with 'on' then update state in the background
            store.chainer(chain.timer(timerId), store.app).once((data, key) => {
                console.log(key)
                const foundData = trimSoul(data)
                console.log('foundTimer', foundData) // left off here try to debug with 'ack'
                if (foundData && foundData.type === 'timer') {
                    resolve(foundData)
                }
            })
        } catch (error) {
            debug && console.log(error)
            reject(error)
        }
    })
}
