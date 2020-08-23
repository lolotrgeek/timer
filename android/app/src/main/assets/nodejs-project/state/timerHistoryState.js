/* eslint-disable no-unused-vars */
const messenger = require('../src/Messenger')
const { trimSoul } = require('../src/Functions')
const chain = require('../src/Chains')
const store = require('../src/Store')
let debug = true
let state = {
    edits: []
}

messenger.on(`getTimerHistory`, msg => {
    getTimerHistory(msg.timerId).then(edits => {
        state.edits = edits
        messenger.emit(`${msg.timerId}_TimerHistory`, edits)
    })
})


const getTimerHistory = (timerId) => {
    return new Promise((resolve, reject) => {
        if (!timerId) reject('no timerId passed')
        try {
            let result = []
            store.chainer(chain.timerHistory(timerId), store.app).map().on((data, key) => {
                let foundData = trimSoul(data)
                // debug && console.log('[GUN node] getTimer Data Found: ', foundData)
                if (foundData && foundData.type === 'timer' && foundData.id === timerId) {
                    result.push(foundData)
                }
            })
            resolve(result)
        } catch (error) {
            debug && console.debug && console.log(error)
            reject(error)
        }
    })
}