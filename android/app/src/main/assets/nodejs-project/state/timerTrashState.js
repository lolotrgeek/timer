/* eslint-disable no-unused-vars */
const messenger = require('../src/Messenger')
const {trimSoul} = require('../src/Functions')
const chain = require('../src/Chains')
const store = require('../src/Store')
let debug = true
let state = {
    trash: []
}

messenger.on(`getTimerTrash`, msg => {
    getTimerTrash(msg.projectId).then(trash => {
        state.trash = trash
        messenger.emit(`timerTrash`, trash)
    })
})


const getTimerTrash = (projectId) => {
    return new Promise((resolve, reject) => {
        try {
            let result = []
            store.chainer(chain.timers(), store.app).map().on((data, key) => {
                let foundData = trimSoul(data)
                // debug && console.log('[GUN node] getTimer Data Found: ', foundData)
                if (foundData && foundData.type === 'timer' && foundData.project === projectId && foundData.status === 'deleted') {
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