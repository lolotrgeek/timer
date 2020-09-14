
import * as store from '../data/Store'
import { getTodaysCount, dateSimple, totalTime, settingCount, isRunning, multiDay, newEntryPerDay, trimSoul, isValid, dateRules, timeRules, addMinutes } from '../constants/Functions'
import { runCounter, stopCounter, setCount } from '../service/counter'
import { cloneTimer, doneTimer, newTimer } from '../data/Models'
import * as chain from '../data/Chains'
import messenger from '../constants/Messenger'
const { runningState } = require('node/state/runningState')

const debug = false

let running = {}
let runningproject = {}
const setAlert = alert => messenger.emit('alert', alert)

runningState({
    store, messenger, chain, debug,
    cloneTimer,
    doneTimer,
    newTimer,
    getTodaysCount,
    dateSimple,
    totalTime,
    settingCount,
    isRunning,
    multiDay,
    newEntryPerDay,
    trimSoul,
    isValid,
    timeRules,
    setAlert,
    addMinutes,
    dateRules, 
    runCounter, stopCounter, setCount, running, runningproject
})
