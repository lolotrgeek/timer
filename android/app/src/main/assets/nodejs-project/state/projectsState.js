/* eslint-disable no-unused-vars */
const messenger = require('../src/Messenger')
const { trimSoul } = require('../src/Functions')
const chain = require('../src/Chains')
const store = require('../src/Store')

let debug = true
let state = {
    projects: []
}

messenger.on("getProjects", msg => {
    debug && console.log('get projects', msg)
    getProjects().then(projects => {
        messenger.emit("projects", projects)
    }).catch(error => {
        console.log(error)
        messenger.emit("projects", error)
    })
})

const getProjects = () => {
    return new Promise((resolve, reject) => {
        store.chainer(chain.projects(), store.app).map().on((data, key) => {
            let foundData = trimSoul(data)
            debug && console.log('[GUN node] getProjects Data Found: ', key, foundData)
            if (foundData && foundData.type === 'project' && foundData.status === 'active' && !state.projects.some(project => project.id === foundData.id)) {
                state.projects.push(foundData)
            }
        })
        if(state.projects.length > 0)resolve(state.projects)
        else reject('no projects to get')
    })
}