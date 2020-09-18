/* eslint-disable no-unused-vars */
const messenger = require('../src/Messenger')
const chain = require('../src/Chains')
const store = require('../src/Store')
const { appState } = require('./appState')

let debug = false
let state = {}

appState({messenger, chain, store, state, debug})