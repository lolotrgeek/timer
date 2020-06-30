import { totalTime, simpleDate, sumProjectTimers, nextDay, parse } from '../constants/Functions'
import * as Data from '../data/Data'
import * as store from '../data/Store'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'

let debug = true
let pagesize = 5 // number of timers per `page`
let days = [] // set of days containing timers
let currentday = 0 // last day where timers were retrieved
let timers = [] // set of timers sectioned by day
let retrievedtimers = 0 // total number of timers retrieved
let running = { id: 'none', name: 'none', project: 'none' }

// input pagesize && current day 
// get days until page is filled

// listen for a list of days
messenger.on(chain.timerDates(), event => daylistHandler(event))
// listen for state change requests
messenger.on("timeline", msg => {
    if (msg) {
        pagesize = msg.pagesize
        currentday = msg.currentday
        store.getAllOnce(chain.timerDates())
        timelineState()
    }
})

const timelineState = () => {
    // app reports page size, this gets number of timers until page size is full, sends as `page`

    // get timers for day
    console.log('days ', days)
    retrievedtimers = 0
    // keep getting days with timers until retrievedtimers is greater than or equal to pagesize or there are no more timers to get
    while (retrievedtimers < pagesize) {
        console.log('days ', days)
        if (retrievedtimers >= pagesize) break;
        else if (currentday >= days.length) break;
        let day = days[currentday]
        console.log('current day: ', currentday, day)
        store.getAllOnce(chain.timerDays(day))
        currentday = currentday + 1
    }
    messenger.emit('daytimers', timers)
}

const done = () => {
    days.forEach(day => messenger.removeAllListeners(chain.timerDays(day)))
}

const timersForDateHandler = (event, state) => {
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
                // update name/color
                findProject(found.project).then(project => {
                    found.color = project.color
                    found.name = project.name
                    // duplicate/edit check
                    let alreadyInSection = section.data.some(timer => timer.id === found.id)
                    if (!alreadyInSection && found.status === 'done') {
                        console.log('Listing Timer', found)
                        retrievedtimers = retrievedtimers + 1
                        section.data.push(found)
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
        }
        let alreadyInTimers = timers.some(timer => timer.title === section.title)
        if (!alreadyInTimers) {
            timers = [...timers, section]
        }
    }
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

const daylistHandler = (event) => {
    if (!event) return
    let item = parse(event)
    debug && console.log('get dates ' + typeof item, item)
    if (item && typeof item === 'object') {
        let found = Object.keys(item)
        debug && console.log('found dates: ', found)
        days = found.sort((a, b) => new Date(b) - new Date(a))
        days.forEach(day => messenger.addListener(chain.timerDays(day), event => timersForDateHandler(event, { day })))
    }
}