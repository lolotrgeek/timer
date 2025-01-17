// Handlers for event listeners - A Handler consumes an event and some state, applies conditions, then updates state 
import { parse, totalTime } from '../constants/Functions'

const debug = false


export const putHandler = (event, state) => {
    if (!event) return
    debug && console.log('[react] successful put.')
    let item = parse(event)
    debug && console.log('put ' + typeof item + ' ', item)
}

export const runningHandler = (event, state) => {
    if (!event) return
    let item = parse(event)
    if (item && typeof item === 'object' && item.status === 'running') {
        state.running.current = item
        if (state.setMood) state.setMood(item.mood)
        if (state.setEnergy) state.setEnergy(item.energy)
    }
    debug && console.log('[react] running', state.running.current)

}

///////////////////// TIMERS \\\\\\\\\\\\\\\\\\\\\\\
export const timerParse = (found, state) => {
    // duplicate/edit parsing
    let alreadyInTimers = state.timers.some(timer => timer.id === found.id)
    if (!alreadyInTimers) {
        debug && console.log('Listing Timer', found)
        state.setTimers(timers => [...timers, found])
    }
    else if (alreadyInTimers && found.edited && found.edited.length > 0) {
        debug && console.log('Updating Listed Timer', found)
        state.setTimers(timers => timers.map(timer => {
            if (timer.id === found.id) {
                debug && console.log('Updating Timer', timer)
                timer = found
            }
            return timer
        }))
    }
    else if (alreadyInTimers && found.status === 'deleted' || 'moved') {
        debug && console.log('Updating Removed Timer', found)
        state.setTimers(timers => timers.filter(timer => timer.id === found.id))
    }
    else {
        debug && console.log(' Found Timer with No Changes', found)
    }
    // status parsing
    if (found.status === 'running') {
        state.running.current = found
    }
    else if (found.status === 'done' && found.id === state.running.current.id) {
        debug && console.log('[react] Setting last run Timer.')
        debug && console.log(found)
        state.running.current = found
    }

}

export const timersHandler = (event, state) => {
    if (!event) return
    debug && console.log('[react] msg timers get.')
    let item = parse(event)
    debug && console.log('timers get ' + typeof item + ' ', item)
    if (Array.isArray(item)) {
        item.map(found => {
            if (found.type === 'timer') {
                timerParse(parse(found), state)
            }
        })
    }
    else if (!Array.isArray(item) && typeof item === 'object') {
        debug && console.log('timers get ' + typeof item + ' ', item)
        let id; for (id in item) {
            let found = parse(item[id])
            if (found.type === 'timer') {
                timerParse(parse(found), state)
            }
        }
    }
}

export const timerHandler = (event, state) => {
    if (!event) return
    debug && console.log('[react] msg timer get.')
    let item = parse(event)
    debug && console.log('timer get ' + typeof item + ' ', item)
    if (item.type === 'timer') {
        state.setTimer(item)
    }
}
export const timerForEditHandler = (event, state) => {
    if (!event) return
    debug && console.log('[react] msg timer get.')
    let item = parse(event)
    debug && console.log('timer get ' + typeof item + ' ', item)
    if (item.type === 'timer') {
        state.setStarted(new Date(item.started))
        state.setEnded(new Date(item.ended))
        state.setMood(item.mood)
        state.setEnergy(item.energy)
        state.setTotal(item.total === 0 ? totalTime(state.started, state.ended) : item.total)
        state.setTimer(item)
    }
}



export const timersDeletedHandler = (event, state) => {
    if (!event) return
    let item = parse(event)
    debug && console.log('get deleted timers ' + typeof item + ' ', item)
    if (typeof item === 'object') {
        let id; for (id in item) {
            try {
                let found = parse(item[id])
                if (found.type === 'timer' && found.status === 'deleted') {
                    let alreadyInTimers = state.timers.some(timer => timer.id === found.id)
                    if (!alreadyInTimers) {
                        state.setTimers(timers => [...timers, found])
                    }
                }
            } catch (error) {
                console.log(error)
            }

        }
    }
}

export const timerDatesHandler = (event, state) => {
    if (!event) return
    let item = parse(event)
    debug && console.log('get dates ' + typeof item, item)
    if (item && typeof item === 'object') {
        let found = Object.keys(item)
        debug && console.log('found dates: ', found)
        state.setDays(found)
    }
}

export const timersForDateHandler = (event, state) => {
    if (!event) return
    debug && console.log('[react] msg timers get.')
    let item = parse(event)
    debug && console.log('timers get ' + typeof item, item)
    if (typeof item === 'object') {
        let section = { title: state.day, data: [] }
        // let filtered = state.timers.filter(timer => timer.title === section.title ? true : false)
        // state.setTimers(filtered)
        let id; for (id in item) {
            let found = parse(item[id])
            debug && console.log('timers get ' + typeof found + ' ', found)
            if (found.type === 'timer') {
                // duplicate/edit check
                let alreadyInSection = section.data.some(timer => timer.id === found.id)
                if (!alreadyInSection && found.status === 'done') {
                    debug && console.log('Listing Timer', found)
                    section.data.push(found)
                }
                // running check
                else if (found.status === 'running') {
                    state.running.current = found
                }
                else if (found.status === 'done' && found.id === state.running.current.id) {
                    debug && console.log('[react] Setting last run Timer.')
                    debug && console.log(found)
                    state.running.current = found
                }

            }
        }
        let alreadyInTimers = state.timers.some(timer => timer.title === section.title)
        if (!alreadyInTimers) {
            state.setTimers(timers => [...timers, section])
        }
    }
}

/////////////////// PROJECTS\\\\\\\\\\\\\\\\\\\\\\\
export const projectParse = (found, state) => {
    try {
        if (found.type === 'project' && found.status !== 'deleted') {
            let alreadyInProjects = state.projects.some(project => project.id === found.id)
            if (!alreadyInProjects) {
                state.setProjects(projects => [...projects, found])
            }
            if (state.running.current.project && found.id === state.running.current.project) {
                state.running.current.color = found.color
                state.running.current.name = found.name
            }

        }
    } catch (error) {
        console.log(error)
    }
}

/**
 * 
 * @param {*} event 
 * @param {*} state 
 * @param {*} state.project
 * @param {*} state.setProject
 */
export const projectHandler = (event, state) => {
    if (!event) return
    let item = parse(event)
    debug && console.log('project get ' + typeof item + ' ', item)
    if (typeof item === 'object') {
        let found = parse(item)
        state.setProject(found)
        // state.project.current = found

    }
    debug && console.log(typeof state.project.current, state.project.current)

}

export const lastProjectHandler = (projects, state) => {
    if (typeof projects === 'object') {
        let keys = Object.keys(projects)
        const lastKey = keys[keys.length - 1]
        if (lastKey === '_') return false // TODO: keep walking up tree?
        let found = parse(projects[lastKey])
        debug && console.log('Project Key ', lastKey)
        debug && console.log('Project Found', found)
        if (found && found.type === 'project' && found.status !== 'deleted') {
            state.setProjects(projects => [...projects, found])
        }
    }
}

export const projectsHandler = (event, state) => {
    if (!event) return
    let item = parse(event)
    // let item = {test: {id: 'test', type: 'project'}}
    debug && console.log('projects get ' + typeof event + ' ', event)
    if (typeof item === 'object') {
        debug && console.log(`item ${typeof item}`, item)
        let id; for (id in item) {
            debug && console.log(`item ${typeof id}`, id)
            try {
                let found = parse(item[id])
                debug && console.log(`item ${typeof found}`, found)
                projectParse(found, state)
            } catch (error) {
                console.log(error)
            }

        }
    }

}

export const projectsDeletedHandler = (event, state) => {
    if (!event) return
    let item = parse(event)
    debug && console.log('get deleted projects ' + typeof item + ' ', item)
    if (typeof item === 'object') {
        let id; for (id in item) {
            try {
                let found = parse(item[id])
                if (found.type === 'project' && found.status === 'deleted') {
                    let alreadyInProjects = state.projects.some(project => project.id === found.id)
                    if (!alreadyInProjects) {
                        state.setProjects(projects => [...projects, found])
                    }
                }
            } catch (error) {
                console.log(error)
            }

        }
    }
}

////////////////////// HISTORY \\\\\\\\\\\\\\\\\\\\\\\

/**
 * 
 * @param {*} event 
 * @param {*} state 
 */
export const timerHistoryHandler = (event, state) => {
    if (!event) return
    debug && console.log('[react] successful timer history get.')
    let item = parse(event)
    // debug && console.log('history ' + typeof item + ' ', item)
    if (typeof item === 'object') {
        let id; for (id in item) {
            try {
                let found = parse(item[id])
                if (found.type === 'timer') {
                    found.key = found.edited.length > 0 ? found.id + '_' + found.edited : found.id + '_' + found.status
                    let alreadyInProjects = state.timerHistory.some(timer => timer.key === found.key)
                    if (!alreadyInProjects) {
                        state.setTimerHistory(timers => [...timers, found])
                    }
                }
            } catch (error) {
                console.log(error)
            }

        }
    }
}


/**
 * 
 * @param {*} event 
 * @param {*} state 
 * @param {*} state.edits 
 * @param {*} state.setEdits
 */
export const projectHistoryHandler = (event, state) => {
    if (!event) return
    debug && console.log('[react] successful project history get.')
    let item = parse(event)
    // debug && console.log('history ' + typeof item + ' ', item)
    if (typeof item === 'object') {
        let id; for (id in item) {
            try {
                let found = parse(item[id])
                if (found.type === 'project') {
                    found.key = found.edited.length > 0 ? found.id + '_' + found.edited : found.id + '_' + found.status
                    let alreadyInProjects = state.edits.some(project => project.key === found.key)
                    if (!alreadyInProjects) {
                        state.setEdits(projects => [...projects, found])
                    }
                }
            } catch (error) {
                console.log(error)
            }

        }
    }
}

