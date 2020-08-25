/* eslint-disable no-unused-vars */
const messenger = require('../src/Messenger')
const { colorValid, nameValid } = require('../src/Validators')
const chain = require('../src/Chains')
const store = require('../src/Store')
const { newProject } = require('../src/Models')
const { parse } = require('../src/Functions')

let debug = true
let state = {}
const setState = (key, value) => state[key] = value

messenger.on('ProjectCreate', event => {
    event = parse(event)
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
            try {
                createProject(state.name, state.color).then(project => {
                    console.log(`success! ${project.id}`)
                    messenger.emit('ProjectCreateSuccess', project)
                })
            } catch (error) {
                console.error(error)
            }


        }
    }
})

const createProject = (name, color) => {
    return new Promise((resolve, reject) => {
        const project = newProject(name, color)
        if (!project) reject(false)
        debug && console.log('[react Data] Creating Project', project)
        // store.set(chain.projectHistory(project.id), project)
        store.chainer(chain.project(project.id), store.app).put(project, ack => {
            debug && console.log('[NODE_DEBUG_PUT] ERR? ', ack.err)
            if(!ack.err) resolve(project)
            else reject(ack.err)
        })
    })
}