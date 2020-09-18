import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import * as store from '../data/Store'
import { trimSoul } from '../constants/Functions'
import { appState } from 'node/state/appState'

let debug = false
let state = {
    projects:[]
}


appState({ debug, state, messenger, chain, store, trimSoul })
