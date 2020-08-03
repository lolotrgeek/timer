import messenger from '../constants/Messenger'
import { projectValid } from '../constants/Validators'
import { trimSoul } from '../constants/Functions'
import * as chain from '../data/Chains'
import * as store from '../data/Store'

let debug = true
let state = {
    projects: []
}

messenger.on(`getProjects`, async msg => {
    console.log('get projects')
    const projects = await getProjects()
    messenger.emit(`projects`, projects)
})

const getProjects = () => {
    return new Promise((resolve, reject) => {
        try {
            let result = []
            store.chainer(chain.projects(), store.app).map().on((data, key) => {
                let foundData = trimSoul(data)
                debug && console.log('[GUN node] getProject Data Found: ', foundData)
                if (foundData && foundData.type === 'project') {
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