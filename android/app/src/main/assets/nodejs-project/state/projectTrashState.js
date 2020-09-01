/* eslint-disable no-unused-vars */
exports.projectTrashState = p => {
    p.messenger.on(`getProjectTrash`, msg => {
        getProjectTrash().then(trash => {
            p.state.trash = trash
            p.messenger.emit(`projectTrash`, trash)
        })
    })


    const getProjectTrash = () => {
        return new Promise((resolve, reject) => {
            try {
                let result = []
                p.store.chainer(p.chain.projects(), p.store.app).map().on((data, key) => {
                    let foundData = p.trimSoul(data)
                    // debug && console.log('[GUN node] getProject Data Found: ', foundData)
                    if (foundData && foundData.type === 'project' && foundData.status === 'deleted') {
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