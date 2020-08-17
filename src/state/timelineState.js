import { totalTime, parse, trimSoul, isRunning } from '../constants/Functions'
import * as store from '../data/Store'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'

let debug = {
    data: false,
    listening: false,
    parsing: false,
    sorting: false
}

let
    all = false, // a toggle for dumping entire set of pages
    pages = [],
    pagesize = 5, // number of timers per `page`
    days = [], // set of days containing timers
    currentday = 0, // last day where timers were retrieved
    page = [], // set of timers sectioned by day
    currentPage = 1,
    pagelocation = { x: 0, y: 0 }


// LISTENERS
messenger.on('initial', msg => {
    console.log('initial')
    getTimerDates().then(event => {
        let item = parse(event)
        if (item && typeof item === 'object') {
            let timerdays = Object.keys(item)
            days = timerdays.sort((a, b) => new Date(b) - new Date(a))
            debug.listeners && console.log('found dates: ', days)
        }
    })
})
messenger.on("pagelocation", msg => {
    if (msg) {
        pagelocation.x = msg.x
        pagelocation.y = msg.y
        debug.listeners && console.log(pagelocation.y)
    }
})
messenger.on("getPage", msg => getPage(msg))


/**
 * parses msg and sets the page to get
 * @param {*} msg 
 * @param {*} msg.pagesize nubmer of sections per page
 * @param {boolean} msg.all get all found pages 
 * @param {*} msg.refresh rebuild pages
 * @param {*} msg.currentday 
 */
const getPage = (msg) => {
    if (msg) {
        pagesize = msg.pagesize
        debug.listeners && console.log('getPage received', msg)
        if (msg.currentday === 0) {
            if (msg.all) {
                all = msg.all
            }
            if (msg.refresh) {
                currentday = 0
                debug.listeners && console.log('refreshing pages.')
                createPage()
            }
            else if (pages && pages.length === 0) {
                currentday = 0
                debug.listeners && console.log('getting pages.')
                createPage()
            } else {
                debug.listeners && console.log('updating pages.')
                messenger.emit("pages", pages)
                debug.listeners && console.log('locating...', pagelocation.y)
                messenger.emit('location', pagelocation)
            }
        }
        else if (msg.currentday > 0) {
            if (msg.currentday > currentday) {
                currentday = msg.currentday
            } else {
                currentday = currentday + 1
            }
            debug.listeners && console.log('adding pages.')
            createPage()
        }
    }
}

// STATE

/**
 * populate an array of sections
 *  
 * page
 * `[{title: 'dd-mm-yyyy', data: [{timer}, {timer}, ...]}, ...]`
 * 
 */
const createPage = () => {
    let day = days[currentday]
    debug.state && console.log(`day: ${currentday}/${days.length} [${day}], timer: ${page.length}/${pagesize} `)
    if (currentday >= days.length) {
        debug.state && console.log('No more days with full pages.')
        if (page.length > 0) {
            debug.state && console.log('Last Page ' + currentPage + ' Complete.')
            setPage()
        }
        return
    }
    else if (day && page.length >= pagesize) {
        debug.state && console.log('Page ' + currentPage + ' Complete.')
        setPage()
    }
    else if (day) {
        debug.state && console.log('Create Page.')
        getTimersInDay(day)

    } else {
        return
    }

}

/**
 * add page to pages
 */
const setPage = () => {
    messenger.emit('ready', {ready: true})
    messenger.emit('page', page)
    pages.push(page)
    page = []
    currentPage++
}

const addSection = (section) => {
    let alreadyInTimers = page.some(entry => entry.title === section.title)
    //TODO: optimize, sometimes adding a random timer at beginning of new page... we filter that out here
    if (!alreadyInTimers && days[currentday] === section.title) {
        debug.state && console.log('Adding Section: ', section)
        if (section.data.length > 0) {
            page.push(section)
        }
        currentday++
        createPage()
    }
}

/**
 * get timer entries for the `day`
 * @param {string} day simpledate `dd-mm-yyyy`
 */
const getTimersInDay = day => {
    getDayTimers(day).then(event => {
        debug.state && console.log('[react] msg timers get.')
        let item = parse(event)
        if (item && typeof item === 'object') parseDayTimers(item, day)
    })
}

// PARSING

/**
 * 
 * @param {*} daytimers 
 * @param {*} day 
 */
const parseDayTimers = (daytimers, day) => {
    let section = { title: day, data: [] }
    let id; for (id in daytimers) {
        let found = parse(daytimers[id])
        debug.parsing && console.log('timers get ' + typeof found + ' ', found)
        if (found && found.type === 'timer') {
            if (found.status === 'deleted') {
                debug.parsing && console.log('deleted')
                addSection(section)
            }
            else if (found.status === 'done') {
                // OPTIMIZE: only check today, not every timer
                if (isRunning(found)) {
                    // don't show timers from a project that has a running timer
                    addSection(section)
                } else {
                    getProject(found.project).then(project => parseProject(project, found, section))
                }
            }
        }
    }
}

const parseProject = (project, found, section) => {
    if (project.status === 'active') {
        debug.parsing && console.log('Found project', project)
        found.color = project.color
        found.name = project.name
        // duplicate/edit check
        let data = section.data
        let alreadyInSection = data.some(timer => timer.id === found.id)
        if (!alreadyInSection && found.status === 'done') {
            addSection({ title: section.title, data: sortDayTimers(found, data) })
        }
        else if (found.status === 'running') {
            // TODO: don't show running projects
        }
    }
    else {
        debug.parsing && console.log('project inactive')
        let data = section.data
        found.status = 'deleted'
        addSection({ title: section.title, data: sortDayTimers(found, data) })
    }
}

// SORTING

const sortDayTimers = (found, data) => {
    debug.sorting && console.log('Found Timer', found)
    let total = totalTime(found.started, found.ended)
    let match = data.find(entry => entry.project === found.project)
    if (match) {
        debug.sorting && console.log('Matched Timer', match)
        let filteredData = data.filter(entry => entry.project === match.project)
        debug.sorting && console.log('Filtered ', filteredData)
        match.total = match.total + total
        match.timers = [...match.timers, found.id]
        match.totals.push(total)
        filteredData.push(match)
        return filteredData
    } else if (found.status === 'done') {
        let reducedDayTimer = {
            project: found.project,
            name: found.name,
            color: found.color,
            total: total,
            timers: [found.id],
            totals: [total],
            status: found.status
        }
        debug.sorting && console.log('Listing ', reducedDayTimer)
        data.push(reducedDayTimer)
        return data
    } else {
        let inactiveDayTimer = {
            project: found.project,
            name: found.name,
            color: found.color,
            total: 0,
            timers: [],
            totals: [],
            status: found.status
        }
        debug.sorting && console.log('Inactive ', inactiveDayTimer)
        return data
    }
}


// DATA
const getTimerDates = () => new Promise((resolve, reject) => {
    let result = {}
    try {
        store.chainer(chain.timerDates(), store.app).map().on((data, key) => {
            if (!data) {
                debug.data && console.log('[GUN node] getTimerDates No Data Found',)
            }
            let foundData = trimSoul(data)
            result[key] = foundData
            debug.data && console.log('[GUN node] getTimerDates Data Found: ', typeof foundData, foundData)
        })
        resolve(result)
    } catch (error) {
        debug.data && console.log(error)
        reject(error)
    }
})

const getProject = (projectId) => new Promise((resolve, reject) => {
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
        debug.data && console.log(error)
        reject(error)
    }
})


/**
* 
* @param {string} day simpledate `dd-mm-yyyy` 
*/
const getDayTimers = (day) => new Promise((resolve, reject) => {
    try {
        let result = {}
        store.chainer(chain.timersInDay(day), store.app).map().on((data, key) => {
            if (!data) {
                debug.data && console.log('[GUN node] getDayTimers No Data Found',)
            }
            let foundData = trimSoul(data)
            result[key] = foundData
            debug.data && console.log('[GUN node] getDayTimers Data Found: ', typeof foundData, foundData)
        })
        resolve(result)
    } catch (err) {
        reject(err)
    }

})
