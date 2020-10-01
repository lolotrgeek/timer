/* eslint-disable no-unused-vars */
const messenger = require('../src/Messenger')
const { colorValid, nameValid } = require('../src/Validators')
const chain = require('../src/Chains')
const store = require('../src/Store')
const { newProject } = require('../src/Models')
const { parse } = require('../src/Functions')
const { projectCreate } = require('./projectCreateState')

let debug = false
let state = {}
const setState = (key, value) => state[key] = value
const setAlert = alert => messenger.emit('alert', alert)

projectCreate({messenger, colorValid, nameValid, chain, store, newProject, parse, state, setState, debug, setAlert})