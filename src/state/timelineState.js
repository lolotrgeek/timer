import { totalTime, simpleDate, sumProjectTimers, nextDay, parse } from '../constants/Functions'
import * as Data from '../data/Data'
import * as store from '../data/Store'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'

let debug = false
let pagesize = 5 // number of timers per `page`
let days = [] // set of days containing timers
let currentday = 0 // last day where timers were retrieved
let timers = [] // set of timers sectioned by day
let retrievedtimers = 0 // total number of timers retrieved
let running = { id: 'none', name: 'none', project: 'none' }


const daylistHandler = (event) => {
    if (!event) return
    let item = parse(event)
    debug && console.log('get dates ' + typeof item, item)
    if (item && typeof item === 'object') {
        let found = Object.keys(item)
        debug && console.log('found dates: ', found)
        days = found.sort((a, b) => new Date(b) - new Date(a))
        days.forEach(day => messenger.addListener(chain.timersInDay(day), event => timersInDayHandler(event, { day })))
    }
}

// request days with timers and register listeners for each day
messenger.on(chain.timerDates(), event => daylistHandler(event))
store.getAllOnce(chain.timerDates())


// listen for state change requests
messenger.on("getPage", msg => {
    if (msg) {
        pagesize = msg.pagesize
        getPage()
    }
})

const getPage = () => {
    // app reports page size, this gets number of timers until page size is full, sends as `page`

    // get timers for day
    debug && console.log('days ', days)
    retrievedtimers = 0
    // keep getting days with timers until retrievedtimers is greater than or equal to pagesize or there are no more timers to get
    while (retrievedtimers < pagesize) {
        if (retrievedtimers >= pagesize) break;
        else if (currentday >= days.length) break;
        let day = days[currentday]
        debug && console.log('current day: ', currentday, day)
        // console.log(`day: ${day} [${currentday}/${days.length}], page: ${retrievedtimers}/${pagesize} `)
        store.getAllOnce(chain.timersInDay(day))
        currentday = currentday + 1
    }
    console.log('emitting: ' ,timers)
    messenger.emit('daytimers', timers)
}

const done = () => {
    days.forEach(day => messenger.removeAllListeners(chain.timersInDay(day)))
}

const timersInDayHandler = (event, state) => {
    if (!event) return
    debug && console.log('[react] msg timers get.')
    let item = parse(event)
    debug && console.log('timers get ' + typeof item, item)
    if (typeof item === 'object') {
        parseDayTimers(state, item).then(section => {
            let alreadyInTimers = timers.some(timer => timer.title === section.title)
            if (!alreadyInTimers && section.data.length > 0) {
                timers = [...timers, section]
            }
        })
    }
}

const parseDayTimers = (state, item) => {
    return new Promise((resolve, reject) => {
        let section = { title: state.day, data: [] }
        let id; for (id in item) {
            let found = parse(item[id])
            debug && console.log('timers get ' + typeof found + ' ', found)
            if (found.type === 'timer') {
                parseTimer(found, section.data).then(data => {
                    section.data = data
                    console.log(section.data)
                    resolve(section)
                })
            }
        }
        
    })
}

const parseTimer = (found, data) => {
    return new Promise((resolve, reject) => {
        // update name/color
        findProject(found.project).then(project => {
            found.color = project.color
            found.name = project.name
            // duplicate/edit check
            let alreadyInSection = data.some(timer => timer.id === found.id)
            if (!alreadyInSection && found.status === 'done') {
                let total = totalTime(found.started, found.ended)
                let match = data.find(entry => entry.project === found.project)
                let reducedTimer
                if(match) {
                    data = data.filter(entry => entry.project === match.project)
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
                retrievedtimers = retrievedtimers + 1
                data.push(reducedTimer)
                resolve(data)
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
    })
}

const findProject = projectId => new Promise((resolve, reject) => {
    if (!projectId) {
        debug && console.log('no id')
        reject(projectId)
    } else {
        Data.getProject(projectId)
        messenger.on(chain.project(projectId), msg => {
            let found = parse(msg)
            if (found && found.type === 'project') {
                resolve(found)
            }
        })
    }
})
