/* eslint-disable no-unused-vars */
const { totalTime, parse, trimSoul, isRunning, dayHeaders, dateSimple } = require('../src/Functions')
const store = require('../src/Store')
const messenger = require('../src/Messenger')
const chain = require('../src/Chains')
const { projectState } = require('./projectState')

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
    dateSimple,
    store,
    messenger,
    chain,
    debug,
    state,
    current
})