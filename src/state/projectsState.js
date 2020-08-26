import messenger from '../constants/Messenger'
import { projectValid } from '../constants/Validators'
import { trimSoul } from '../constants/Functions'
import * as chain from '../data/Chains'
import * as store from '../data/Store'

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