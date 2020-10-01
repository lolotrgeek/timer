const messenger = require('../src/Messenger')
const { colorValid, nameValid, projectValid } = require('../src/Validators')
const { trimSoul } = require('../src/Functions')
const chain = require('../src/Chains')
const store = require('../src/Store')
const {projectEditState} = require('./projectEditState')
let debug = false
let state = {
    edit: {},
    original: {}
}
const setAlert = alert => messenger.emit('alert', alert)

projectEditState({messenger, colorValid, nameValid, projectValid, trimSoul, chain, store, debug, state, setAlert})