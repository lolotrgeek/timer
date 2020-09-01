import { totalTime, parse, trimSoul, isRunning, dayHeaders, dateRules, dateSimple } from '../constants/Functions'
import * as store from '../data/Store'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import { projectState } from 'node/state/projectState'
let debug = {
    state: false,
    data: false,
    listeners: false,
    parsing: false,
    sorting: false
}

let state = {}
let current = {} // current project in view state

projectState({
    totalTime,
    parse,
    trimSoul,
    isRunning,
    dayHeaders,
    dateRules,
    dateSimple,
    store,
    messenger,
    chain,
    debug,
    state,
    current
})