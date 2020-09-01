/* eslint-disable no-unused-vars */
const { parse, trimSoul } = require('../src/Functions')
const store = require('../src/Store')
const messenger = require('../src/Messenger')
const chain = require('../src/Chains')
const { timelineState } = require('./timelineState')

let debug = {
    state: true,
    data: true,
    listeners: true,
    parsing: true,
    sorting: true
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

timelineState({messenger, parse, trimSoul, store, chain, debug, all, pages, pagesize, days, currentday, page, currentPage, pagelocation})
