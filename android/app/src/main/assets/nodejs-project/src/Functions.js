// mini nodeified version of Functions.js
const moment = require('moment')
const debug = false

/**
 * 
 * @param {*} input
 * @returns {object | undefined} 
 */
const parse = (input) => {
    let output
    if (typeof input === 'string') {
        try { output = JSON.parse(input) }
        catch (error) { console.error(error) }
    } else if (typeof input === 'object') {
        output = input
    }
    return output
}

/**
 * removes soul from given data
 * @param {*} data 
 */
const trimSoul = data => {
    if (!data || !data['_'] || typeof data['_'] !== 'object') return data
    delete data['_']
    return data
}

function addHours(date, number) {
    return moment(date).add(number, 'hours')
}

const secondsToString = seconds => {
    let day = moment("2015-01-01")
    let start = day.startOf('day')
    let second = start.seconds(seconds)
    return moment.isMoment(second) ? second.format('H:mm:ss') : null
};

const isValid = date => Object.prototype.toString.call(date) === "[object Date]"
const addMinutes = (date, number) => moment(date).add(number, 'minutes').toDate()
const subMinutes = (date, number) => moment(date).subtract(number, 'minutes').toDate()
const subDays = (date, amount) => moment(date).subtract(amount, 'days').toDate()
const addDays = (date, amount) => moment(date).add(amount, 'days').toDate()
const getMonth = date => new Date(date).getMonth()
const getYear = date => moment(date).year()
const getHours = date => new Date(date).getHours()
const getMinutes = date => new Date(date).getMinutes()
const getSeconds = date => new Date(date).getSeconds()
const getDate = date => new Date(date).getDate()


const formatDate = date => moment(date).format("YYYY-MM-DD")

/**
 * @param {*} date 
 */
const isToday = (date) => {
    return moment(date).isSame(new Date(), 'day')
}

/**
 * 
 * reference: https://stackoverflow.com/questions/41778205/find-time-difference-between-2-times-using-moment-js
 * @param {Date} start 
 * @param {Date} end 
 */
const differenceInSeconds = (start, end) => {
    debug && console.log('Difference: ', start, ' - ', end)
    var a = moment(start)
    var b = moment(end)
    return a.diff(b, 'seconds')
}

/**
 * reference https://stackoverflow.com/questions/49909213/how-to-get-the-beginning-and-end-of-the-day-with-moment
 */
const startOfToday = () => {
    const now = moment()
    return now.startOf('day')
}

/**
 * 
 * @param {Date} date
 * reference https://stackoverflow.com/questions/49909213/how-to-get-the-beginning-and-end-of-the-day-with-moment 
 */
const endOfDay = (date) => {
    return moment(date).endOf('day')
}

/**
 * reference https://stackoverflow.com/questions/17333425/add-a-duration-to-a-moment-moment-js
 * @param {Date} date 
 * @param {Number} amount 
 */
const addSeconds = (date, amount) => {
    return moment(date).add(amount, 'seconds')
}

/**
 * 
 * @param {*} timer 
 * @return {boolean}
 */
const timerRanToday = timer => isToday(timer.started)

/**
 * 
 * @param {Array} timers 
 */
const getTimersForToday = timers => timers.filter(timer => timerRanToday(timer))

/**
 * 
 * @param {Array} timers
 * @returns {number} sum
 */
const sumTimers = timers => {
    let sum = 0
    timers.map(timer => {
        sum = sum + differenceInSeconds(timer.started, timer.ended)
    })
    return sum
}

/**
 * 
 * @param {*} timer 
 */
const isRunning = timer => timer && typeof timer === 'object' && timer.status === 'running' ? true : false

/**
 * get number of seconds between two dates
 * @param {*} start 
 * @param {*} end 
 */
const totalTime = (start, end) => differenceInSeconds(new Date(end), new Date(start))

/**
 * Create a date String of date
 * `DD-MM-YYYY`
 */
const dateSimple = date => {
    let parsedDate = date ? typeof date === 'string' ? new Date(date) : date : new Date()
    // const date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
    return moment(parsedDate).format('MM-DD-YYYY')
}

const fullDay = date => moment(date).format("MMMM Do YYYY")

/**
 * 
 * @param {string} date - pass a simpleDate 
 * @param {number} total
 */
const getTodaysCount = (date, total) => {
    if (!date || !total) return 0
    else if (date === dateSimple(new Date())) return total
    else return 0
}
/**
 * Setting count from last project count and total timer count
 * @param {Object} timer 
 * @param {Object} project 
 */
const settingCount = (timer, project) => {
    if (timer) {
        let total = totalTime(timer.started, timer.ended)
        if (project && project.lastrun === dateSimple(new Date())) {
            debug && console.log('Project Ran Today, adding count: ', project.lastcount, total)
            return project.lastcount + total
        } else {
            debug && console.log('setting count: ', total)
            return total
        }
    }
}
const sameDay = (a, b) => moment(a).isSame(b, 'day')
const timeRules = (start, end) => moment(start).isBefore(end)
const dateRules = date => moment(date).isBefore(new Date())
const simpleDate = date => moment(date ? date : new Date()).format("YYYY-MM-DD")

function dayHeaders(timerlist) {
    const output = [] // [days...]
    // organize timers by day
    const timerdays = timerlist.map(timer => {
        return { day: simpleDate(timer.started), timer: timer }
    })
    // //// debug && console.log(pagename + '- DAYHEADERS - TIMERDAYS : ', timerdays)
    timerdays.forEach(timerday => {
        // first value if output is empty is always unique
        if (output.length === 0) {
            // // debug && console.log('FIRST OUTPUT ENTRY :', timerday)
            output.push({ title: timerday.day, data: [timerday.timer] })
        }
        else {
            // find and compare timerdays to outputs
            const match = output.find(inOutput => inOutput.title === timerday.day)
            if (match) {
                //// debug && console.log(pagename + '- MATCHING ENTRY :', match.title)
                // add timer to list of timers for matching day
                match.data = [...match.data, timerday.timer]
            }
            else {
                //// debug && console.log(pagename + '- NEW OUTPUT ENTRY :', timerday)
                output.push({ title: timerday.day, data: [timerday.timer] })
            }
        }
    })
    // // debug && console.log('- DAYHEADERS - OUTPUT', output)
    if (output.length > 0) { return (output) }
    else { return ([]) }
}

/**
 * 
 * @param {*} started 
 * @param {*} ended 
 */
function multiDay(started, ended) {
    if (typeof started === 'string') started = new Date(started)
    if (typeof ended === 'string') ended = new Date(ended)
    if (!ended) ended = new Date()
    return sameDay(started, ended) ? false : true
}

/**
 * Split a timer into one timer per day
 * @param {*} started 
 * @param {*} ended
 * @return `[{start: DateTime, end: DateTime}, ...]`
 */
function newEntryPerDay(started, ended) {
    if (typeof started === 'string') started = new Date(started)
    if (typeof ended === 'string') ended = new Date(ended)
    if (!ended) ended = new Date()
    // debug && console.log(started, ended)
    const secondsinday = 86400
    let totalSeconds = differenceInSeconds(ended, started)
    // debug && console.log('total seconds', totalSeconds)
    // get whole days
    if (totalSeconds > secondsinday) {
        const output = []
        let daysfromseconds = totalSeconds / secondsinday
        let start = started
        while (daysfromseconds > 1) {
            // debug && console.log(daysfromseconds)
            let end = endOfDay(start)
            let day = { start: start.toString(), end: end.toString() }
            output.push(day)
            // debug && console.log(day)
            start = addSeconds(end, 1)
            totalSeconds = totalSeconds - secondsinday
            daysfromseconds = totalSeconds / secondsinday
            if (daysfromseconds < 1) {
                // debug && console.log(daysfromseconds)
                let end = endOfDay(start)
                let day = { start: start.toString(), end: end.toString() }
                output.push(day)
                // debug && console.log(day)
                // let last = { start: startOfToday().toString(), end: 'running' }
                let last = { start: startOfToday().toString(), end: ended.toString() }
                output.push(last)
                // debug && console.log(last)
                break
            }
        }
        return output
    } else {
        // debug && console.log('Entry Less than a day')
        return []
    }

}


module.exports = {
    parse,
    sameDay,
    multiDay,
    newEntryPerDay,
    differenceInSeconds,
    isToday,
    isRunning,
    getTimersForToday,
    sumTimers,
    timerRanToday,
    formatDate,
    dateSimple,
    trimSoul,
    getTodaysCount,
    settingCount,
    totalTime,
    addHours,
    dayHeaders,
    dateRules,
    timeRules,
    isValid,
    addMinutes,
    subMinutes,
    subDays,
    addDays,
    getMonth,
    getYear,
    getHours,
    getMinutes,
    getSeconds,
    getDate,
    secondsToString,
    fullDay
}