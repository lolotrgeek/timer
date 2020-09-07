/* eslint-disable no-unused-vars */
const { addMinutes, isValid, subDays, addDays } = require('../src/Functions')
const { timeRules, dateRules, totalTime, trimSoul, isRunning, dateSimple, settingCount, sameDay } = require('../src/Functions')
const messenger = require('../src/Messenger')
const Data = require('../src/Data')
const chain = require('../src/Chains')
const store = require('../src/Store')
const { timerState } = require('./timerState')


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
    timeRules, dateRules, totalTime, trimSoul, isRunning, dateSimple, settingCount, sameDay,
    messenger, Data, chain, store, debug, state, previous, current, project,
    setAlert, setTimer, setEnded, setStarted, setEnergy, setMood, setTotal
})