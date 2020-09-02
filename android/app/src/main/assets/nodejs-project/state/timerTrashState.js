/* eslint-disable no-unused-vars */
exports.timerTrashState = p => {
    p.messenger.on(`getTimerTrash`, msg => {
        getTimerTrash(msg.projectId).then(trash => {
            p.state.trash = trash
            p.messenger.emit(`timerTrash`, trash)
        })
    })


    const getTimerTrash = (projectId) => {
        return new Promise((resolve, reject) => {
            try {
                let result = []
                p.store.chainer(p.chain.timers(), p.store.app).map().on((data, key) => {
                    let foundData = p.trimSoul(data)
                    // debug && console.log('[GUN node] getTimer Data Found: ', foundData)
                    if (foundData && foundData.type === 'timer' && foundData.project === projectId && foundData.status === 'deleted') {
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