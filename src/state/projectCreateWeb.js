import messenger from '../constants/Messenger'
import { colorValid, nameValid } from '../constants/Validators'
import * as chain from '../data/Chains'
import * as store from '../data/Store'
import { newProject } from '../data/Models'
import { projectCreate } from 'node/state/projectCreateState'

let debug = true
let state = {}
const setState = (key, value) => state[key] = value
const parse = input => input

projectCreate({ messenger, colorValid, nameValid, chain, store, newProject, parse, state, setState, debug })

