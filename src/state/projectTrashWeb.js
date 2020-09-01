import messenger from '../constants/Messenger'
import { projectValid } from '../constants/Validators'
import {trimSoul} from '../constants/Functions'
import * as chain from '../data/Chains'
import * as store from '../data/Store'
import {projectTrashState} from 'node/state/projectTrashState'
let debug = true
let state = {
    trash: []
}
projectTrashState({ messenger, trimSoul, chain, store, debug, state })
