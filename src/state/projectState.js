import { totalTime, parse, trimSoul } from '../constants/Functions'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import * as store from '../data/Store'


// TODO: test remote updating
// TODO: needs refactoring

let debug = false
let projectState = {}
let current = {} // current project in view state
let running = { id: 'none', name: 'none', project: 'none' }
let days = [] // set of days containing timers

//////////////STATE
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

const sortDaylist = (event) => {
    if (!event) return
    let item = parse(event)
    debug && console.log('get dates ' + typeof item, item)
    if (item && typeof item === 'object') {
        let found = Object.keys(item)
        debug && console.log('found dates: ', found)
        days = found.sort((a, b) => new Date(b) - new Date(a))
        // days.forEach(day => messenger.addListener(chain.timersInDay(day), event => timersInDayHandler(event, { day })))
    }
}

////////////// LISTENING
messenger.on('getProjectPages', msg => getProjectPage(msg))
messenger.on(chain.timerDates(), event => sortDaylist(event))
messenger.on('getDayTimers', event => getDayTimers().then(daytimers => {
    messenger.emit('dayTimers', daytimers)
}))
////////////// REQUESTING
store.getAllOnce(chain.timerDates())

//////////////SORTING

const getProjectPage = msg => {
    if (msg && msg.projectId) {
        debug && console.log('getProjectPages received')
        setCurrentProject(msg)
        listenForPageLocation(projectState[msg.projectId])
    }
}
const listenForPageLocation = current => {
    messenger.on(`${current.project.id}/pagelocation`, msg => {
        if (msg) {
            current.pagelocation.x = msg.x
            current.pagelocation.y = msg.y
            console.log(current.pagelocation.y)
        }
    })
}
const setCurrentProject = (msg) => {
    setCurrent(msg.projectId)
    setState('pagesize', msg.pagesize)
    if (!current.project.name || current.project.id === 'none') {
        getProject(current.project.id).then(foundproject => {
            current.project = foundproject
            console.log('Project: ', current.project)
            messenger.emit(`${current.project.id}/project`, current.project)
            handleProjectPages(msg)
        })
    } else {
        handleProjectPages(msg)
    }

}

const handleProjectPages = msg => {
    if (msg.currentday === 0) {
        if (current.pages && current.pages.length === 0) {
            setState('currentday', 0)
            debug && console.log('getting pages.')
            getPage(0)
        } else {
            debug && console.log('updating pages.')
            messenger.emit(`${current.project.id}/pages`, current.pages)
            debug && console.log('locating...', current.pagelocation.y)
            messenger.emit(`${current.project.id}/lastpagelocation`, current.pagelocation)
        }
    }
    else if (msg.currentday > 0) {
        debug && console.log('getting pages.')
        // update state if page has last retrieved day, otherwise use current state
        if (msg.currentday > current.currentday) {
            setState('currentday', msg.currentday)
        } else {
            setState('currentday', current.currentday + 1)
        }
        getPage(current.currentday)
    }

}

const getPage = (currentday) => {
    // app reports page size, this gets number of timers until page size is full, sends as `page`
    // TODO: needs a last page function to handle when last page might not be full
    let day = days[currentday]
    console.log(`day: ${currentday}/${days.length} [${day}], 
    timer: ${current.page.length}/${current.pagesize} `)

    if (currentday >= days.length) {
        debug && console.log('No more days with full pages.')
        if (current.page.length > 0) {
            completePage()
            debug && console.log('Last Page ' + current.currentPage + ' Complete.')
        }
        return
    }
    else if (current.page.length >= current.pagesize) {
        completePage()
        debug && console.log('Page ' + current.currentPage + ' Complete.')
        current.currentPage++
    }
    else {
        debug && console.log('Getting Timers for Page.', current.page)
        timersInDayHandler(day)
    }
}
const completePage = () => {
    messenger.emit(`${current.project.id}/page`, current.page)
    current.pages.push(current.page)
    current.page = []
}

const timersInDayHandler = (day) => {
    getDayTimers(day).then(event => {
        debug && console.log('[react] msg timers get: ', event)
        let item = parse(event)
        // console.log(day, item)
        if (typeof item === 'object') parseDayTimers(item, day)
    })
}

const validDayTimer = daytimer => daytimer && daytimer.type === 'timer' && daytimer.project === current.project.id

const parseDayTimers = (daytimers, day) => {
    let section = { title: day, data: [] }
    let id; for (id in daytimers) {
        let daytimer = parse(daytimers[id])
        daytimer.key = id
        debug && console.log('DayTimer: ', daytimer)
        if (validDayTimer(daytimer)) {
            // console.log(daytimer)
            dayTimer(daytimer, section, current.project)
        }
        else noTimersinDay()
    }
}
const dayTimer = (daytimer, section) => {
    debug && console.log('timers get ' + typeof daytimer + ' ', daytimer)
    let data = section.data
    if (notInSection(data, daytimer)) {
        console.log(daytimer)
        debug && console.log('New DayTimer...')
        addSection({ title: section.title, data: sortDayTimers(daytimer, data) })
    }
    else isRunning(daytimer)

}

const noTimersinDay = () => {
    debug && console.log('no timers in day, try next...')
    current.currentday++
    getPage(current.currentday)
    debug && console.log(projectState)
}

const isRunning = timer => {
    if (timer.status === 'running' || timer.id === running.id) running = timer
}

const notInSection = (section, daytimer) => {
    let alreadyInSection = section.some(timer => timer.id === daytimer.id)
    if (!alreadyInSection && daytimer.status === 'done') return true
    else return false
}

const sortDayTimers = (found, data) => {
    found.total = totalTime(found.started, found.ended)
    let newdata = data
    newdata.push(found)
    return newdata
}

const addSection = (section) => {
    let alreadyInTimers = current.page.some(entry => entry.title === section.title)
    //TODO: optimize, sometimes adding a random timer at beginning of new page... we filter that out here
    console.log(section)
    if (!alreadyInTimers && section.data.length > 0) {
        // debug && console.debug && console.log(currentday, days[currentday], section.title)
        current.page.push(section)
        current.currentday++
        getPage(current.currentday)
    }
}


// // Eventually put these in a stateData decoupling with messengers \\\
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

/**
* 
* @param {*} day 
*/
const getDayTimers = (day) => {
    return new Promise((resolve, reject) => {
        try {
            let result = {}
            store.chainer(chain.timersInDay(day), store.app).map().on((data, key) => {
                if (!data) {
                    // debug && console.log('[GUN node] getAllOnce No Data Found',)
                }
                let foundData = trimSoul(data)
                result[key] = foundData
                // debug && console.log('[GUN] getAllOnce Data Found: ', typeof foundData, foundData)
            })
            resolve(result)
        } catch (err) {
            reject(err)
        }

    })
}