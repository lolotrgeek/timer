import { totalTime, timeString, parse, trimSoul, timeSpan } from '../constants/Functions'
import * as Data from '../data/Data'
import * as store from '../data/Store'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'

// TODO: page position retained after navigation
// TODO: test remote updating
// TODO: fix replicated sections at beginning of new page

let debug = true

let projectState = {}
let projectId // current project state generator is operating on
let running = { id: 'none', name: 'none', project: 'none' }

let days = [] // set of days containing timers

const newProjectState = () => {
    return {
        pages: [],
        pagesize: 5, // number of timers per `page`
        currentday: 0, // last day where timers were retrieved
        page: [], // set of timers sectioned by day
        currentPage: 1,
        pagelocation: { x: 0, y: 0 },
        project: { id: projectId ? projectId : 'none' }
    }
}

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

messenger.on(`getPages`, msg => {
    if (msg && msg.projectId) {
        projectId = msg.projectId
        if (!projectState[projectId]) {
            projectState[projectId] = newProjectState()
        }
        debug && console.log('getPages received')
        projectState[projectId].pagesize = msg.pagesize
        if (projectState[projectId].project.id === 'none') {
            getProject(projectState[projectId].projectId).then(foundproject => {
                projectState[projectId].project = foundproject
                handleProjectPages(msg)
            })
        } else {
            debug && console.log('Project: ', projectState[projectId].project)
            console.log('projectState: ', projectState)
            handleProjectPages(msg)
        }
        messenger.on(`${projectState[projectId].project.id}/pagelocation`, msg => {
            if (msg) {
                projectState[projectId].pagelocation.x = msg.x
                projectState[projectId].pagelocation.y = msg.y
                debug && console.log(projectState[projectId].pagelocation.y)
            }
        })
    }
})
const handleProjectPages = msg => {
    if (msg.current) {
        if (msg.current.length === 0) {
            if (projectState[projectId].pages && projectState[projectId].pages.length === 0) {
                projectState[projectId].currentday = 0
                debug && console.log('getting pages.')
                getPage(0)
            } else {
                debug && console.log('updating pages.')
                messenger.emit(`${projectState[projectId].project.id}/pages`, projectState[projectId].pages)
                console.log('locating...', projectState[projectId].pagelocation.y)
                messenger.emit(`${projectState[projectId].project.id}/lastpagelocation`, projectState[projectId].pagelocation)
            }
        }
        else {
            debug && console.log('getting pages.')
            getPage(msg.current.length)
        }
    }
}

const getPage = (currentday) => {
    // app reports page size, this gets number of timers until page size is full, sends as `page`
    // TODO: needs a last page function to handle when last page might not be full
    let day = days[projectState[projectId].currentday]
    debug && console.log(`day: ${currentday}/${days.length} [${day}], 
    timer: ${projectState[projectId].page.length}/${projectState[projectId].pagesize} `)

    if (currentday >= days.length) {
        debug && console.log('No more days with full pages.')
        if (projectState[projectId].page.length > 0) {
            console.log('Last Page ' + projectState[projectId].currentPage + ' Complete.')
            messenger.emit(`${projectState[projectId].project.id}/page`, projectState[projectId].page)
            projectState[projectId].pages.push(projectState[projectId].page)
            projectState[projectId].page = []
        }
        return
    }
    else if (projectState[projectId].page.length >= projectState[projectId].pagesize) {
        debug && console.log('Page ' + projectState[projectId].currentPage + ' Complete.')
        messenger.emit(`${projectState[projectId].project.id}/page`, projectState[projectId].page)
        projectState[projectId].pages.push(projectState[projectId].page)
        projectState[projectId].page = []
        projectState[projectId].currentPage++
    }
    else {
        debug && console.log('Getting Timers for Page.', projectState[projectId].page)
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
                if (found.type === 'timer' && found.project === projectState[projectId].project.id) {
                    parseDayTimers(found, section, projectState[projectId].project)
                }
                else {
                    console.log('no timers in day, try next...')
                    projectState[projectId].currentday++
                    getPage(projectState[projectId].currentday)
                    console.log(projectState)
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
    let alreadyInTimers = projectState[projectId].page.some(entry => entry.title === section.title)
    //TODO: optimize, sometimes adding a random timer at beginning of new page... we filter that out here
    if (!alreadyInTimers && section.data.length > 0 && days[projectState[projectId].currentday] === section.title) {
        // console.log(currentday, days[currentday], section.title)
        debug && console.log(section)
        projectState[projectId].page.push(section)
        projectState[projectId].currentday++
        getPage(projectState[projectId].currentday)
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