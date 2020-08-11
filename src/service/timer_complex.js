/* eslint-disable no-unused-vars */

import * as store from './store'
import { getTimers, getProject } from './data'
import { timerRanToday, totalTime, parse, isRunning, multiDay, newEntryPerDay } from '../constants/Functions'
import {runCounter, stopCounter, setCount } from './counter'
import { cloneTimer, doneTimer, newTimer } from '../data/Models'
import * as chain from '../data/Chains'
import messenger from '../constants/Messenger'
const debug = true

let lastrun = { id: 'none' }
let running = { id: 'none' }

messenger.on('getlastRun', msg => {
    messenger.emit('lastRun', lastrun)
})
messenger.on('getRunning', msg => {
    messenger.emit('running', running)
})

/**
 * Total count of timers that ran today 
 * @param {string} projectId 
 */
const countTimersToday = projectId => new Promise((resolve, reject) => {
    getTimers(projectId).then(timers => {
        debug && console.log(`Counting Timers Today ${typeof timers} `, timers)
        let TOTAL
        timers.map(foundTimer => {
            // debug && console.log(`Got count timer ${typeof foundTimer}`, foundTimer)
            if (timerRanToday(foundTimer)) {
                let TIMERTOTAL = totalTime(foundTimer.started, foundTimer.ended)
                debug && console.log(`Got count ${foundTimer.project}/${foundTimer.id} , ${TIMERTOTAL}`)
                TOTAL = TOTAL + TIMERTOTAL
                debug && console.log('Updating count ', TIMERTOTAL)
            }
        })
        resolve(TOTAL)
    }).catch(err => reject(err))
})
/**
 * Get the count to pass along to the counter
 * @param {*} timer 
 */
const getCount = timer => new Promise((resolve, reject) => {
    if (!timer) reject('Unable to getCount: no running timer')
    else if (running && lastrun.project !== timer.project) {
        debug && console.log(`finding count ${running.project} != ${timer.project}`)
        setCount(0)
        countTimersToday(running.project).then(counted => {setCount(counted); resolve(counted)}).catch(err => reject('Unable to countTimersToday:', err))
    }
    else if (lastrun.id !== 'none' && lastrun.project === timer.project) {
        debug && console.log(`same count ${lastrun.project} = ${timer.project}`)
        resolve()
    }
    else {
        debug && console.log(`new count ${timer.project}`)
        setCount(0)
        resolve()
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
    if (running && running.status === 'running') {
        stopCounter()
        finishTimer(running)
        // listen for finished Timer
        messenger.on(chain.timer(running.id), event => {
            if (event.id === running.id) {
                debug && console.log('[NODE_DEBUG_PUT] : Running Timer Stopped ', event)
                console.log('lastrun', lastrun.id)
                resolve(event)
            } else {
                reject('[Timer node] : Stop failed ', event)
            }
        })
    }
})

const startRunning = timer => new Promise(async (resolve, reject) => {
    try {
        await getCount(timer)
        running = timer
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
        await stopRunning()
        createTimer(msg.project) // emits 'running' which gets captured by the Remote Commands Listener
        // await startRunning(timer)
        console.log('lastrun', lastrun.id)
    } catch (error) {
        debug && console.log('[Timer node] : Create failed ' + error)
    }
})


// DATA
export const createTimer = (project) => {
    if (!project || typeof project !== 'object' || !project.id || project.id.length < 9) return false
    debug && console.log('[react Data] Creating Timer', project)
    let timer = newTimer(project.id)
    timer.name = project.name
    timer.color = project.color
    debug && console.log('[react Data] Created Timer', timer)
    store.put(chain.running(), timer)
    store.set(chain.timerHistory(timer.id), timer)
    return timer
}

const endTimer = (timer) => {
    debug && console.log('[react Data] Ending', timer)
    store.set(chain.timerHistory(timer.id), timer)
    store.put(chain.timer(timer.id), timer)
    store.set(chain.projectTimer(timer.project, timer.id), timer)
    store.set(chain.dateTimer(timer.started, timer.id), timer)
}

/**
 * Generates a new timer using the given timer model
 * @param {String} projectId project hashid
 */
const addTimer = timer => {
    const clonedTimer = cloneTimer(timer)
    debug && console.log('[node Data] Storing Timer', clonedTimer)
    endTimer(clonedTimer)
}

const finishTimer = (timer) => {
    if (isRunning(timer)) {
        debug && console.log('[react Data STOP] Finishing', timer)
        let done = doneTimer(timer)
        running = done
        lastrun = done
        messenger.emit('lastrun', done)
        store.put(chain.running(), done)
        // Danger zone until endTimer is called
        if (multiDay(done.started, done.ended)) {
            const dayEntries = newEntryPerDay(done.started, done.ended)
            dayEntries.map((dayEntry, i) => {
                let splitTimer = done
                splitTimer.started = dayEntry.start
                splitTimer.ended = dayEntry.end
                debug && console.log('[react Data] Split', i, splitTimer)
                if (i === 0) { endTimer(splitTimer) } // use initial timer id for first day
                else { addTimer(splitTimer) }
                return splitTimer
            })
        } else {
            endTimer(done)
        }
    } else { return timer }
}