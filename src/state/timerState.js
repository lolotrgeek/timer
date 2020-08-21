
import { addMinutes, isValid, sub, add, getMonth, getYear, getHours, getMinutes, getSeconds, getDate } from 'date-fns'
import { timeRules, dateRules, totalTime, trimSoul, isRunning, fullDate } from '../constants/Functions'
import messenger from '../constants/Messenger'
import * as Data from '../data/Data'
import * as chain from '../data/Chains'
import * as store from '../data/Store'


let debug = true
// STATE
let timerState = {}
let current = {}

const setAlert = alert => console.log(alert)
const setTimer = object => current.timer = object
const setEnded = date => current.ended = isValid(date) ? typeof date === 'string' ? date : date.toString() : current.ended
const setStarted = date => current.started = isValid(date) ? typeof date === 'string' ? date : date.toString() : current.started
const setEnergy = number => current.energy = number
const setMood = number => current.mood = number
const setTotal = number => current.total = number

//LISTENING
messenger.on('getTimer', msg => {
    console.log('timer', msg.timerId)
    getTimer(msg.timerId).then(found => {
        current = found
        // setStarted(new Date(current.started))
        // setEnded(new Date(current.ended))
        console.log(current)
        messenger.emit(`${msg.timerId}`, current)
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
            console.log(isValid(newStart))
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

const editComplete = timer => {
    if (!timeRulesEnforcer(timer.started, timer.ended)) return false
    let updatedTimer = timer
    updatedTimer.started = timer.started.toString()
    updatedTimer.ended = timer.ended.toString()
    updatedTimer.mood = timer.mood
    updatedTimer.energy = timer.energy
    updatedTimer.total = totalTime(timer.started, timer.ended)
    if (updatedTimer && updatedTimer.type === 'timer') {
        Data.updateTimer(updatedTimer)
        setAlert(['Success', 'Timer Updated!',])
    }
    else {
        setAlert(['Error', 'Timer Invalid!',])
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

const removeTimer = timer => {
    Data.deleteTimer(timer)
    setAlert(['Success', 'Timer Deleted!'])
}

messenger.on('nextDay', msg => {
    if (msg && msg.id === current.id) {
        nextDay(current)
        console.log('nextDay:', current)
        messenger.emit(`${current.id}`, current)
    }
})
messenger.on('prevDay', msg => {
    if (msg && msg.id === current.id) {
        previousDay(current)
        console.log('prevDay:', current)
        messenger.emit(`${current.id}`, current)
    }
})
messenger.on('increaseStarted', msg => {
    if (msg && msg.id === current.id) {
        increaseStarted(current)
        messenger.emit(`${current.id}`, current)
    }
})
messenger.on('decreaseStarted', msg => {
    if (msg && msg.id === current.id) {
        decreaseStarted(current)
        messenger.emit(`${current.id}`, current)
    }
})
messenger.on('increaseEnded', msg => {
    if (msg && msg.id === current.id) {
        increaseEnded(current)
        messenger.emit(`${current.id}`, current)
    }
})
messenger.on('decreaseEnded', msg => {
    if (msg && msg.id === current.id) {
        decreaseEnded(current)
        messenger.emit(`${current.id}`, current)
    }
})
messenger.on('removeTimer', msg => {
    if (msg && msg.id === current.id) {
        removeTimer(current)
        setTimer({})
        messenger.emit(`${current.id}`, current)
    }
})

// DATA
const getTimer = timerId => {
    return new Promise((resolve, reject) => {
        if (!timerId) reject('no timerId passed')
        try {
            // OPTIMIZE: listen for changes with 'on' then update state in the background
            store.chainer(chain.timer(timerId), store.app).once((data, key) => {
                console.log(key)
                const foundData = trimSoul(data)
                console.log('foundTimer', foundData) // left off here try to debug with 'ack'
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
