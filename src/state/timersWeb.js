
import { trimSoul } from '../constants/Functions'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import * as store from '../data/Store'
const { timerListState } = require('node/state/timerListState')

let debug = true
let days = []

timerListState({debug, messenger, trimSoul, store, chain})