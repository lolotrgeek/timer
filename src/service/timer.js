/* eslint-disable no-unused-vars */

import * as store from './store'
import { getTimers, getProject } from './data'
import { createTimer, finishTimer  } from '../data/Data'
import { timerRanToday, totalTime, parse } from '../constants/Functions'
import messenger from '../constants/Messenger'
const debug = true

let timer
let runningTimer = { id: 'none'}
let runningProject = { id: 'none'}
let count = 0
// Core Functions

/**
 * 
 * @param {object} running 
 * @param {object} project 
 * @param {number} count 
 */
const runTimer = (running, project) => {
    debug && console.log('[Timer node] run timer ')
    clearInterval(timer)
    if (project && typeof project === 'object' && project.name) {
        messenger.emit('notify', { title: project.name, subtitle: count.toString(), state: "start" })
        timer = setInterval(() => {
            if (!running || running.status !== 'running') {
                clearInterval(timer)
                return;
            }
            debug && console.log(`running timer: ${running.id} | project: ${running.project}`)
            messenger.emit('count', count.toString())
            count++
        }, 1000)
    }
}

const stopTimer = (running) => {
    debug && console.log('[Timer node] Stop ', running)
    clearInterval(timer)
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

const getCount = (data) => new Promise((resolve, reject) => {
    if (!data) reject('no data')
    else if (runningTimer && runningTimer.project !== data.project) {
        debug && console.log(`getting count ${runningTimer.project} != ${data.project}`)
        getTimers(data.project).then(timers => {
            debug && console.log(`Got count timers ${typeof timers} `, timers)
            count = 0
            timers.map(foundTimer => {
                // debug && console.log(`Got count timer ${typeof foundTimer}`, foundTimer)
                if (timerRanToday(foundTimer)) {
                    let TIMERTOTAL = totalTime(foundTimer.ended, foundTimer.started)
                    debug && console.log(`Got count ${foundTimer.project}/${foundTimer.id} , ${TIMERTOTAL}`)
                    count = count + TIMERTOTAL
                    debug && console.log('Updating count ', count)
                }
            })
            debug && console.log(`count ${count}`)
            resolve(count)
        }).catch(err => console.error(err))


    }
    else if (runningTimer && runningTimer.project === data.project) {
        debug && console.log(`same count ${runningTimer.project} = ${data.project}`)
        // count = count
        resolve(count)
        debug && console.log(`count ${count}`)
    }
    else {
        debug && console.log(`new count ${data.project}`)
        count = 0
        resolve(count)
        debug && console.log(`count ${count}`)
    }
})

function updateRunning(runningTimer, runningProject) {
    let running = runningTimer
    running.color = runningProject.color
    running.name = runningProject.name
    messenger.emit('running', running)
}

// Remote Commands Handler, listens to finishTimer or createTimer
store.chainer('running', store.app).on((data, key) => {
    data = parse(data)
    if (data && data.type === 'timer') {
        if (data.status === 'running') {
            getCount(data).then(count => {
                runningTimer = data
                debug && console.log('[NODE_DEBUG_PUT] : Running Timer ', runningTimer)
                findRunningProject(runningTimer).then(found => {
                    runningProject = found
                    runTimer(runningTimer, runningProject, count)
                    updateRunning(runningTimer, runningProject) // sends to react
                })

                // debug && console.log('run timer: ', timer)
            })

        }
        else if (data.status === 'done' && data.id === runningTimer.id) {
            debug && console.log('[node STOP]')
            runningTimer = data
            stopTimer(runningTimer)
        }
        else if (data.id === 'none') {
            runningTimer = data
            stopTimer(runningTimer)
        }
        else {
            stopTimer({ id: 'none', status: 'done' })
        }
    }
})

// Native Commands Handler, listens to notification action buttons
messenger.on('stop', msg => {
    debug && console.log('[React node] incoming Stop: ' + typeof msg, msg)
    try {
        runningTimer.status = 'done'
        debug && console.log('[NODE_DEBUG_PUT] : Running Timer Stopped ', runningTimer)
        stopTimer(runningTimer)
        finishTimer(runningTimer)
        debug && console.log('stop timer: ', timer)
    } catch (error) {
        debug && console.log('[Timer node] : Stop failed ' + error)
    }
})

messenger.on('start', msg => {
    debug && console.log('[React node] incoming Start: ' + typeof msg, msg)
    try {
        if (runningTimer && runningTimer.status === 'running') finishTimer(runningTimer)
        const runningNew = createTimer(runningTimer.project)
        getCount(runningNew).then(count => {
            runningTimer = runningNew
            debug && console.log('[NODE_DEBUG_PUT] : Running Timer ', runningTimer)
            findRunningProject(runningTimer).then(found => {
                runningProject = found
                runTimer(runningTimer, runningProject)
            })
            debug && console.log('run timer: ', timer)
        })

    } catch (error) {
        debug && console.log('[Timer node] : Create failed ' + error)
    }
})