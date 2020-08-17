import { totalTime, dateSimple, sumProjectTimers, nextDay, parse, trimSoul, isRunning, timerRanToday, isToday } from '../constants/Functions'
import * as Data from '../data/Data'
import * as store from '../data/Store'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'

// TODO: page position retained after navigation
// TODO: test remote updating
// TODO: fix replicated sections at beginning of new page

let debug = true
let all = false // a toggle for dumping entire set of pages
let pages = []
let pagesize = 5 // number of timers per `page`
let days = [] // set of days containing timers
let currentday = 0 // last day where timers were retrieved
let page = [] // set of timers sectioned by day
let currentPage = 1
let pagelocation = { x: 0, y: 0 }

// request days with timers
messenger.on(chain.timerDates(), event => {
    if (!event) return
    let item = parse(event)
    if (item && typeof item === 'object') {
        let found = Object.keys(item)
        days = found.sort((a, b) => new Date(b) - new Date(a))
        debug && console.log('found dates: ', days)
        // days.forEach(day => messenger.addListener(chain.timersInDay(day), event => timersInDayHandler(event, { day })))
    }
})
store.getAllOnce(chain.timerDates())


messenger.on("pagelocation", msg => {
    if (msg) {
        pagelocation.x = msg.x
        pagelocation.y = msg.y
        debug && console.log(pagelocation.y)
    }
})

// listen for state change requests
messenger.on("getPage", msg => {
    if (msg) {
        pagesize = msg.pagesize
        debug && console.log('getpage received')
        getPage()
    }
})
messenger.on("getNextPage", msg => getNextPage(msg))

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
        debug && console.log('getPages received', msg)
        if (msg.currentday === 0) {
            if(msg.all) {
                all = msg.all
            }
            if (msg.refresh) {
                currentday = 0
                debug && console.log('refreshing pages.')
                createPage()
            }
            else if (pages && pages.length === 0) {
                currentday = 0
                debug && console.log('getting pages.')
                createPage()
            } else {
                debug && console.log('updating pages.')
                messenger.emit("pages", pages)
                debug && console.log('locating...', pagelocation.y)
                messenger.emit('location', pagelocation)
            }
        }
        else if (msg.currentday > 0) {
            if (msg.currentday > currentday) {
                currentday = msg.currentday
            } else {
                currentday = currentday + 1
            }
            debug && console.log('adding pages.')
            createPage()
        }

    }
}

/**
 * create and populate a page with timers
 * page structure
 * `[]`
 */
const createPage = () => {
    let day = days[currentday]
    debug && console.log(`day: ${currentday}/${days.length} [${day}], timer: ${page.length}/${pagesize} `)
    if (currentday >= days.length) {
        debug && console.log('No more days with full pages.')
        // put any remaining timers into the last page
        if (page.length > 0) {
            debug && console.log('Last Page ' + currentPage + ' Complete.')
            debug && console.log('page', page)
            messenger.emit('page', page)
            pages.push(page)
            if(all) messenger.emit('pages', pages)
            all = false
            page = []
            currentPage++
        }
        return
    }
    else if (page.length >= pagesize) {
        debug && console.log('Page ' + currentPage + ' Complete.')
        messenger.emit('page', page)
        pages.push(page)
        page = []
        currentPage++
    }
    else {
        debug && console.log('Getting Timers for Page.')
        timersInDayHandler(day)

    }
}

/**
 * 
 * @param {string} day simpledate `dd-mm-yyyy`
 */
const timersInDayHandler = day => {
    getDayTimers(day).then(event => {
        debug && console.log('[react] msg timers get.')
        let item = parse(event)
        if (item && typeof item === 'object') parseDayTimers(item, day)

    })
}

/**
 * 
 * @param {*} daytimers 
 * @param {*} day 
 */
const parseDayTimers = (daytimers, day) => {
    let section = { title: day, data: [] }
    let id; for (id in daytimers) {
        let found = parse(daytimers[id])
        debug && console.log(found)
        debug && console.log('timers get ' + typeof found + ' ', found)
        if (found && found.type === 'timer') {
            if (found.status === 'deleted') {
                debug && console.log('deleted')
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
        debug && console.log('Found project', project)
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
        debug && console.log('project inactive')
        let data = section.data
        found.status = 'deleted'
        addSection({ title: section.title, data: sortDayTimers(found, data) })
    }

}

const sortDayTimers = (found, data) => {
    debug && console.log('Found Timer', found)
    let total = totalTime(found.started, found.ended)
    let match = data.find(entry => entry.project === found.project)
    if (match) {
        debug && console.log('Matched Timer', match)
        let filteredData = data.filter(entry => entry.project === match.project)
        debug && console.log('Filtered ', filteredData)
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
        debug && console.log('Listing ', reducedDayTimer)
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
        debug && console.log('Inactive ', inactiveDayTimer)
        // data.push(inactiveDayTimer)
        return data
    }
}

const addSection = (section) => {
    let alreadyInTimers = page.some(entry => entry.title === section.title)
    //TODO: optimize, sometimes adding a random timer at beginning of new page... we filter that out here
    if (!alreadyInTimers && days[currentday] === section.title) {
        debug && console.log(currentday, days[currentday], section.title)
        debug && console.log(section)
        if (section.data.length > 0) {
            page.push(section)
        }
        currentday++
        getPage()
    }
}

// DATA
const getProject = (projectId) => {
    return new Promise((resolve, reject) => {
        if (!projectId) reject('no projectId passed')
        try {
            store.chainer(chain.project(projectId), store.app).once((data, key) => {
                const foundData = trimSoul(data)
                debug && console.log('[GUN node] getProject Data Found: ', foundData)
                if (foundData && foundData.type === 'project') {
                    resolve(foundData)
                }

            })
        } catch (error) {
            debug && console.log(error)
            reject(error)
        }
    })
}

/**
* 
* @param {string} day simpledate `dd-mm-yyyy` 
*/
const getDayTimers = (day) => {
    return new Promise((resolve, reject) => {
        try {
            let result = {}
            store.chainer(chain.timersInDay(day), store.app).map().on((data, key) => {
                if (!data) {
                    debug && console.log('[GUN node] getAllOnce No Data Found',)
                }
                let foundData = trimSoul(data)
                result[key] = foundData
                debug && console.log('[GUN node] getAllOnce Data Found: ', typeof foundData, foundData)
            })
            resolve(result)
        } catch (err) {
            reject(err)
        }

    })
}