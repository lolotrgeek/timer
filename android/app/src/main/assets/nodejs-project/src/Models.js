// mini nodeified version of Models.js

const Hashids = require('hashids/cjs')


const cloneTimer = timer => {
    const hashids = new Hashids()
    let clone = timer
    clone.id = hashids.encode(Date.now().toString())
    clone.count = 0
    return clone
}

const newTimer = projectId => {
    const hashids = new Hashids()
    const key = hashids.encode(Date.now().toString())
    const start = new Date().toString()
    const timer = {
        id: key,
        created: start,
        started: start,
        ended: '',
        type: 'timer',
        project: projectId,
        status: 'running', // done | deleted
        edited: '',
        total: 0,
        mood: 'good',
        energy: 50,
    }
    return timer
}
const newEntry = projectId => {
    let timer = newTimer(projectId)
    timer.status = 'done'
    timer.ended = timer.created
    return timer
}

const doneTimer = (timer) => {
    const done = timer
    done.ended = new Date().toString()
    done.status = 'done'
    return done
}

const editedTimer = timer => {
    let editedTimer = timer
    if (editedTimer.deleted) { editedTimer.deleted = null }
    editedTimer.edited = new Date().toString()
    return editedTimer
}

const deletedTimer = timer => {
    let timerDelete = timer
    timerDelete.deleted = new Date().toString()
    timerDelete.status = 'deleted'
    return timerDelete
}

const newProject = (name, color) => {
    const hashids = new Hashids()
    const key = hashids.encode(Date.now().toString())
    const project = {
        id: key,
        created: new Date().toString(),
        type: 'project',
        status: 'active', // deleted
        name: name,
        color: color,
        edited: '',
        lastcount: 0,
        lastrun: '',
        // time: typeof time === 'string' && time.length > 0 ? parseInt(time) : time
    }
    return project
}

const editedProject = (project, updates) => {
    let update = project
    update = Object.assign(project, updates)
    update.edited = new Date().toString()
    return update
}

const deletedProject = project => {
    let projectDeleted = project
    projectDeleted.deleted = new Date().toString()
    projectDeleted.status = 'deleted'
    return projectDeleted
}

module.exports = { cloneTimer, doneTimer, editedTimer, deletedTimer, newProject, newTimer, newEntry, editedProject, deletedProject}