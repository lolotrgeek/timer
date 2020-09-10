/* eslint-disable no-unused-vars */
const messenger = require('../src/Messenger')
const {trimSoul} = require('../src/Functions')
const chain = require('../src/Chains')
const store = require('../src/Store')
const {projectHistoryState} = require('./projectHistoryState')
let debug = false
let state = {
    edits: []
}

projectHistoryState({messenger, trimSoul, chain, store, debug, state})