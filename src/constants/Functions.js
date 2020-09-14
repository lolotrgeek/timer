import moment from 'moment'

const debug = false

// TODO: REFACTOR SO FUNCTIONS DO NOT NEED ANY DATA STRUCTURE
// DATA FUNCTIONS
/**
 * removes soul from given data
 * @param {*} data 
 */
export const trimSoul = data => {
    if (!data || !data['_'] || typeof data['_'] !== 'object') return data
    delete data['_']
    return data
}

/**
 * 
 * @param {*} input
 * @returns {object | undefined} 
 */
export const parse = (input) => {
    let output
    if (typeof input === 'string') {
        try { output = JSON.parse(input) }
        catch (error) { console.error(error) }
    } else if (typeof input === 'object') {
        output = input
    }
    return output
}

// TIME FUNCTIONS
/**
 * Create a datetime String of Today
 */
export const datetimeCreator = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date + ' ' + time;
}

/**
 * reference https://stackoverflow.com/questions/49909213/how-to-get-the-beginning-and-end-of-the-day-with-moment
 */
export const startOfToday = () => {
    const now = moment()
    return now.startOf('day')
}


/**
 * Create a date String of date
 * `DD-MM-YYYY`
 */
export const dateSimple = date => {
    let parsedDate = date ? typeof date === 'string' ? new Date(date) : date : new Date()
    // const date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
    return moment(parsedDate).format('MM-DD-YYYY')
}
export const isValid = date => Object.prototype.toString.call(date) === "[object Date]"
export const addMinutes = (date, number) => moment(date).add(number, 'minutes').toDate()
export const subMinutes = (date, number) => moment(date).subtract(number, 'minutes').toDate()
export const subDays = (date, amount) => moment(date).subtract(amount, 'days').toDate()
export const addDays = (date, amount) => moment(date).add(amount, 'days').toDate()
export const getYear = date => new Date(date).getYear()
export const getHours = date => new Date(date).getHours()
export const getMinutes = date => new Date(date).getMinutes()
export const getSeconds = date => new Date(date).getSeconds()
export const getDate = date => new Date(date).getDate()
export const sameDay = (a, b) => moment(a).isSame(b, 'day')
export const toDate = moment => moment.toDate()
/**
 * https://stackoverflow.com/a/30674186
 * @param {*} date 
 */
export const isYesterday = (date, format) => {
    let today = moment(new Date())
    let yesterday = today.clone().subtract(1, 'days').startOf('day')
    if(!format) format = 'MM-DD-YYYY'
    return moment(date, format).isSame(yesterday)
}
/**
 * 
 * @param {Date} date
 * reference https://stackoverflow.com/questions/49909213/how-to-get-the-beginning-and-end-of-the-day-with-moment 
 */
export const endOfDay = (date) => {
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
 * Construct a Javascript Date object from `mm-dd-yyyy` string
 * @param {*} string 
 */
export const simpleDateContructor = string => {
    let date = string.split('-')
    let month = parseInt(date[0])-1
    let day = parseInt(date[1])
    let year = parseInt(date[2])
    return new Date(year, month, day) 
}

export const isToday = (date, format) => {
    let given = simpleDateContructor(date)
    if(!format) format = 'MM-DD-YYYY'
    let same = moment(date, format).isSame(new Date(), 'day')
    debug && console.log('isToday?: ', date, new Date(), same)
    return same
}

export const differenceInSeconds = (start, end) => {
    let a = moment(start)
    let b = moment(end)
    return a.diff(b, 'seconds')
}

/**
 * Convert seconds to string `hh : mm : ss`
 * @param {number} seconds 
 */
// export const secondsToString = seconds => moment("2015-01-01").startOf('day').seconds(seconds).format('H:mm:ss');
//TODO consider shorthanding this
export const secondsToString = seconds => {
    let day = moment("2015-01-01")
    let start = day.startOf('day')
    let second = start.seconds(seconds)
    return moment.isMoment(second) ? second.format('H:mm:ss') : null
};

/**
 * return full month name from date.
 * @param {*} date
 */
export const getMonth = date => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]
    return monthNames[date.getMonth()]
}
/**
 * return date as a simplifed date string `dd month yyy`
 * @param {*} date optional, default: `today`
 */
export const simpleDate = date => moment(date ? date : new Date()).format("YYYY-MM-DD")
export const simpleDateOld = date => date.getDate() + " " + getMonth(date) + " " + date.getFullYear()

export const fullDate = date => moment(date).format("ddd MMM Do YYYY, h:mm:ss a")
export const fullTime = date => moment(date).format("h:mm:ss a")
export const fullDay = date => moment(date).format("ddd MMM Do YYYY")
/**
 * 
 */
export const listDay = timers => timers.map(timer => new Date(timer.started))
/**
 * 
 * @param {*} start 
 * @param {*} end 
 */
export const timeRules = (start, end) => moment(start).isBefore(end) 

/**
 * 
 * @param {*} date 
 */
export const dateRules = date => moment(date).isBefore(new Date())


/**
 * 
 * @param {*} date 
 */
export const timeString = date => {
    if (typeof date === 'string') date = new Date(date)
    return moment(date).format('hh:mm:ss a')
}

/**
 * get number of seconds between two dates
 * @param {*} start 
 * @param {*} end 
 */
export const totalTime = (start, end) => differenceInSeconds(new Date(end), new Date(start))
/**
 * display start and end times
 * @param {*} start 
 * @param {*} end 
 */
export const timeSpan = (start, end) => timeString(new Date(start)) + ' - ' + timeString(new Date(end))
/**
 * 
 * @param {*} start 
 * @param {*} end 
 */
export const totalOver = (start, end) => Math.sign(end) === -1 ? start + end : 0
/**
 * 
 * @param {*} timers 
 */
export const totalProjectTime = timers => timers.reduce((acc, timer) => acc + timer.total)
/**
 * 
 * @param {*} datestring 
 */
export const sayDay = datestring => isToday(datestring) ? 'Today' : isYesterday(datestring) ? 'Yesterday' : datestring
/**
 * 
 * @param {*} t timestring or date object
 */
export const formatTime = t => {
    if (t >= 0) return new Date(t * 1000).toISOString().substr(11, 8)  // hh : mm : ss
    else {
        t = Math.abs(t)
        t = t.toString()
        if (t.length === 0) return '00:00:00'
        if (t.length === 1) return '-00:00:0' + t.charAt(0)
        if (t.length === 2) return '-00:00:' + t.charAt(0) + t.charAt(1)
        if (t.length === 3) return '-00:0' + t.charAt(0) + ':' + t.charAt(1) + t.charAt(2)
        if (t.length === 4) return '-00:' + t.charAt(0) + t.charAt(1) + ':' + t.charAt(2) + t.charAt(3)
        if (t.length === 5) return '-0' + t.charAt(0) + ':' + t.charAt(1) + t.charAt(2) + ':' + t.charAt(3) + t.charAt(4)
        if (t.length > 5) return '-' + t.charAt(0) + t.charAt(1) + ':' + t.charAt(2) + t.charAt(3) + ':' + t.charAt(4) + t.charAt(5)
    }
}

// TIMER FUNCTIONS - WIP

/**
 * 
 * @param {*} timer 
 * @return {boolean}
 */
export const timerRanToday = timer => isToday(new Date(timer.started))

/**
 * 
 * @param {string} date - pass a simpleDate 
 * @param {number} total
 */
export const getTodaysCount = (date, total) => {
    if (!date || !total) return 0
    else if (date === dateSimple(new Date())) return total
    else return 0
}

/**
 * Setting count from last project count and total timer count
 * @param {Object} timer 
 * @param {Object} project 
 */
export const settingCount = (timer, project) => {
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

/**
 * 
 * @param {*} timer 
 */
export const sayRunning = timer => timer.ended === timer.started ? 'running' : timer.ended
/**
 * validator...
 * @param {*} timer 
 */
export const isRunning = timer => timer && typeof timer === 'object' && timer.status === 'running'


/**
 * Get amount of time since entry was started
 * @param {string} started datestring when entry was started
 */
export const elapsedTime = started => differenceInSeconds(new Date(), new Date(started))
/**
 * find running timers within given days
 * @param {*} days 
 */
export const runningFind = async days => new Promise((resolve, reject) => {
    let found = days.map(day => day.data.filter(timers => isRunning(timers) ? timers : false))
    found.length > 0 ? resolve(found) : reject([])
})
/**
 * find running timers within given timers
 * @param {*} timers 
 */
export const findRunning = timers => {
    const foundRunning = timers.filter(timer => {
        if (timer.status === 'running') {
            return true
        } else {
            return false
        }
    })
    if (foundRunning && foundRunning.length === 1) {
        // debug && console.log('foundRunning : ', foundRunning[0])
        return foundRunning[0]
    }
    else if (foundRunning.length > 1) {
        // debug && console.log('foundRunning - multiple running :', foundRunning)
        foundRunning.map(found => found)
        return []
    }
    else {
        // debug && console.log('foundRunning - no valid : ', foundRunning)
        return []
    }
}


/**
 * 
 * @param {*} started 
 * @param {*} ended 
 */
export const multiDay = (started, ended) => {
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
export const newEntryPerDay = (started, ended) => {
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

// STYLE FUNCTIONS
/**
 * 
 * @param {*} mood 
 */
export const moodMap = mood => {
    if (mood === '') return { name: 'times', color: 'black' }
    if (mood === 'great') return { name: 'grin', color: 'orange' }
    if (mood === 'good') return { name: 'smile', color: 'green' }
    if (mood === 'meh') return { name: 'meh', color: 'purple' }
    if (mood === 'bad') return { name: 'frown', color: 'blue' }
    if (mood === 'dizzy') return { name: 'awful', color: 'grey' }
}

// SORTING FUNCTIONS
/**
 * List all timers in each day
 * @param {*} timerlist 
 * @returns [{title: day, data: [timer, ...]}, ...]
 */
export const dayHeaders = timerlist => {
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
 * takes timers sorted by day and combines by project then sums total time 
 * @param {Array} dayheaders {title: day, data: [timer, ...]}
 */
export const sumProjectTimers = dayheaders => {
    return dayheaders.map(day => {
        // return array of days by project with timers summed
        let projects = []
        // for each day...
        day.data.map(timer => {
            // ... group timer entries by project
            if (projects.length === 0) {
                // debug && console.log('first timer: ', )
                // // debug && console.log('ticked : ',  timer.total, 'calculated : ', totalTime(timer.started, timer.ended))
                let total = totalTime(timer.started, timer.ended)
                projects.push({ project: timer.project, name: timer.name, color: timer.color, totals: [total], total: total, status: timer.status, timers: [timer.id] })
            }
            // for each project get all timer entries and sum the totals
            const match = projects.find(inProjects => inProjects.project === timer.project)
            // // debug && console.log('projects : ', projects)
            if (match) {
                if (projects[0].timers.id === timer.id) {
                    // debug && console.log('existing match')
                } else {
                    // // debug && console.log('ticked : ',  timer.total, 'calculated : ', totalTime(timer.started, timer.ended))
                    let total = totalTime(timer.started, timer.ended)
                    match.totals = [...match.totals, total]
                    // debug && console.log('new match')
                    match.total = match.totals.reduce((acc, val) => acc + val) // sum the totals
                }
            }
            else {
                // debug && console.log('last timer: ', timer.id)
                // // debug && console.log('ticked : ',  timer.total, 'calculated : ', totalTime(timer.started, timer.ended))
                let total = totalTime(timer.started, timer.ended)
                projects.push({ project: timer.project, totals: [total], total: total, status: timer.status })
            }
            // debug && console.log(projects)
            return projects
        })
        // // debug && console.log({title: day.title , data : projects})
        return { title: day.title, data: projects }
    })

}