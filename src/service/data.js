/* eslint-disable no-unused-vars */
// mini browserified version of Data.js
import { trimSoul } from '../constants/Functions'
import * as store from '../data/Store.web'
import * as chain from '../data/Chains'

const debug = false

export const put = (key, value) => store.put(key, value)
export const set = (key, value) => store.set(key, value)
export const get = (key) => store.get(key)
export const getAll = (key) => store.getAll(key)
export const getAllOnce = (key) => store.getAllOnce(key)

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
      let dataFiltered = []
      store.chainer(chain.timers(), store.app).map().on((data, key) => {
        let foundData = trimSoul(data)
        if(foundData && foundData.project === projectId) dataFiltered.push(foundData)
        debug && console.log('[GUN node] getTimers Data Found: ', foundData)
      })
      debug && console.log('[GUN node] getTimers Data Resolving: ', dataFiltered)
      resolve(dataFiltered)
    } catch (error) {
      reject(error)
    }
  })
}