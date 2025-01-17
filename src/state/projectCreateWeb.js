import messenger from '../constants/Messenger'
import { colorValid, nameValid } from '../constants/Validators'
import * as chain from '../data/Chains'
import * as store from '../data/Store'
import { newProject } from '../data/Models'
import { projectCreate } from 'node/state/projectCreateState'

let debug = false
let state = {}
const setState = (key, value) => state[key] = value
const parse = input => input
const setAlert = alert => messenger.emit('alert', alert)

projectCreate({ messenger, colorValid, nameValid, chain, store, newProject, parse, state, setState, debug, setAlert })

