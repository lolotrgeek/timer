/* eslint-disable no-unused-vars */

import * as store from './store'
import { getTimers, getProject } from './data'
import { createTimer, finishTimer } from '../data/Data'
import { timerRanToday, totalTime, parse } from '../constants/Functions'
import * as chain from '../data/Chains'
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
const runCounter = () => {
    debug && console.log('[Timer node] run timer ')
    clearInterval(counter)
    if (running && running.name && running.status === 'running') {
        counter = setInterval(() => {
            if (!running || running.status !== 'running') {
                clearInterval(counter)
                return;
            }
            // debug && console.log(`running counter: ${running.id} | project: ${running.project}`)
            messenger.emit('count', count.toString())
            count++
        }, 1000)
    }
}

const stopCounter = () => {
    debug && console.log('[Timer node] Stop Counter')
    clearInterval(counter)
    messenger.emit('notify', { state: "stop" })
}


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
    if (!timer) reject('Unable to getCount: no running timer')
    else if (running && lastrun.project !== timer.project) {
        debug && console.log(`updating count ${running.project} != ${timer.project}`)
        count = 0
        countTimersToday(running.project).then(counted => resolve(counted)).catch(err => reject('Unable to countTimersToday:', err))
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

const updateRunning = () => new Promise(async (resolve, reject) => {
    try {
        let foundProject = await getProject(running.project)
        let project = parse(foundProject)
        if (project.type === 'project' && project.id === running.project) {
            debug && console.log('Running Project ', project.id)
            running.color = project.color
            running.name = project.name
            resolve(running)
        } else {
            reject('no timer project found')
        }

    } catch (error) {
        reject('Unable to createRunning', error)
    }
})

const stopRunning = () => new Promise((resolve, reject) => {
    stopCounter()
    finishTimer(running)
    lastrun = running
    messenger.emit('lastrun', lastrun)
    // listen for finished Timer
    messenger.on(chain.timer(running.id), event => {
        if (event.id === running.id) {
            debug && console.log('[NODE_DEBUG_PUT] : Running Timer Stopped ', event)
            running = event
            messenger.emit('running', running)
            resolve(event)
        } else {
            reject('[Timer node] : Stop failed ', event)
        }
    })
})

const startRunning = timer => new Promise(async (resolve, reject) => {
    try {
        await getCount(timer)
        running = timer
        messenger.emit('running', running)
        debug && console.log('[NODE_DEBUG_PUT] : New Running  ', running)
        runCounter(running)
        debug && console.log('run timer: ', timer)
    } catch (error) {
        debug && console.log('[Timer node] : Start failed ' + error)
    }
})

// Remote Commands Listener, listens to finishTimer or createTimer
store.chainer('running', store.app).on(async (data, key) => {
    try {
        data = parse(data)
        if (data && data.type === 'timer') {
            if (data.status === 'running') {
                await startRunning(data)
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
    } catch (error) {
        console.log('error', error)
    }
})

// Native Commands Handler, listens to notification action buttons
messenger.on('stop', async msg => {
    debug && console.log('[React node] incoming Stop: ' + typeof msg, msg)
    try {
        await stopRunning()
    } catch (error) {
        debug && console.log('[Timer node] : Stop failed ' + error)
    }
})

messenger.on('start', async msg => {
    debug && console.log('[React node] incoming Start: ' + typeof msg, msg)
    try {
        if (running && running.status === 'running') await stopRunning()
        createTimer(msg.project) // emits 'running' which gets captured by the Remote Commands Listener
        // await startRunning(timer)
    } catch (error) {
        debug && console.log('[Timer node] : Create failed ' + error)
    }
})