/* eslint-disable no-unused-vars */
const messenger = require('../src/Messenger')
const {trimSoul} = require('../src/Functions')
const chain = require('../src/Chains')
const store = require('../src/Store')
let debug = true
let state = {
    edits: []
}

messenger.on(`getProjectHistory`, msg => {
    getProjectHistory(msg.projectId).then(edits => {
        state.edits = edits
        messenger.emit(`${msg.projectId}_ProjectHistory`, edits)
    })
})


const getProjectHistory = (projectId) => {
    return new Promise((resolve, reject) => {
        if (!projectId) reject('no projectId passed')
        try {
            let result = []
            store.chainer(chain.projectHistory(projectId), store.app).map().on((data, key) => {
                let foundData = trimSoul(data)
                // debug && console.log('[GUN node] getProject Data Found: ', foundData)
                if (foundData && foundData.type === 'project' && foundData.id === projectId) {
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