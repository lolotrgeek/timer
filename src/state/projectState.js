import { totalTime, simpleDate, sumProjectTimers, nextDay, parse, trimSoul } from '../constants/Functions'
import * as Data from '../data/Data'
import * as store from '../data/Store'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'

// TODO: page position retained after navigation
// TODO: test remote updating
// TODO: fix replicated sections at beginning of new page

let debug = true
let pages = []
let pagesize = 5 // number of timers per `page`
let days = [] // set of days containing timers
let currentday = 0 // last day where timers were retrieved
let page = [] // set of timers sectioned by day
let running = { id: 'none', name: 'none', project: 'none' }
let currentPage = 1
let pagelocation = { x: 0, y: 0 }
let project = { id: 'none' }
let retries = 0


const daylistHandler = (event) => {
    if (!event) return
    let item = parse(event)
    debug && console.log('get dates ' + typeof item, item)
    if (item && typeof item === 'object') {
        let found = Object.keys(item)
        debug && console.log('found dates: ', found)
        days = found.sort((a, b) => new Date(b) - new Date(a))
        // days.forEach(day => messenger.addListener(chain.timersInDay(day), event => timersInDayHandler(event, { day })))
    }
}

// request days with timers
messenger.on(chain.timerDates(), event => daylistHandler(event))
store.getAllOnce(chain.timerDates())

messenger.on("projectpagelocation", msg => {
    if (msg) {
        pagelocation.x = msg.x
        pagelocation.y = msg.y
        console.log(pagelocation.y)
    }
})


// messenger.on("getProjectPage", msg => {
//     debug && console.log('getpage received')
//     if (msg) {
//         pagesize = msg.pagesize
//         getPage(project)
//     }
// })


messenger.on("getProjectPages", msg => {
    if (msg) {
        console.log('getPages received')
        pagesize = msg.pagesize
        if (project.id === 'none') {
            getProject(msg.projectId).then(foundproject => {
                project = foundproject
                handleProjectPages(msg)
            })
        } else {
            console.log('Project: ', project)
            handleProjectPages(msg)
        }
    }
})
const handleProjectPages = msg => {
    if (msg.current) {
        if (msg.current.length === 0) {
            if (pages && pages.length === 0) {
                currentday = 0
                debug && console.log('getting pages.')
                getPage()
            } else {
                debug && console.log('updating pages.')
                messenger.emit("projectpages", pages)
                console.log('locating...', pagelocation.y)
                messenger.emit('projectlocation', pagelocation)
            }
        }
        else {
            currentday = msg.current.length
            debug && console.log('getting pages.')
            getPage()
        }
    }
}

const getPage = () => {
    // app reports page size, this gets number of timers until page size is full, sends as `page`
    // TODO: needs a last page function to handle when last page might not be full
    let day = days[currentday]
    console.log(`day: ${currentday}/${days.length} [${day}], timer: ${page.length}/${pagesize} `)

    if (currentday >= days.length) {
        debug && console.log('No more days with full pages.')
        // put any remaining timers into the last page
        if(page.length > 0) {
            console.log('Last Page ' + currentPage + ' Complete.')
            messenger.emit('projectpage', page)
            pages.push(page)
            page = []
            currentPage++
        }
        return
    }
    else if (page.length >= pagesize) {
        console.log('Page ' + currentPage + ' Complete.')
        messenger.emit('projectpage', page)
        pages.push(page)
        page = []
        currentPage++
    }
    else {
        debug && console.log('Getting Timers for Page.', page)
        timersInDayHandler(day)
    }
}



const timersInDayHandler = (day) => {
    getDayTimers(day).then(event => {
        debug && console.log('[react] msg timers get: ', event)
        let item = parse(event)
        if (typeof item === 'object') {
            let section = { title: day, data: [] }
            let id; for (id in item) {
                let found = parse(item[id])
                if (found.type === 'timer' && found.project === project.id) {
                    parseDayTimers(found, section, project)
                }
            }
        }
    })
}

const parseDayTimers = (found, section, project) => {
    debug && console.log('timers get ' + typeof found + ' ', found)
    // duplicate/edit check
    let data = section.data
    let alreadyInSection = data.some(timer => timer.id === found.id)
    if (!alreadyInSection && found.status === 'done') {
        addSection({ title: section.title, data: sortDayTimers(found, data) })
    }
    // running check
    else if (found.status === 'running') {
        running = found
    }
    else if (found.status === 'done' && found.id === running.id) {
        debug && console.log('[react] Setting last run Timer.')
        debug && console.log(found)
        running = found
    }

}
const sortDayTimers = (found, data) => {
    found.total = totalTime(found.started, found.ended)
    let newdata = data
    newdata.push(found)
    return newdata
}


const addSection = (section) => {
    let alreadyInTimers = page.some(entry => entry.title === section.title)
    //TODO: optimize, sometimes adding a random timer at beginning of new page... we filter that out here
    if (!alreadyInTimers && section.data.length > 0 && days[currentday] === section.title) {
        // console.log(currentday, days[currentday], section.title)
        console.log(section)
        page.push(section)
        currentday++
        getPage()
    }
}

const getProject = (projectId) => {
    return new Promise((resolve, reject) => {
        if (!projectId) reject('no projectId passed')
        try {
            store.chainer(chain.project(projectId), store.app).once((data, key) => {
                const foundData = trimSoul(data)
                // debug && console.log('[GUN node] getProject Data Found: ', foundData)
                if (foundData && foundData.type === 'project') {
                    resolve(foundData)
                }

            })
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}

/**
* 
* @param {*} day 
*/
const getDayTimers = (day) => {
    return new Promise((resolve, reject) => {
        try {
            let result = {}
            store.chainer(chain.timersInDay(day), store.app).map().on((data, key) => {
                if (!data) {
                    debug && console.log('[GUN node] getAllOnce No Data Found',)
                }
                let foundData = trimSoul(data)
                result[key] = foundData
                // debug && console.log('[GUN node] getAllOnce Data Found: ', typeof foundData, foundData)
            })
            resolve(result)
        } catch (err) {
            reject(err)
        }

    })
}