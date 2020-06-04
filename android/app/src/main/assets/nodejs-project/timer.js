
const store = require('./src/Store')
const createTimer = require('./src/Data').createTimer
const finishTimer = require('./src/Data').finishTimer
const getProject = require('./src/Data').getProject
const getTimers = require('./src/Data').getTimers
const getRunning = require('./src/Data').getRunning
const { differenceInSeconds, timerRanToday } = require('./src/Functions')
const native = require('./native-bridge')

let timer
let runningTimer
let runningProject
let count = 0
// Core Functions
/**
 * 
 * @param {object} input 
 */
const runTimer = () => {
    console.log('[Timer node] Start ')
    clearInterval(timer)
    timer = setInterval(() => {
        if (!runningTimer || runningTimer.status !== 'running') {
            clearInterval(timer)
            return;
        }
        native.channel.post('notify', { title: runningProject.name, subtitle: count.toString(), state: "start" })
        count++
    }, 1000)
}

// const runTimer = () => {
//     console.log('[Timer node] Start ')
//     native.channel.post('notify', { title: runningProject.name, state: "start" })

// }
const stopTimer = () => {
    console.log('[Timer node] Stop ', runningTimer)
    clearInterval(timer)
    native.channel.post('notify', { state: "stop" })
}

// Helper Functions 
const parser = input => {
    try {
        input = JSON.parse(input)
    } catch (error) {
        console.log('[Parse node] not a JSON object')
    } finally {
        return input
    }
}

const inputParser = msg => {
    if (typeof msg === 'string') return parser(msg)
    else if (typeof msg === 'object') return msg
}

const getCount = projectId => {
    const currentTimers = []
    getTimers(projectId, timer => {
        timer = JSON.parse(timer)
        let check = currentTimers.some(id => id === timer.id)
        if (check) {
            currentTimers.push(timer.id)
            console.log('[NODE_DEBUG_PUT] : Got timer', timer)

            if (timerRanToday(timer)) {
                console.log('[NODE_DEBUG_PUT] : Setting count', count)
                count = count + differenceInSeconds(timer.ended, timer.started)
            }
        }
    })
}

// Remote Commands Handler, listens to finishTimer or createTimer
store.chainer('running', store.app).on((data, key) => {
    data = JSON.parse(data)
    if (data.type === 'timer') {
        console.log('[node STOP] found timer: ', data)
        if (data.status === 'running') {
            runningTimer = data
            console.log('[NODE_DEBUG_PUT] : Running Timer ', runningTimer)
            getProject(runningTimer.project, event => {
                let item = JSON.parse(event)
                console.log('[node STOP] found item: ', typeof item, item)
                if (item.type === 'project') {
                    // console.log('[node STOP] found project: ', item)
                    if (item.id === data.project) {
                        console.log('[NODE_DEBUG_PUT] : Running Project ', runningTimer)
                        runningProject = item
                        count = 0
                        const currentTimers = []
                        getTimers(runningProject.id, timer => {
                            timer = JSON.parse(timer)
                            let check = currentTimers.some(id => id === timer.id)
                            if (!check) {
                                currentTimers.push(timer.id)
                                console.log('[NODE_DEBUG_PUT] : Got timer', timer)
                    
                                if (timerRanToday(timer)) {
                                    count = count + differenceInSeconds(timer.ended, timer.started)
                                    console.log('[NODE_DEBUG_PUT] : Setting count', count)

                                }
                            }
                        })
                        let running = runningTimer
                        running.color = runningProject.color
                        running.name = runningProject.name
                        native.channel.post('running', running)

                        runTimer()
                    }
                }
            })
        }
        else if (data.status === 'done' && data.id === runningTimer.id) {
            console.log('[node STOP]')
            runningTimer = data
            stopTimer()
        }
        else if (data.id === 'none') {
            runningTimer = data
            stopTimer()
        }
        else {
            stopTimer()
        }
    }
})

// Native Commands Handler, listens to notification action buttons
native.channel.on('stop', msg => {
    console.log('[React node] incoming Stop: ' + typeof msg, msg)
    try {
        stopTimer()
        finishTimer(runningTimer)
    } catch (error) {
        console.log('[Timer node] : Stop failed ' + error)
    }
})

native.channel.on('start', msg => {
    console.log('[React node] incoming Start: ' + typeof msg, msg)
    try {
        const runningNew = createTimer(runningTimer.project)
        runningTimer = runningNew
    } catch (error) {
        console.log('[Timer node] : Create failed ' + error)
    }
    try {
        runTimer()
    } catch (error) {
        console.log('[Timer node] : Start failed ' + error)
    }
})