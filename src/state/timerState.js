
import { addMinutes, isValid, sub, add, getMonth, getYear, getHours, getMinutes, getSeconds, getDate } from 'date-fns'
import { timeRules, dateRules, totalTime, trimSoul, isRunning, dateSimple, settingCount, sameDay } from '../constants/Functions'
import messenger from '../constants/Messenger'
import * as Data from '../data/Data'
import * as chain from '../data/Chains'
import * as store from '../data/Store'


let debug = true
// STATE
let timerState = {}
let previous = {}
let current = {}
let project = {}

const setAlert = alert => console.log(alert)
const setTimer = object => current.timer = object
const setEnded = date => current.ended = isValid(date) ? typeof date === 'string' ? date : date.toString() : current.ended
const setStarted = date => current.started = isValid(date) ? typeof date === 'string' ? date : date.toString() : current.started
const setEnergy = number => current.energy = number
const setMood = number => current.mood = number
const setTotal = number => current.total = number

//LISTENING
messenger.on('getTimer', msg => {
    debug && console.log('timer', msg.timerId)
    getTimer(msg.timerId).then(found => {
        current = found
        previous.total = found.total
        previous.started = found.started
        debug && console.log(current)
        messenger.emit(`${msg.timerId}`, current)

        getProjectDate(dateSimple(current.started), current.project).then(projectfound => {
            project = projectfound
            debug && console.log(project)
            debug && console.log(`${current.id}/saveEdits`)
            messenger.on(`${current.id}/saveEdits`, msg => {
                debug && console.log('edit', msg)
                editComplete()
            })
            messenger.on(`${current.id}/delete`, msg => {
                if (msg && msg.id === current.id) {
                    removeTimer(current)
                    current = {}
                    messenger.emit(`${current.id}/deleted`, current)
                }
            })
        })
    })

})

// PARSING
const chooseNewStart = (newTime, ended) => {
    if (!timeRules(newTime, ended)) {
        setAlert([
            'Error',
            'Cannot Start after End.',
        ])
    }
    else if (!timeRules(newTime, new Date())) {
        setAlert([
            'Error',
            'Cannot Start before now.',
        ])
    }
    else if (newTime && !dateRules(newTime)) {

        setAlert([
            'Error',
            'Cannot Pick Date before Today.',
        ])
    }
    else {

        setAlert(false)
        return isValid(newTime) ? setStarted(newTime) : false
    }
}

const chooseNewEnd = (newTime, started) => {
    if (!timeRules(started, newTime)) {

        setAlert([
            'Error',
            'Cannot Start after End.',
        ])
    }
    else if (!timeRules(newTime, new Date())) {

        setAlert([
            'Error',
            'Cannot End before now.',
        ])
    }
    else if (newTime && !dateRules(newTime)) {

        setAlert([
            'Error',
            'Cannot Pick Date before Today.',
        ])
    }
    else {

        setAlert(false)
        return isValid(newTime) ? setEnded(newTime) : false
    }
}

const chooseNewDate = (newDate, timer) => {
    if (dateRules(newDate)) {
        if (isValid(newDate)) {
            // objective, change day, keep time
            // TODO: move to a separate function
            let oldStart = isValid(timer.started) ? timer.started : new Date(timer.started)
            let oldEnd = isValid(timer.ended) ? timer.ended : new Date(timer.ended)
            let newStart = new Date(getYear(newDate), getMonth(newDate), getDate(newDate), getHours(oldStart), getMinutes(oldStart), getSeconds(oldStart))
            debug && console.log(isValid(newStart))
            setStarted(newStart)
            let newEnd = new Date(getYear(newDate), getMonth(newDate), getDate(newDate), getHours(oldEnd), getMinutes(oldEnd), getSeconds(oldEnd))
            setEnded(newEnd)
            return true
        }
        else return false
    } else {

        setAlert([
            'Error',
            'Cannot Pick Date before Today.'
        ])
        return false
    }
}
const timeRulesEnforcer = (start, end) => {
    if (!timeRules(start, end)) {
        setAlert([
            'Error',
            'Cannot Start after End.',
        ])
        return false
    }
    else if (!timeRules(start, new Date())) {
        setAlert([
            'Error',
            'Cannot Start before now.',
        ])
        return false

    }
    else if (!timeRules(end, new Date())) {
        setAlert([
            'Error',
            'Cannot End before now.',
        ])
        return false
    }
    else {
        setAlert(false)
        return true
    }
}

const nextDay = timer => {
    let newDate = add(new Date(timer.started), { days: 1 })
    return chooseNewDate(newDate, timer) ? newDate : timer.started
}

const previousDay = timer => {
    let newDate = sub(new Date(timer.started), { days: 1 })
    return chooseNewDate(newDate, timer) ? newDate : timer.started
}

const decreaseStarted = timer => {
    let newStarted = addMinutes(new Date(timer.started), -5)
    let checkedEnd = isRunning(timer) ? new Date() : new Date(timer.ended)
    return timeRulesEnforcer(newStarted, checkedEnd) ? setStarted(newStarted) : timer.started
}

const increaseStarted = timer => {
    let newStarted = addMinutes(new Date(timer.started), 5)
    let checkedEnd = isRunning(timer) ? new Date() : new Date(timer.ended)
    return timeRulesEnforcer(newStarted, checkedEnd) ? setStarted(newStarted) : timer.started
}

const decreaseEnded = timer => {
    let newEnded = isRunning(timer) ? new Date() : addMinutes(new Date(timer.ended), -5)
    let checkedStart = isRunning(timer) ? new Date() : new Date(timer.started)
    return timeRulesEnforcer(checkedStart, newEnded) ? setEnded(newEnded) : timer.ended
}

const increaseEnded = timer => {
    let newEnded = isRunning(timer) ? new Date() : addMinutes(new Date(timer.ended), 5)
    let checkedStart = isRunning(timer) ? new Date() : new Date(timer.started)
    return timeRulesEnforcer(checkedStart, newEnded) ? setEnded(newEnded) : timer.ended
}

const editComplete = () => {
    if (!timeRulesEnforcer(current.started, current.ended)) return false
    // let updatedtimer = current
    // updatedtimer.started = current.started.toString()
    // updatedtimer.ended = current.ended.toString()
    // updatedtimer.mood = current.mood
    // updatedtimer.energy = current.energy
    // updatedtimer.total = totalTime(current.started, current.ended)
    let updatedproject = project
    updatedproject.lastrun = sameDay(previous.started, project.lastrun) ? current.started : project.lastrun
    debug && console.log('current total', current.total, ' before total', previous.total)
    let prevcount = project.lastcount - previous.total // remove previous count
    let lastcount = prevcount + current.total
    updatedproject.lastcount = lastcount
    debug && console.log('updatedproject', updatedproject)
    if (current && current.type === 'timer') {
        Data.updateTimer(current)
        setAlert(['Success', 'Timer Updated!',])
    }
    else {
        setAlert(['Error', 'Timer Invalid!',])
    }
    if (updatedproject) {
        store.put(chain.projectDate(updatedproject.lastrun, project.id), updatedproject)
        setAlert(['Success', 'Project Updated!',])
    }
    else {
        setAlert(['Error', 'Project Invalid!',])
    }

}

const removeTimer = timer => {
    let timerDelete = timer
    timerDelete.deleted = new Date().toString()
    timerDelete.status = 'deleted'
    store.set(chain.timerHistory(timerDelete.id), timerDelete)
    store.put(chain.timer(timerDelete.id), timerDelete)
    store.put(chain.timerDate(timerDelete.started, timerDelete.id), false)
    store.put(chain.projectTimer(timerDelete.project, timerDelete.id), timerDelete)
    // project.lastrun = sameDay(previous.started, project.lastrun) ? current.started : project.lastrun
    project.lastcount = project.lastcount - previous.total
    store.put(chain.projectDate(project.lastrun, project.id), project)
    setAlert(['Success', 'Timer Deleted!'])
}

const restoreTimer = timer => {
    timer.status = 'done'
    store.put(chain.timer(timer.id), timer)
    store.set(chain.timerHistory(timer.id), timer)
    store.put(chain.projectTimer(timer.project, timer.id), timer)
    store.put(chain.timerDate(timer.started, timer.id), true)
    project.lastcount = project.lastcount + timer.total
    store.put(chain.projectDate(project.lastrun, project.id), project)
    setAlert(['Success', 'Timer Restored!'])
}


messenger.on('nextDay', msg => {
    if (msg && msg.id === current.id) {
        nextDay(current)
        debug && console.log('nextDay:', current)
        messenger.emit(`${current.id}`, current)
    }
})
messenger.on('prevDay', msg => {
    if (msg && msg.id === current.id) {
        previousDay(current)
        debug && console.log('prevDay:', current)
        messenger.emit(`${current.id}`, current)
    }
})
messenger.on('increaseStarted', msg => {
    if (msg && msg.id === current.id) {
        increaseStarted(current)
        current.total = totalTime(current.started, current.ended)
        debug && console.log(current.total, previous.total)
        messenger.emit(`${current.id}`, current)
    }
})
messenger.on('decreaseStarted', msg => {
    if (msg && msg.id === current.id) {
        decreaseStarted(current)
        current.total = totalTime(current.started, current.ended)
        debug && console.log(current.total, previous.total)
        messenger.emit(`${current.id}`, current)
    }
})
messenger.on('increaseEnded', msg => {
    if (msg && msg.id === current.id) {
        increaseEnded(current)
        current.total = totalTime(current.started, current.ended)
        debug && console.log(current.total, previous.total)
        messenger.emit(`${current.id}`, current)
    }
})
messenger.on('decreaseEnded', msg => {
    if (msg && msg.id === current.id) {
        decreaseEnded(current)
        current.total = totalTime(current.started, current.ended)
        debug && console.log(current.total, previous.total)
        messenger.emit(`${current.id}`, current)
    }
})
messenger.on('TimerRestore', msg => {
    if (msg && msg.id && msg.type === 'timer') {
        restoreTimer(msg)
    }
})

// DATA
const getTimer = timerId => {
    return new Promise((resolve, reject) => {
        if (!timerId) reject('no timerId passed')
        try {
            // OPTIMIZE: listen for changes with 'on' then update state in the background
            store.chainer(chain.timer(timerId), store.app).once((data, key) => {
                debug && console.log(key)
                const foundData = trimSoul(data)
                debug && console.log('foundTimer', foundData) // left off here try to debug with 'ack'
                if (foundData && foundData.type === 'timer') {
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
const getProjectDate = (day, projectId) => new Promise((resolve, reject) => {
    try {
        store.chainer(chain.projectDate(day, projectId), store.app).on((data, key) => {
            if (!data) {
                debug.data && console.log('[GUN node] getProjectDate No Data Found',)
            }
            let foundData = trimSoul(data)
            if (foundData.type === 'project') {
                debug.data && console.log('[GUN node] getProjectDate Data Found: ', key, foundData)

                resolve(foundData)
            }
        })
    } catch (err) {
        reject(err)
    }

})
