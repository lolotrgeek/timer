import { totalTime, parse, trimSoul, isRunning, isToday } from '../constants/Functions'
import * as store from '../data/Store'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'

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

// LISTENERS
messenger.on(chain.timerDates(), event => {
    if (!event) return
    let item = parse(event)
    if (item && typeof item === 'object') {
        let found = Object.keys(item)
        days = found.sort((a, b) => new Date(b) - new Date(a))
        debug && console.log('found dates: ', days)
        // days.forEach(day => messenger.addListener(chain.timerDate(day), event => timersInDayHandler(event, { day })))
    }
})
store.getAllOnce(chain.timerDates())

// messenger.on('running', msg => {
//     console.log('pages:', pages)
//     let indextoday = pages.findIndex(page => isToday(new Date(page.title)))
//     console.log('today?', indextoday)

//     if (indextoday >= 0) {
//         let sectiontoday = pages[indextoday]
//         console.log('timer section today ', sectiontoday)
//         let index = sectiontoday.data.findIndex(project => project.id === msg.project)
//         // pages.splice(indextoday, 1) 
//         sectiontoday.splice(index, 1) // remove running project from section in page
//         messenger.emit('pages', pages)
//     }
// })


messenger.on("pagelocation", msg => {
    if (msg) {
        pagelocation.x = msg.x
        pagelocation.y = msg.y
        debug.listeners && console.log(pagelocation.y)
    }
})
messenger.on("getPage", msg => getPage(msg))

/**
 * parses msg and sets the page to get
 * @param {*} msg 
 * @param {*} msg.pagesize nubmer of sections per page
 * @param {boolean} msg.all get all found pages 
 * @param {*} msg.refresh rebuild pages
 * @param {*} msg.currentday 
 */
const getPage = (msg) => {
    if (msg) {
        pagesize = msg.pagesize
        debug.listeners && console.log('[Listener] getPage received', msg)
        if (msg.currentday === 0) {
            if (msg.all) {
                all = msg.all
            }
            if (msg.refresh) {
                currentday = 0
                debug.listeners && console.log('[Listener] refreshing pages.')
                createPage()
            }
            else if (pages && pages.length === 0) {
                currentday = 0
                debug.listeners && console.log('[Listener] getting pages.')
                createPage()
            } else {
                debug.listeners && console.log('[Listener] updating pages.')
                messenger.emit("pages", pages)
                debug.listeners && console.log('[Listener] locating...', pagelocation.y)
                messenger.emit('timelinelocation', pagelocation)
            }
        }
        else if (msg.currentday > 0) {
            if (msg.currentday > currentday) {
                currentday = msg.currentday
            } else {
                currentday = currentday + 1
            }
            debug.listeners && console.log('[Listener] adding pages.')
            createPage()
        }
    }
}

// STATE

/**
 * populate an array of sections
 *  
 * page
 * `[{title: 'dd-mm-yyyy', data: [{timer}, {timer}, ...]}, ...]`
 * 
 */
const createPage = () => {
    let day = days[currentday]
    debug.state && console.log(`[State] day: ${currentday}/${days.length} [${day}], timer: ${page.length}/${pagesize} `)

    if (currentday >= days.length) {
        debug.state && console.log('[State] No more days with full pages.')
        if (page.length > 0) {
            debug.state && console.log('[State] Last Page ' + currentPage + ' Complete.')
            setPage()
        }
        return
    }
    else if (day && page.length >= pagesize) {
        debug.state && console.log('[State] Page ' + currentPage + ' Complete.')
        setPage()
    }
    else if (day) {
        debug.state && console.log('[State] Create Page.')
        getTimersInDay(day)

    } else {
        return
    }

}

/**
 * add page to pages
 */
const setPage = () => {
    messenger.emit('page', page)
    pages.push(page)
    page = []
    currentPage++
}

/**
 * Add section and setup next
 * @param {Object} section 
 * @param {String} section.title 
 * @param {Array} section.data 
 */
const addSection = (section) => new Promise((resolve, reject) => {
    let alreadyInTimers = page.some(entry => entry.title === section.title)
    if (alreadyInTimers) reject('section already in timeline')
    //TODO: optimize, sometimes adding a random timer at beginning of new page... we filter that out here
    if (!alreadyInTimers && days[currentday] === section.title) {
        debug.state && console.log('[State] Adding Section: ', section)
        if (section.data.length > 0) {
            page.push(section)
        }
        currentday++
        createPage()
        resolve()
    }
})


// PARSING
/**
 * get timer entries for the `day`
 * @param {string} day simpledate `dd-mm-yyyy`
 */
const getTimersInDay = async day => {
    try {
        let event = await getProjectDates(day)
        let item = parse(event)
        debug.parsing && console.log('[Parsing] projectDates.', item)
        if (item && typeof item === 'object') {
            let section = { title: day, data: item }
            await addSection(section)
        }
    } catch (error) {
        console.log(error)
    }
}

// DATA

/**
* 
* @param {string} day simpledate `dd-mm-yyyy` 
*/
const getProjectDates = (day) => new Promise((resolve, reject) => {
    try {
        let result = []
        store.chainer(chain.projectDates(day), store.app).map().on((data, key) => {
            if (!data) {
                debug.data && console.log('[GUN node] getProjectDates No Data Found',)
            }
            let foundData = trimSoul(data)
            if(foundData.type === 'project' && foundData.status === 'active') {
                result.push(foundData)
            }
            debug.data && console.log('[GUN node] getProjectDates Data Found: ', key, foundData)
        })
        resolve(result)
    } catch (err) {
        reject(err)
    }

})
