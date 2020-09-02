import messenger from '../constants/Messenger'
import { timerValid } from '../constants/Validators'
import {trimSoul} from '../constants/Functions'
import * as chain from '../data/Chains'
import * as store from '../data/Store'
const { timerTrashState } = require('node/state/timerTrashState')

let debug = true
let state = {
    trash: []
}
timerTrashState({messenger, trimSoul, chain, store, debug, state})
