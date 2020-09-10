import messenger from '../constants/Messenger'
import { colorValid, nameValid, projectValid } from '../constants/Validators'
import { trimSoul } from '../constants/Functions'
import * as chain from '../data/Chains'
import * as store from '../data/Store'
import { projectEditState } from 'node/state/projectEditState'
let debug = false
let state = {
    edit: {},
    original: {}
}

projectEditState({ messenger, colorValid, nameValid, projectValid, trimSoul, chain, store, debug, state })
