/* eslint-disable no-unused-vars */
const { addMinutes, isValid, subDays, addDays } = require('../src/Functions')
const { timeRules, dateRules, totalTime, trimSoul, isRunning, dateSimple, settingCount, sameDay } = require('../src/Functions')
const messenger = require('../src/Messenger')
const chain = require('../src/Chains')
const store = require('../src/Store')
const { timerState } = require('./timerState')
const { newEntry } = require('../src/Models')

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
    timeRules, dateRules, totalTime, trimSoul, isRunning, dateSimple, settingCount, sameDay,
    messenger, chain, store, debug, state, previous, current, project, newEntry,
    setAlert, setTimer, setEnded, setStarted, setEnergy, setMood, setTotal
})