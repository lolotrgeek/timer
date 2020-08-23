/* eslint-disable no-unused-vars */
const { totalTime, parse, trimSoul, isRunning, dayHeaders, dateRules, dateSimple } = require('../src/Functions')
const store = require('../src/Store')
const messenger = require('../src/Messenger')
const chain = require('../src/Chains')

let debug = {
    state: false,
    data: false,
    listeners: false,
    parsing: false,
    sorting: false
}

let projectState = {}
let current = {} // current project in view state

const newProjectState = (projectId) => ({
    pages: [],
    pagesize: 5, // number of timers per `page`
    currentday: 0, // last day where timers were retrieved
    page: [], // set of timers sectioned by day
    currentPage: 1,
    pagelocation: { x: 0, y: 0 },
    project: { id: projectId ? projectId : 'none' }
})
const setCurrent = (projectId) => {
    if (!projectState[projectId]) {
        projectState[projectId] = newProjectState(projectId)
    }
    current = projectState[projectId]
}
const setState = (key, value) => current[key] = value

// LISTENERS
messenger.on('getProjectPages', msg => {
    if (msg && msg.projectId) {
        debug && console.log('getProjectPages received')
        setCurrentProject(msg)
        listenForPageLocation(projectState[msg.projectId])
    }
})

const listenForPageLocation = current => {
    messenger.removeAllListeners(`${current.project.id}/pagelocation`) // pre-clean, might be redundant?
    messenger.on(`${current.project.id}/pagelocation`, msg => {
        if (msg) {
            current.pagelocation.x = msg.x
            current.pagelocation.y = msg.y
            debug.listeners && console.log(current.pagelocation.y)
        }
    })
}

const setCurrentProject = (msg) => {
    setCurrent(msg.projectId)
    setState('pagesize', msg.pagesize)
    if (!current.project.name || current.project.id === 'none') {
        getProject(current.project.id).then(foundproject => {
            current.project = foundproject
            debug && console.log('Project: ', current.project)
            messenger.emit(`${current.project.id}/project`, current.project)
            getTimersInProject()
        })
    } else {
        getTimersInProject()
    }
}

// PARSING
/**
 * Gets all timers in project, sorts them into sections/pages and emits
 * OPTIMIZE: lazy loading. 
 */
const getTimersInProject = async () => {
    try {
        let event = await getProjectTimers(current.project.id)
        let sorted = dayHeaders(event).sort((a, b) => new Date(b.title) - new Date(a.title))
        current.pages = sorted
        debug && console.log('[Parsing] daytimers', sorted)
        if (sorted && typeof sorted === 'object') {
            // await addSection(sorted) // would have to find day first...
            messenger.emit(`${current.project.id}/pages`, current.pages)
        }
    } catch (error) {
        console.log(error)
    }
}


// DATA
const getProject = (projectId) => {
    return new Promise((resolve, reject) => {
        if (!projectId) reject('no projectId passed')
        try {
            store.chainer(chain.project(projectId), store.app).once((data, key) => {
                const foundData = trimSoul(data)
                  debug.data && console.log('[GUN node] getProject Data Found: ', foundData)
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


/**
* 
* @param {string} projectId 
*/
const getProjectTimers = (projectId) => {
    return new Promise((resolve, reject) => {
        try {
            let result = []
            store.chainer(`project/${projectId}/timers`, store.app).map().on((data, key) => {
            // store.chainer(chain.projectTimers(projectId), store.app).map().on((data, key) => {
                if (!data) {
                    debug.data && console.log('[GUN node] getProjectTimers No Data Found')
                }
                let foundData = trimSoul(data)
                debug.data && console.log('[GUN node] getProjectTimers Data Found: ', key, data)
                if (foundData.project === projectId && foundData.status !== 'deleted') {
                    result.push(foundData)
                }
            })
            resolve(result)
        } catch (err) {
            reject(err)
        }

    })
}