const { newEntry } = require('../src/Models')
const timerEntryState = require('./timerEntryState')
const messenger = require('../src/Messenger')

timerEntryState({messenger, newEntry})