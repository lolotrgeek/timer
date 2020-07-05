import { totalTime, simpleDate, sumProjectTimers, nextDay, parse, trimSoul } from '../constants/Functions'
import * as Data from '../data/Data'
import * as store from '../data/Store'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'

// TODO: page position retained after navigation
// TODO: test remote updating
// TODO: fix replicated sections at beginning of new page

let debug = false
let pages = []
let pagesize = 5 // number of timers per `page`
let days = [] // set of days containing timers
let currentday = 0 // last day where timers were retrieved
let page = [] // set of timers sectioned by day
let running = { id: 'none', name: 'none', project: 'none' }
let currentPage = 1
let pagelocation = {x: 0, y: 0}

const daylistHandler = (event) => {
    if (!event) return
    let item = parse(event)
    debug && console.log('get dates ' + typeof item, item)
    if (item && typeof item === 'object') {
        let found = Object.keys(item)
        debug && console.log('found dates: ', found)
        days = found.sort((a, b) => new Date(b) - new Date(a))
        debug && console.log(days)
        // days.forEach(day => messenger.addListener(chain.timersInDay(day), event => timersInDayHandler(event, { day })))
    }
}

// request days with timers
messenger.on(chain.timerDates(), event => daylistHandler(event))
store.getAllOnce(chain.timerDates())

messenger.on("pagelocation", msg => {
    if(msg) {
        pagelocation.x = msg.x
        pagelocation.y = msg.y
        console.log(pagelocation.y)
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

messenger.on("getPages", msg => {
    if (msg) {
        pagesize = msg.pagesize

        console.log('getPages received')
        console.log(msg.current)
        if (msg.current) {
            if (msg.current.length === 0) {
                if (pages && pages.length === 0) {
                    currentday = 0
                    debug && console.log('getting pages.')
                    getPage()
                } else {
                    debug && console.log('updating pages.')
                    messenger.emit("pages", pages)
                    console.log('locating...', pagelocation.y)
                    messenger.emit('location', pagelocation)
                }
            }
            else {
                currentday = msg.current.length
                debug && console.log('getting pages.')
                getPage()
            }
        }
    }
})


const getPage = () => {
    // app reports page size, this gets number of timers until page size is full, sends as `page`
    let day = days[currentday]
    debug && console.log(`day: ${currentday}/${days.length} [${day}], timer: ${page.length}/${pagesize} `)

    if (currentday >= days.length) {
        debug && console.log('No more days with pages.')
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



const timersInDayHandler = (day) => {
    getDayTimers(day).then(event => {
        debug && console.log('[react] msg timers get.')
        let item = parse(event)
        if (typeof item === 'object') {
            let section = { title: day, data: [] }
            let id; for (id in item) {
                let found = parse(item[id])
                if (found.type === 'timer') {
                    parseDayTimers(found, section)
                }
            }
        }
    })
}

const parseDayTimers = (found, section) => {
    debug && console.log('timers get ' + typeof found + ' ', found)
    getProject(found.project).then(project => {
        debug && console.log('Found project', project)
        found.color = project.color
        found.name = project.name
        // duplicate/edit check
        let data = section.data
        let alreadyInSection = data.some(timer => timer.id === found.id)
        if (!alreadyInSection && found.status === 'done') {
            addSection({ title: section.title, data: sortDayTimers(found, data) })
        }
        // running check
        else if (found.status === 'running') {
            running = found
        }
        else if (found.status === 'done' && found.id === running.id) {
            debug && console.log('[react] Setting last run Timer.')
            debug && console.log(found)
            running = found
        }
    })
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
    } else {
        let reducedTimer = {
            project: found.project,
            name: found.name,
            color: found.color,
            total: total,
            timers: [found.id],
            totals: [total],
            status: found.status
        }
        debug && console.log('Listing ', reducedTimer)
        data.push(reducedTimer)
        return data
    }

}

const addSection = (section) => {
    let alreadyInTimers = page.some(entry => entry.title === section.title)
    //TODO: optimize, sometimes adding a random timer at beginning of new page... we filter that out here
    if (!alreadyInTimers && section.data.length > 0 && days[currentday] === section.title) {
        debug && console.log(currentday, days[currentday], section.title)
        debug && console.log(section)
        page.push(section)
        currentday++
        getPage()
    }
}

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
            console.log(error)
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