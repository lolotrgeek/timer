import messenger from '../constants/Messenger'
import { projectValid } from '../constants/Validators'
import {trimSoul} from '../constants/Functions'
import * as chain from '../data/Chains'
import * as store from '../data/Store'
import {projectHistoryState} from 'node/state/projectHistoryState'
let debug = true
let state = {
    edits: []
}
projectHistoryState({messenger, trimSoul, chain, store, debug, state})
