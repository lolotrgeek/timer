
import { addMinutes, isValid, sub, add, getMonth, getYear, getHours, getMinutes, getSeconds, getDate } from 'date-fns'
import { timeRules, dateRules, totalTime, trimSoul, isRunning, dateSimple, settingCount, sameDay } from '../constants/Functions'
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

const setAlert = alert => console.log(alert)
const setTimer = object => current.timer = object
const setEnded = date => current.ended = isValid(date) ? typeof date === 'string' ? date : date.toString() : current.ended
const setStarted = date => current.started = isValid(date) ? typeof date === 'string' ? date : date.toString() : current.started
const setEnergy = number => current.energy = number
const setMood = number => current.mood = number
const setTotal = number => current.total = number

timerState({
    addMinutes, isValid, sub, add, getMonth, getYear, getHours, getMinutes, getSeconds, getDate,
    timeRules, dateRules, totalTime, trimSoul, isRunning, dateSimple, settingCount, sameDay,
    messenger, Data, chain, store, debug, state, previous, current, project,
    setAlert, setTimer, setEnded, setStarted, setEnergy, setMood, setTotal
})