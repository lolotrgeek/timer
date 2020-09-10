import messenger from '../constants/Messenger'
import { trimSoul } from '../constants/Functions'
import * as chain from '../data/Chains'
import * as store from '../data/Store'
const { timerHistoryState } = require('node/state/timerHistoryState')

let debug = false
let state = {
    edits: []
}

timerHistoryState({messenger, trimSoul, chain, store, debug, state})
