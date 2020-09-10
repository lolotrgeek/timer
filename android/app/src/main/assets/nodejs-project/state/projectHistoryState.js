/* eslint-disable no-unused-vars */
exports.projectHistoryState = p => {
    p.messenger.on(`getProjectHistory`, msg => {
        getProjectHistory(msg.projectId).then(edits => {
            p.state.edits = edits
            p.messenger.emit(`${msg.projectId}_ProjectHistory`, edits)
        })
    })


    const getProjectHistory = (projectId) => {
        return new Promise((resolve, reject) => {
            if (!projectId) reject('no projectId passed')
            try {
                let result = []
                p.store.chainer(p.chain.projectHistory(projectId), p.store.app).map().on((data, key) => {
                    let foundData = p.trimSoul(data)
                    // debug && console.log('[GUN node] getProject Data Found: ', foundData)
                    if (foundData && foundData.type === 'project' && foundData.id === projectId) {
                        result.push(foundData)
                    }
                })
                resolve(result)
            } catch (error) {
                p.debug && console.log(error)
                reject(error)
            }
        })
    }
}