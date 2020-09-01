/* eslint-disable no-unused-vars */
const messenger = require('../src/Messenger')
const { trimSoul } = require('../src/Functions')
const chain = require('../src/Chains')
const store = require('../src/Store')
const { projectTrashState } = require('./projectTrashState')
let debug = true
let state = {
    trash: []
}

projectTrashState({ messenger, trimSoul, chain, store, debug, state })