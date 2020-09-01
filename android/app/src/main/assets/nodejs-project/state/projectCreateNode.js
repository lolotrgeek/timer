/* eslint-disable no-unused-vars */
const messenger = require('../src/Messenger')
const { colorValid, nameValid } = require('../src/Validators')
const chain = require('../src/Chains')
const store = require('../src/Store')
const { newProject } = require('../src/Models')
const { parse } = require('../src/Functions')

const { projectCreate } = require('./projectCreateState')

let debug = true
let state = {}
const setState = (key, value) => state[key] = value

projectCreate({messenger, colorValid, nameValid, chain, store, newProject, parse, state, setState, debug})