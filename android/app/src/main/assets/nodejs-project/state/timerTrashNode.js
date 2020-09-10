/* eslint-disable no-unused-vars */
const messenger = require('../src/Messenger')
const {trimSoul} = require('../src/Functions')
const chain = require('../src/Chains')
const store = require('../src/Store')
const { timerTrashState } = require('./timerTrashState')
let debug = false
let state = {
    trash: []
}

timerTrashState({messenger, trimSoul, chain, store, debug, state})