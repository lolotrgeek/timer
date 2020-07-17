import messenger from '../constants/Messenger'
import { colorValid, nameValid } from '../constants/Validators'
import * as chain from '../data/Chains'
import * as store from '../data/Store'
import { newProject } from '../data/Models'

let debug = true
let state = {}
const setState = (key, value) => state[key] = value

messenger.on('ProjectCreate', event => {
    if (typeof event === 'object' && event.name && event.color) {
        state = event
        if (!nameValid(state.name)) {
            messenger.emit('ProjectCreateError', `${state.name} is not valid name`)
            return false
        }
        if (!colorValid(state.color)) {
            // alert('Need valid color');
            messenger.emit('ProjectCreateError', `${state.color} is not valid color`)
            return false
        }
        else {
            createProject(state.name, state.color).then(project => {
                console.log(`success! ${project.id}`)
                messenger.emit('ProjectCreateSuccess', project)
            })

        }
    }
})

const createProject = (name, color) => {
    return new Promise((resolve, reject) => {
        const project = newProject(name, color)
        if (!project) reject(false)
        debug && console.log('[react Data] Creating Project', project)
        // store.set(chain.projectHistory(project.id), project)
        store.put(chain.project(project.id), project)
        // TODO: make this part of chaining?
        messenger.on(`projects/${project.id}`, event => {
            debug && console.log(event)
            if (event === project) resolve(project)
            else reject(event)
        })
    })
}