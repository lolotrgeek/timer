/* eslint-disable no-unused-vars */
const messenger = require('../src/Messenger')
const { trimSoul } = require('../src/Functions')
const chain = require('../src/Chains')
const store = require('../src/Store')
const { projectsState} = require('./projectsState')
let debug = false
let state = {
    projects: []
}

projectsState({messenger, trimSoul, chain, store, debug, state})