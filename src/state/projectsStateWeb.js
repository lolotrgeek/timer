import messenger from '../constants/Messenger'
import { projectValid } from '../constants/Validators'
import { trimSoul } from '../constants/Functions'
import * as chain from '../data/Chains'
import * as store from '../data/Store'
import {projectsState} from 'node/state/projectsState'
let debug = true
let state = {
    projects: []
}

projectsState({messenger, trimSoul, chain, store, debug, state})
