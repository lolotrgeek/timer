import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import * as store from '../data/Store'

let state = {
    timers: []
}

messenger.on(`getTimers`, msg => {
    getTimers().then(timers => {
        state.timers = timers
        messenger.emit(`timers`, timers)
    })
})

const getTimers = () => {
    return new Promise((resolve, reject) => {
        try {
            let result = []
            store.chainer(chain.timers(), store.app).map().on((data, key) => {
                let foundData = trimSoul(data)
                console.log(foundData)
                // debug && console.log('[GUN node] getProject Data Found: ', foundData)
                if (foundData && foundData.type === 'timer' && foundData.id === projectId) {
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