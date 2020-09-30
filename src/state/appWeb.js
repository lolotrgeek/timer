import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import * as store from '../data/Store'
import { trimSoul } from '../constants/Functions'
import { appState } from 'node/state/appState'

let debug = false
let state = {
    projects:[]
}

// TODO settings:
// user -> settings -> device name -> {colors, ...}
// device names [web. android, ios, desktop]
appState({ debug, state, messenger, chain, store, trimSoul })
