
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
import * as Data from '../data/Data'
import * as chain from '../data/Chains'
import * as store from '../data/Store'
const { timerState } = require('node/state/timerState')

let debug = true
// STATE
let state = {}
let previous = {}
let current = {}
let project = {}

const setAlert = alert => console.log('[Alert]', alert)
const setTimer = object => current.timer = object
const setEnded = date => current.ended = isValid(date) ? typeof date === 'string' ? date : date.toString() : current.ended
const setStarted = date => current.started = isValid(date) ? typeof date === 'string' ? date : date.toString() : current.started
const setEnergy = number => current.energy = number
const setMood = number => current.mood = number
const setTotal = number => current.total = number

timerState({
    addMinutes, isValid, subDays, addDays,
    timeRules, dateRules, totalTime, trimSoul, isRunning, dateSimple, settingCount, sameDay, toDate,
    messenger, Data, chain, store, debug, state, previous, current, project,
    setAlert, setTimer, setEnded, setStarted, setEnergy, setMood, setTotal
})