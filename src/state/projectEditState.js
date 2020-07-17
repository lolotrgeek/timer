import messenger from '../constants/Messenger'
import { colorValid, nameValid, projectValid } from '../constants/Validators'
import { trimSoul } from '../constants/Functions'
import * as chain from '../data/Chains'
import * as store from '../data/Store'
import { editedProject } from '../data/Models'

let debug = false
let state = {
    edit: {},
    original: {}
}

messenger.on('ProjectDetails', event => {
    if (event && typeof event === 'string') getProject(event).then(project => {
        state.original = project
        debug && console.log(project)
        messenger.emit(`${project.id}_details`, { name: project.name, color: project.color })
    })
})

messenger.on('ProjectEdit', event => {
    if (typeof event === 'object' && event.name && event.color) {
        state.edit = state.original
        state.edit.color = event.color
        state.edit.name = event.name
        if (!nameValid(state.edit.name)) {
            messenger.emit('ProjectCreateError', `${state.edit.name} is not valid name`)
            return false
        }
        if (!colorValid(state.edit.color)) {
            // alert('Need valid color');
            messenger.emit('ProjectCreateError', `${state.edit.color} is not valid color`)
            return false
        }
        else if (projectValid(state.edit)) {
            updateProject(state.edit).then(project => {
                debug && console.log(`success! ${project.id}`)
                messenger.emit('ProjectCreateSuccess', project)
            })
        }
    }
    //TODO unhappy paths
})

// DATA \\
const getProject = (projectId) => {
    return new Promise((resolve, reject) => {
        if (!projectId) reject('no projectId passed')
        try {
            store.chainer(chain.project(projectId), store.app).once((data, key) => {
                const foundData = trimSoul(data)
                // debug && console.log('[GUN node] getProject Data Found: ', foundData)
                if (foundData && foundData.type === 'project') {
                    resolve(foundData)
                }

            })
        } catch (error) {
            debug && console.debug && console.log(error)
            reject(error)
        }
    })
}

const updateProject = (projectEdit) => {
    return new Promise((resolve, reject) => {
        if (projectEdit.deleted) { projectEdit.deleted = null }
        projectEdit.edited = new Date().toString()
        debug && console.log('[react Data] Updating Project', projectEdit)
        store.set(chain.projectHistory(projectEdit.id), projectEdit)
        store.put(chain.project(projectEdit.id), projectEdit)
        // TODO: make this part of chaining?
        messenger.on(`project/${projectEdit.id}`, event => {
            if (event === projectEdit) resolve(projectEdit)
            else reject(event)
        })
    })
}