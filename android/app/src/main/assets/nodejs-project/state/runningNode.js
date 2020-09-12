/* eslint-disable no-async-promise-executor */
/* eslint-disable no-unused-vars */

const store = require('../src/Store')
const messenger = require('../src/Messenger')
const chain = require('../src/Chains')
const { cloneTimer, doneTimer, newTimer } = require('../src/Models')
const { getTodaysCount, dateSimple, totalTime, settingCount, isRunning, multiDay, newEntryPerDay, trimSoul } = require('../src/Functions')
const { runCounter, stopCounter, setCount } = require('../counter')
const {runningState} = require('./runningState')

const debug = false

let running = {}
let runningproject = {}

runningState({store, messenger, chain, cloneTimer, doneTimer, newTimer, getTodaysCount, dateSimple, totalTime, settingCount, isRunning, multiDay, newEntryPerDay, trimSoul, runCounter, stopCounter, setCount, running, runningproject})