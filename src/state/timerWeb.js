
import { timeRules, 
    dateRules, 
    totalTime, 
    trimSoul, 
    isRunning, 
    dateSimple, 
    settingCount, 
    sameDay, 
    addMinutes, 
    isValid, 
    subDays, 
    addDays, 
     toDate  } from '../constants/Functions'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import * as store from '../data/Store'
import { newEntry } from '../data/Models'
const { timerState } = require('node/state/timerState')

let debug = false
// STATE
let state = {}
let previous = {}
let current = {}
let project = {}

// const setAlert = alert => console.log('[Alert]', alert)
const setAlert = alert => messenger.emit('alert', alert)
const setTimer = object => current.timer = object
const setEnded = date => current.ended = isValid(date) ? typeof date === 'string' ? date : date.toString() : current.ended
const setStarted = date => current.started = isValid(date) ? typeof date === 'string' ? date : date.toString() : current.started
const setEnergy = number => current.energy = number
const setMood = number => current.mood = number
const setTotal = number => current.total = number

timerState({
    addMinutes, isValid, subDays, addDays,
    timeRules, dateRules, totalTime, trimSoul, isRunning, dateSimple, settingCount, sameDay, toDate,
    messenger, chain, store, debug, state, previous, current, project, newEntry,
    setAlert, setTimer, setEnded, setStarted, setEnergy, setMood, setTotal
})