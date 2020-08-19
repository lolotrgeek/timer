/* eslint-disable no-unused-vars */

import * as store from './store'
import { getTodaysCount, dateSimple, totalTime, settingCount, parse, isRunning, multiDay, newEntryPerDay, trimSoul } from '../constants/Functions'
import { runCounter, stopCounter, setCount } from './counter'
import { cloneTimer, doneTimer, newTimer } from '../data/Models'
import * as chain from '../data/Chains'
import messenger from '../constants/Messenger'
const debug = true

let running = { id: 'none' }
let runningproject = {id: 'none'}

messenger.on('getRunning', () => {
    messenger.emit('running', running)
})

const stopRunning = async () => {
    try {
        if (running && running.status === 'running') {
            stopCounter()
            await finishRunning(running, runningproject)
        }
    } catch (error) {
        debug && console.log('[Timer node] : Stop failed ' + error)
    }

}

// Commands Listener, listens to finishTimer or createTimer
store.chainer('running', store.app).on((data, key) => {
    try {
        data = parse(data)
        if (data && data.type === 'timer') {
            if (data.status === 'running') {
                running = data
                if(running && running.id !== 'none') setCount(running.count)
                runCounter()
            }
            else if (data.status === 'done' && data.id === running.id) {
                debug && console.log('[STOP] running stopped')
                running = data
                stopCounter()
            }
            else if (data.id === 'none') {
                debug && console.log('[STOP] running cleared')
                running = data
                stopCounter()
            }
            else {
                debug && console.log('[STOP] running timer')
                running = { id: 'none', status: 'done' }
                stopCounter()
            }
        }
    } catch (error) {
        console.log('error', error)
    }
})

// Native Command Handlers
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
        if (!msg || typeof msg !== 'object' || !msg.projectId) return false
        runningproject = await getProject(msg.projectId)
        await createRunning(runningproject) // emits 'running' which gets captured by the Commands Listener
    } catch (error) {
        debug && console.log('[Timer node] : Create failed ' + error)
    }
})


// DATA
/**
 * creates a running timer entry
 * @param {Object} project 
 */
const createRunning = project => new Promise((resolve, reject) => {
    if (!project || typeof project !== 'object' || !project.id || project.id.length < 9) reject('invalid project')
    let timer = newTimer(project.id)
    console.log('last run: ', project.lastrun , project.lastcount)
    timer.name = project.name
    timer.color = project.color
    timer.count = project.lastrun && project.lastcount ? getTodaysCount(project.lastrun, project.lastcount) : 0
    debug && console.log('[react Data] Created Timer', timer)
    store.put(chain.running(), timer)
    store.set(chain.timerHistory(timer.id), timer) // TODO: might be un-necessary...
    resolve(timer)
})


/**
 * creates and updates entries to end a timer
 * @param {*} timer 
 */
const endTimer = (timer, project) => new Promise((resolve, reject) => {
    if (!timer|| timer.id === 'none') reject('no timer')
    else if(!project || project.id === 'none') reject('no project')
    debug && console.log('[react Data] Ending', timer)
    let endproject = project
    endproject.lastcount = settingCount(timer, project)
    endproject.lastrun = dateSimple(new Date())
    let endtimer = timer
    endtimer.total = totalTime(timer.started, timer.ended)
    debug && console.log('[react Data] storing count', endproject.lastrun, endproject.lastcount)
    debug && console.log('[react Data] storing endtimer', endtimer)
    store.put(chain.project(endproject.id), endproject)
    store.set(chain.timerHistory(timer.id), endtimer)
    store.put(chain.timerDate(timer.started, endtimer.id), true) // maybe have a count here?
    store.put(chain.timer(timer.id), endtimer)
    store.put(chain.projectDate(timer.started, endproject.id), endproject)
    store.put(chain.projectTimer(timer.project, timer.id), endtimer)
    resolve(timer)
})

/**
 * Generates a new timer using the given timer model
 * @param {String} projectId project hashid
 */
const addTimer = (timer, project) => new Promise(async (resolve, reject) => {
    if (!timer) reject('no timer to add')
    const clonedTimer = cloneTimer(timer)
    debug && console.log('[node Data] Storing Timer', clonedTimer)
    await endTimer(clonedTimer, project)
    resolve(clonedTimer)
})

const finishRunning = (timer, project) => new Promise(async (resolve, reject) => {
    if (isRunning(timer)) {
        debug && console.log('[react Data STOP] Finishing', timer)
        let done = doneTimer(timer)
        store.put(chain.running(), done)
        // Danger zone until endTimer is called
        if (multiDay(done.started, done.ended)) {
            const dayEntries = newEntryPerDay(done.started, done.ended)
            dayEntries.map(async (dayEntry, i) => {
                let splitTimer = done
                splitTimer.started = dayEntry.start
                splitTimer.ended = dayEntry.end
                debug && console.log('[react Data] Split', i, splitTimer)
                if (i === 0) { await endTimer(splitTimer, project) } // use initial timer id for first day
                else { await addTimer(splitTimer, project) }
                resolve(splitTimer)
            })
        } else {
            await endTimer(done, project)
            resolve(done)
        }
    } else { reject('Timer not running.') }
})

const getProject = (projectId) => {
    return new Promise((resolve, reject) => {
        if (!projectId) reject('no projectId passed')
        try {
            store.chainer(chain.project(projectId), store.app).once((data, key) => {
                const foundData = trimSoul(data)
                //   debug && console.log('[GUN node] getProject Data Found: ', foundData)
                if (foundData && foundData.type === 'project') {
                    resolve(foundData)
                }

            })
        } catch (error) {
            debug && console.debug && console.log(error)
            reject(error)
        }
    })
}
