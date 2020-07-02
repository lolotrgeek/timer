import { totalTime, simpleDate, sumProjectTimers, nextDay, parse, trimSoul } from '../constants/Functions'
import * as Data from '../data/Data'
import * as store from '../data/Store'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'

let debug = false
let pagesize = 5 // number of timers per `page`
let days = [] // set of days containing timers
let currentday = 0 // last day where timers were retrieved
let page = [] // set of timers sectioned by day
let running = { id: 'none', name: 'none', project: 'none' }
let currentPage = 1

const daylistHandler = (event) => {
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

// request days with timers
messenger.on(chain.timerDates(), event => daylistHandler(event))
store.getAllOnce(chain.timerDates())


// listen for state change requests
messenger.on("getPage", msg => {
    if (msg) {
        pagesize = msg.pagesize
        console.log('getpage received')
        getPage()
    }
})

const getPage = () => {
    // app reports page size, this gets number of timers until page size is full, sends as `page`
    let day = days[currentday]
    console.log(`day: ${currentday}/${days.length} [${day}], timer: ${page.length}/${pagesize} `)

    if (currentday >= days.length) {
        console.log('No more days with pages.')
        return
    }
    else if (page.length >= pagesize) {
        console.log('Page ' + currentPage +' Complete.')
        messenger.emit('daytimers', page)
        page = []
        currentPage++
    }
    else {
        console.log('Getting Timers for Page.')
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
        let data = [...section.data]
        let alreadyInSection = data.some(timer => timer.id === found.id)
        if (!alreadyInSection && found.status === 'done') {
            data = sortDayTimers(found, data)
            updatePage({title: section.title, data: data})
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
    debug && console.log('Matched Timer', match)
    let reducedTimer
    if (match) {
        data = data.filter(entry => entry.project === match.project)
        debug && console.log('Filtered ', data)
        match.total = match.total + total
        match.timers = [...match.timers, found.id]
        match.totals = [...match.totals, found.total]
        reducedTimer = match
        debug && console.log('Updating ', reducedTimer)
    } else {
        reducedTimer = {
            project: found.project,
            name: found.name,
            color: found.color,
            total: total,
            timers: [found.id],
            totals: [total],
            status: found.status
        }
        debug && console.log('Listing ', reducedTimer)
    }
    data.push(reducedTimer)
    console.log(' resolved section data:', data)
    return data
}

const updatePage = (section) => {
    let alreadyInTimers = page.some(entry => entry.title === section.title)
    if (!alreadyInTimers && section.data.length > 0) {
        page.push(section)
        console.log(section.data)
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