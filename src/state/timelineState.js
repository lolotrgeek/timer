import { totalTime, simpleDate, sumProjectTimers, nextDay, parse } from '../constants/Functions'
import * as Data from '../data/Data'
import * as store from '../data/Store'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'

let debug = true
let pagesize = 50 // number of timers to get
let days = []
let currentday = 0
let timers = []
let timercount = 0
let running = { id: 'none', name: 'none', project: 'none' }

const timelineState = () => {
    // app reports page size, this gets number of timers until page size is full, sends as `page`

    // get timers for day
    console.log('days ', days)

    // keep getting days with timers until timercount is greater than or equal to pagesize or there are no more timers to get
    while (timercount < pagesize) {
        console.log('days ', days)
        if (timercount >= pagesize) break;
        else if (currentday === days.length) break;
        let day = days[currentday]
        console.log('current day: ', currentday, day)
        Data.getTimersForDate(day)
        currentday = currentday + 1
    }
    messenger.emit('daytimers', timers)
}

const done = () => {
    days.forEach(day => messenger.removeAllListeners(chain.timerDays(day)))
}
// listen for a list of days
messenger.on(chain.timerDates(), event => daylistHandler(event))
messenger.on("timeline", msg => {
    if (msg) {
        store.getAllOnce(chain.timerDates())
        timelineState()
    }
})

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
                // duplicate/edit check
                let alreadyInSection = section.data.some(timer => timer.id === found.id)
                if (!alreadyInSection && found.status === 'done') {
                    console.log('Listing Timer', found)
                    timercount = timercount + 1
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

            }
        }
        let alreadyInTimers = timers.some(timer => timer.title === section.title)
        if (!alreadyInTimers) {
            timers = [...timers, section]
        }
    }
}


const daylistHandler = (event) => {
    if (!event) return
    let item = parse(event)
    debug && console.log('get dates ' + typeof item, item)
    if (item && typeof item === 'object') {
        let found = Object.keys(item)
        debug && console.log('found dates: ', found)
        days = found
        days.forEach(day => messenger.addListener(chain.timerDays(day), event => timersForDateHandler(event, { day })))
    }
}