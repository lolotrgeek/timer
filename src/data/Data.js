import { cloneTimer, newProject, doneTimer, newTimer } from './Models'
import { isRunning, multiDay, newEntryPerDay, settingCount, dateSimple, totalTime} from '../constants/Functions'
import * as store from './Store'
import * as chain from './Chains'

const debug = true

export const createProject = (name, color) => {
    const project = newProject(name, color)
    if (!project) return false
    debug && console.log('[react Data] Creating Project', project)
    // store.set(chain.projectHistory(project.id), project)
    store.put(chain.project(project.id), project)
}

export const updateProject = (project, updates) => {
    let projectEdit = project
    Object.assign(projectEdit, updates)
    if (projectEdit.deleted) { projectEdit.deleted = null }
    projectEdit.edited = new Date().toString()
    debug && console.log('[react Data] Updating Project', projectEdit)
    store.set(chain.projectHistory(project.id), projectEdit)
    store.put(chain.project(projectEdit.id), projectEdit)
}

export const restoreProject = (project) => {
    let restoredProject = project
    if (restoredProject.status === 'deleted') {
        restoredProject.status = 'active'
    }
    debug && console.log('[react Data] Restoring Project', restoredProject)
    store.put(chain.project(restoreProject.id), restoreProject)
}


export const deleteProject = (project) => {
    debug && console.log('[react Data] Deleting Project', project)
    let projectDelete = project
    projectDelete.deleted = new Date().toString()
    store.set(chain.projectHistory(projectDelete.id), projectDelete)
    projectDelete.status = 'deleted'
    store.put(chain.project(project.id), projectDelete)
}
/**
 * Generates a new timer using the standard timer model
 * TODO: consider doing a pre-create sync to eliminate unsynced running timers/deleted projects
 * @param {*} project 
 */
export const createTimer = (project) => {
    if (!project || typeof project !== 'object' || !project.id || project.id.length < 9) return false
    debug && console.log('[react Data] Creating Timer', project)
    let timer = newTimer(project.id)
    timer.name = project.name
    timer.color = project.color
    debug && console.log('[react Data] Created Timer', timer)
    store.put(chain.running(), timer)
    store.set(chain.timerHistory(timer.id), timer)
    return timer
}

export const runTimer = (timer) => {
    store.put('running/timer', JSON.stringify(timer))
}

export const updateTimer = (timer) => {
    let editedTimer = timer
    if (editedTimer.deleted) { editedTimer.deleted = null }
    editedTimer.edited = new Date().toString()
    debug && console.log('[react Data] Updating Timer', editedTimer)
    store.set(chain.timerHistory(editedTimer.id), editedTimer)
    store.put(chain.timer(editedTimer.id), editedTimer)
    store.put(chain.timerDate(editedTimer.started, editedTimer.id), true)
    store.put(chain.projectTimer(editedTimer.project, editedTimer.id), editedTimer)
    if (timer.started !== editedTimer.started) {
        let timerMoved = timer
        timerMoved.deleted = new Date().toString()
        timerMoved.status = 'moved'
        store.set(chain.timerDate(timer.started, timer.id), timerMoved)
    }
    store.set(chain.timerDate(editedTimer.started, editedTimer.id), editedTimer)
}

export const restoreTimer = (timer) => {
    let restoredTimer = timer
    // restoredTimer.restored = new Date().toString()
    if (restoredTimer.status === 'deleted') {
        restoredTimer.status = 'done'
        store.set(chain.timerHistory(restoredTimer.id), restoredTimer)
    }
    debug && console.log('[react Data] Restoring Timer', restoredTimer)
    store.put(chain.timer(restoredTimer.id), restoredTimer)
    store.set(chain.timerDate(restoredTimer.started, restoredTimer.id), restoredTimer)
}

export const endTimer = (timer) => {
    debug && console.log('[react Data] Ending', timer)
    store.set(chain.timerHistory(timer.id), timer)
    store.put(chain.timer(timer.id), timer)
    store.set(chain.timerDate(timer.started, timer.id), timer)
}

export const deleteTimer = (timer) => {
    debug && console.log('[react Data] Deleting Timer', timer)
    let timerDelete = timer
    timerDelete.deleted = new Date().toString()
    timerDelete.status = 'deleted'
    store.set(chain.timerHistory(timerDelete.id), timerDelete)
    store.put(chain.timer(timerDelete.id), timerDelete)
    store.put(chain.timerDate(timerDelete.started, timerDelete.id), false)
    store.put(chain.projectTimer(timerDelete.project, timerDelete.id), timerDelete)
    console.log(timerDelete)
}

/**
 * Generates a new timer using the given timer model
 * @param {String} projectId project hashid
 */
export const addTimer = timer => {
    const clonedTimer = cloneTimer(timer)
    debug && console.log('[node Data] Storing Timer', clonedTimer)
    endTimer(clonedTimer)
}

export const finishTimer = (timer) => {
    if (isRunning(timer)) {
        debug && console.log('[react Data STOP] Finishing', timer)
        let done = doneTimer(timer)
        store.put(chain.running(), {id: 'none'})
        // Danger zone until endTimer is called
        if (multiDay(done.started, done.ended)) {
            const dayEntries = newEntryPerDay(done.started, done.ended)
            dayEntries.map((dayEntry, i) => {
                let splitTimer = done
                splitTimer.started = dayEntry.start
                splitTimer.ended = dayEntry.end
                debug && console.log('[react Data] Split', i, splitTimer)
                if (i === 0) { endTimer(splitTimer) } // use initial timer id for first day
                else { addTimer(splitTimer) }
                return splitTimer
            })
        } else {
            endTimer(done)
        }
    } else { return timer }
}

export const getProjects = () => {
    // store.get(chain.projects())
    store.getAllOnce(chain.projects())
    // return store.off('projects')
}

export const getProject = projectId => {
    store.get(chain.project(projectId))
}

export const getTimers = () => {
    store.getAll(chain.timers())
}

export const getTimerDates = () => {
    store.getAllOnce(chain.timerDates())
}

export const getTimersForDate = (date) => {
    store.getAllOnce(`date/timers/${date}`)
}

export const getTimer = timerId => {
    store.get(chain.timer(timerId))
}

export const getTimerHistory = timerId => {
    store.get(chain.timerHistory(timerId))
}

export const getProjectHistory = projectId => {
    store.get(chain.projectHistory(projectId))
}

export const getRunning = () => {
    store.get(chain.running())
}

export const getDayTimer = (timer) => {
    store.get(chain.timerDate(timer.started, timer.id)+'/'+timer.key)
}