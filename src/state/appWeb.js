import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import * as store from '../data/Store'
import {appState} from 'node/state/appState'

let debug = false
let state = {}


appState({debug, state, messenger, chain, store})
