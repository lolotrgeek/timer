/* eslint-disable no-unused-vars */
exports.timerHistoryState = p => {

    p.messenger.on(`getTimerHistory`, msg => {
        getTimerHistory(msg.timerId).then(edits => {
            p.state.edits = edits
            p.messenger.emit(`${msg.timerId}_TimerHistory`, edits)
        })
    })


    const getTimerHistory = (timerId) => {
        return new Promise((resolve, reject) => {
            if (!timerId) reject('no timerId passed')
            try {
                let result = []
                p.store.chainer(p.chain.timerHistory(timerId), p.store.app).map().on((data, key) => {
                    let foundData = p.trimSoul(data)
                    // debug && console.log('[GUN node] getTimer Data Found: ', foundData)
                    if (foundData && foundData.type === 'timer' && foundData.id === timerId) {
                        result.push(foundData)
                    }
                })
                resolve(result)
            } catch (error) {
                p.debug && console.debug && console.log(error)
                reject(error)
            }
        })
    }
}