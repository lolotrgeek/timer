/* eslint-disable no-unused-vars */
const messenger = require('../src/Messenger')
const { trimSoul } = require('../src/Functions')
const chain = require('../src/Chains')
const store = require('../src/Store')
const { timerHistoryState } = require('./timerHistoryState')
let debug = false
let state = {
    edits: []
}

timerHistoryState({messenger, trimSoul, chain, store, debug, state})