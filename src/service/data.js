/* eslint-disable no-unused-vars */
// mini nodeified version of Data.js
import { multiDay, newEntryPerDay, isRunning, parse, trimSoul } from '../constants/Functions'
import { cloneTimer, newTimer, doneTimer } from '../data/Models'
import * as store from '../data/Store.web'
import * as chain from '../data/Chains'

const debug = true

const put = (key, value) => store.put({ key: key, value: JSON.stringify(value) })
const set = (key, value) => store.set({ key: key, value: JSON.stringify(value) })
const get = (key) => store.get(key)
const getAll = (key) => store.getAll(key)
const getAllOnce = (key) => store.getAllOnce(key)

export const createTimer = (projectId) => {
  if (!projectId || typeof projectId !== 'string' || projectId.length < 9) return false
  debug && console.log('Creating Timer', projectId)
  let timer = newTimer(projectId)
  debug && console.log('Created Timer', timer)
  put(chain.running(), timer)
  debug && console.log('Success! Created Timer.')
  set(chain.timerHistory(timer.id), timer)
  return timer
}

export const endTimer = (timer) => {
  debug && console.log('Ending', timer)
  set(chain.timerHistory(timer.id), timer)
  put(chain.timer(timer.id), timer)
  set(chain.projectTimer(timer.project, timer.id), timer)
  set(chain.dateTimer(timer.started, timer.id), timer)
}

/**
 * Generates a new timer using the given timer model
 * @param {String} projectId project hashid
 */
export const addTimer = timer => {
  const clonedTimer = cloneTimer(timer)
  debug && console.log('[node Data] Storing Timer', clonedTimer)
  endTimer(clonedTimer)
}

export const finishTimer = (timer) => {
  if (isRunning(timer)) {
    let done = doneTimer(timer)
    debug && console.log('[node Data STOP]', done)
    put(chain.running(), done)
    // Danger of data loss until endTimer is called
    if (multiDay(done.started, done.ended)) {
      const dayEntries = newEntryPerDay(done.started, done.ended)
      dayEntries.map((dayEntry, i) => {
        let splitTimer = done
        splitTimer.started = dayEntry.start
        splitTimer.ended = dayEntry.end
        debug && console.log('Split', i, splitTimer)
        if (i === 0) { endTimer(splitTimer) } // use initial timer id for first day
        else { addTimer(splitTimer) }
        return splitTimer
      })
    } else { endTimer(done) }
  } else { return timer }
}

/**
 * 
 * @param {string} projectId 
 * @param {function} handler 
 */
export const getProject = (projectId) => {
  return new Promise((resolve, reject) => {
    if(!projectId) reject('no projectId passed')
    try {
      store.chainer(chain.project(projectId), store.app).once((data, key) => {
        const foundData = trimSoul(data)
        debug && console.log('[GUN node] getProject Data Found: ', foundData)
        resolve(foundData)
      })
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

/**
 * 
 * @param {string} projectId 
 * @param {function} handler 
 */
export const getProjectCompat = (projectId, handler) => {
  get(chain.project(projectId))
  store.channel.addListener(chain.project(projectId), handler)
}

/**
 * Get timers today, filter out timers not in project
 * @param {*} projectId 
 */
export const getTimers = (projectId) => {
  return new Promise((resolve, reject) => {
    try {
      store.chainer(chain.timers(), store.app).once((data, key) => {
        const foundData = trimSoul(data)
        debug && console.log('[GUN node] getTimers Data Found: ', foundData)
        let dataFiltered = []
        let id; for (id in foundData) {
          let item = parse(foundData[id])
          debug && console.log('getTimers item', item)
          if (item['project'] === projectId) {
            dataFiltered.push(item)
          }
        }
        debug && console.log('[GUN node] getTimers Data Resolving: ', dataFiltered)
        resolve(dataFiltered)
      })
      // console.log('[React node] Chain :', chain)
      // chain.once((data, key) => resolve(data))
    } catch (err) {
      reject(err)
    }

  })
}

/**
 * Gets every timer in DB, then filters
 * @param {*} projectId 
 */
export const getTimersFiltered = (projectId) => {
  return new Promise((resolve, reject) => {
    try {
      store.chainer(chain.timers(), store.app).once((data, key) => {
        const foundData = trimSoul(data)
        debug && console.log('[GUN node] getTimers Data Found: ', foundData)
        let dataFiltered = []
        let id; for (id in foundData) {
          let item = parse(foundData[id])
          debug && console.log('getTimers item', item)
          if (item['project'] === projectId) {
            dataFiltered.push(item)
          }
        }
        debug && console.log('[GUN node] getTimers Data Resolving: ', dataFiltered)
        resolve(dataFiltered)
      })
      // console.log('[React node] Chain :', chain)
      // chain.once((data, key) => resolve(data))
    } catch (err) {
      reject(err)
    }

  })
}

export const getRunning = handler => {
  getAll(chain.running())
  store.channel.addListener(chain.running(), handler)
}
