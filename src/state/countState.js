/* eslint-disable no-unused-vars */

import * as store from '../service/store'
import { getTimers, getProject } from '../service/data'
import { createTimer, finishTimer } from '../data/Data'
import { timerRanToday, totalTime, parse } from '../constants/Functions'
import messenger from '../constants/Messenger'
const debug = true

let counter
let lastrun = { id: 'none' }
let running = { id: 'none' }
let count = 0

messenger.on('getlastRun', msg => {
    messenger.emit('lastRun', lastrun)
})

// Core Functions

/**
 * 
 * @param {object} running 
 * @param {object} project 
 * @param {number} count 
 */
const runCounter = running => {
    debug && console.log('[Timer node] run timer ')
    clearInterval(counter)
    if (running && running.name) {
        messenger.emit('notify', { title: running.name, subtitle: count.toString(), state: "start" })
        counter = setInterval(() => {
            if (!running || running.status !== 'running') {
                clearInterval(counter)
                return;
            }
            debug && console.log(`running counter: ${running.id} | project: ${running.project}`)
            messenger.emit('count', count.toString())
            count++
        }, 1000)
    }
}

const stopCounter = () => {
    debug && console.log('[Timer node] Stop ', running)
    clearInterval(counter)
    messenger.emit('notify', { state: "stop" })
}

const findRunningProject = running => new Promise((resolve, reject) => {
    if (!running || running.status !== 'running') {
        debug && console.log('no running timer')
        reject(running)
    } else {
        getProject(running.project).then(event => {
            let item = parse(event)
            debug && console.log('[NODE_DEBUG_PUT] : Running Project ', item.id)
            if (item.type === 'project' && item.id === running.project) {
                resolve(item)
            } else {
                debug && console.log('no running project found')
                reject(event)
            }
        })
    }
})

/**
 * Total count of timers that ran today 
 * @param {string} projectId 
 */
const countTimersToday = (projectId) => new Promise((resolve, reject) => {
    getTimers(projectId).then(timers => {
        debug && console.log(`Counting Timers Today ${typeof timers} `, timers)
        timers.map(foundTimer => {
            // debug && console.log(`Got count timer ${typeof foundTimer}`, foundTimer)
            if (timerRanToday(foundTimer)) {
                let TIMERTOTAL = totalTime(foundTimer.started, foundTimer.ended)
                debug && console.log(`Got count ${foundTimer.project}/${foundTimer.id} , ${TIMERTOTAL}`)
                count = count + TIMERTOTAL
                debug && console.log('Updating count ', count)
            }
        })
        debug && console.log(`count ${count}`)
        resolve(count)
    }).catch(err => reject(err))
})

/**
 * Set the count to pass along to the counter
 * @param {*} timer 
 */
const getCount = timer => new Promise((resolve, reject) => {
    if (!timer) reject('no running')
    else if (running && running.project !== timer.project) {
        debug && console.log(`updating count ${running.project} != ${timer.project}`)
        count = 0
        countTimersToday(running.project).then(counted => resolve(counted)).catch(err => reject(err))
    }
    else if (lastrun.id !== 'none' && lastrun.project === timer.project) {
        debug && console.log(`same count ${lastrun.project} = ${timer.project}`)
        // count = count
        resolve(count)
        debug && console.log(`count ${count}`)
    }
    else {
        debug && console.log(`new count ${timer.project}`)
        count = 0
        resolve(count)
        debug && console.log(`count ${count}`)
    }
})

function createRunning(timer) {
    findRunningProject(running).then(project => {
        running = timer
        running.color = project.color
        running.name = project.name
        messenger.emit('running', running)
    })
}

// Remote Commands Handler, listens to finishTimer or createTimer
store.chainer('running', store.app).on((data, key) => {
    data = parse(data)
    if (data && data.type === 'timer') {
        if (data.status === 'running') {
            getCount(data).then(count => {
                debug && console.log('[NODE_DEBUG_PUT] : Running Timer ', running)
                createRunning(data)
                runCounter(running)
                // debug && console.log('run timer: ', timer)
            })

        }
        else if (data.status === 'done' && data.id === running.id) {
            debug && console.log('[STOP] update state')
            running = data
            stopCounter()
        }
        else if (data.id === 'none') {
            running = data
            stopCounter()
        }
        else {
            running = { id: 'none', status: 'done' }
            stopCounter()
        }
    }
})

// Native Commands Handler, listens to notification action buttons
messenger.on('stop', msg => {
    debug && console.log('[React node] incoming Stop: ' + typeof msg, msg)
    try {
        running.status = 'done'
        lastrun = running
        debug && console.log('[NODE_DEBUG_PUT] : Running Timer Stopped ', running)
        stopCounter()
        finishTimer(running)
        running = { id: 'none' }
    } catch (error) {
        debug && console.log('[Timer node] : Stop failed ' + error)
    }
})

messenger.on('start', msg => {
    debug && console.log('[React node] incoming Start: ' + typeof msg, msg)
    try {
        if (running && running.status === 'running') {
            running.status = 'done'
            lastrun = running
            stopCounter()
            finishTimer(running)
        }
        const timer = createTimer(msg.project)
        running = timer
        getCount(timer).then(count => {
            debug && console.log('[NODE_DEBUG_PUT] : New Running  ', running)
            createRunning(timer)
            runCounter(running)
            debug && console.log('run timer: ', timer)
        })

    } catch (error) {
        debug && console.log('[Timer node] : Create failed ' + error)
    }
})