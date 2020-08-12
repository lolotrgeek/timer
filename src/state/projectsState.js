import messenger from '../constants/Messenger'
import { projectValid } from '../constants/Validators'
import { trimSoul } from '../constants/Functions'
import * as chain from '../data/Chains'
import * as store from '../data/Store'

let debug = false
let state = {
    projects: []
}

messenger.on(`getProjects`, async msg => {
    debug && console.log('get projects')
    const projects = await getProjects()
    messenger.emit(`projects`, projects)
})

const getProjects = () => {
    return new Promise((resolve, reject) => {
        try {
            store.chainer(chain.projects(), store.app).map().on((data, key) => {
                let foundData = trimSoul(data)
                debug && console.log('[GUN node] getProject Data Found: ', foundData)
                if (foundData && foundData.type === 'project' && foundData.status === 'active' && !state.projects.some(project => project.id === foundData.id)) {
                    state.projects.push(foundData)
                }
            })
            resolve(state.projects)
        } catch (error) {
            debug && console.debug && console.log(error)
            reject(error)
        }
    })
}