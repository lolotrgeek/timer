import messenger from '../constants/Messenger'
import { projectValid } from '../constants/Validators'
import * as chain from '../data/Chains'
import * as store from '../data/Store'

let state = {
    edit: {},
    original: {}
}
const setState = (key, value) => state[key] = value

messenger.on('projectEdit', event => {
    if (validProject(event)) getProject(event).then(project => {
        state.original = project
        state.edit = project
        messenger.emit('projectToEdit', project)
    })

})

messenger.on('name', event => {
    if (!nameValid(event)) {
        messenger.emit('error', `${event} is not valid name`)
        return false
    } else {
        state.edit.name = event
    }
})

messenger.on('color', event => {
    if (!colorValid(event)) {
        messenger.emit('error', `${event} is not valid name`)
        return false
    } else {
        state.edit.color = event   
    }
})

messenger.on('projectEditSubmit', event => {
    if(projectValid(state.edit)) updateProject(state.edit).then(project => {
            messenger.emit('success', `Project ${project.name} updated!`)
        })

    }
})

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
    return new Promise((resolve, reject => {
        if (projectEdit.deleted) { projectEdit.deleted = null }
        projectEdit.edited = new Date().toString()
        debug && console.log('[react Data] Updating Project', projectEdit)
        store.set(chain.projectHistory(projectEdit.id), projectEdit)
        store.put(chain.project(projectEdit.id), projectEdit)

        messenger.on(`${projectEdit.id}_put`, event => {
            if (event === projectEdit) resolve(projectEdit)
            else reject(event)
        })
    }))

}