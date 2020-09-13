
import * as store from '../data/Store'
import { getTodaysCount, dateSimple, totalTime, settingCount, isRunning, multiDay, newEntryPerDay, trimSoul } from '../constants/Functions'
import { runCounter, stopCounter, setCount } from '../service/counter'
import { cloneTimer, doneTimer, newTimer } from '../data/Models'
import * as chain from '../data/Chains'
import messenger from '../constants/Messenger'
const { runningState } = require('node/state/runningState')

const debug = false

let running = {}
let runningproject = {}

runningState({store, messenger, chain, debug, cloneTimer, doneTimer, newTimer, getTodaysCount, dateSimple, totalTime, settingCount, isRunning, multiDay, newEntryPerDay, trimSoul, runCounter, stopCounter, setCount, running, runningproject})
