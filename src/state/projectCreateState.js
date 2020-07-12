import messenger from '../constants/Messenger'
import { colorValid } from '../constants/Validators'
import * as chain from '../data/Chains'
import * as store from '../data/Store'
import { newProject } from '../data/Models'

let state = {}
const setState = (key, value) => state[key] = value

messenger.on('name', event => {
    if (!nameValid(event)) {
        messenger.emit('error', `${event} is not valid name`)
        return false
    } else {
        state.name = event
    }
})

messenger.on('color', event => {
    if (!colorValid(event)) {
        messenger.emit('error', `${event} is not valid name`)
        return false
    } else {
        state.color = event   
    }
})

messenger.on('newProjectSubmit', event => handleNewProjectSubmit(event))
const handleNewProjectSubmit = event => {
    if (!nameValid(state.name)) {
        messenger.emit('error', `${state.name} is not valid name`)
        return false
    }
    if (!colorValid(state.color)) {
        // alert('Need valid color');
        messenger.emit('error', `${state.color} is not valid color`)
        return false
    }
    else {
        createProject(state.name, state.color).then(project => {
            messenger.emit('success', `Project ${project.name} updated!`)
        })
        
    }
}

const createProject = (name, color) => {
    return new Promise((resolve, reject) => {
        const project = newProject(name, color)
        if (!project) reject(false)
        debug && console.log('[react Data] Creating Project', project)
        // store.set(chain.projectHistory(project.id), project)
        store.put(chain.project(project.id), project)
        messenger.on(`${project.id}_put`, event => {
            if(event === project) resolve(project)
            else reject(event)
        })
    })
}