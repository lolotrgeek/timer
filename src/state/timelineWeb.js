import * as store from '../data/Store'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import {parse, trimSoul} from '../constants/Functions'
const { timelineState } = require('node/state/timelineState')

let debug = {
    state: false,
    data: true,
    listeners: false,
    parsing: false,
    sorting: false
}

let
    all = false, // a toggle for dumping entire set of pages
    pages = [],
    pagesize = 5, // number of timers per `page`
    days = [], // set of days containing timers
    currentday = 0, // last day where timers were retrieved
    page = [], // set of timers sectioned by day
    currentPage = 1,
    pagelocation = { x: 0, y: 0 }
;
timelineState({ messenger, parse, trimSoul, store, chain, debug, all, pages, pagesize, days, currentday, page, currentPage, pagelocation })
