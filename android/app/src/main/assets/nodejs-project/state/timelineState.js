/* eslint-disable no-unused-vars */

exports.timelineState = p => {
    // LISTENERS
    p.messenger.on('App', async msg => {
        await listDays()
    })

    p.messenger.on("pagelocation", msg => {
        if (msg) {
            p.pagelocation.x = msg.x
            p.pagelocation.y = msg.y
            p.debug.listeners && console.log(p.pagelocation.y)
        }
    })
    p.messenger.on("getPage", msg => getPage(msg))

    const listDays = () => getTimerDates().then(item => {
        if (item && typeof item === 'object') {
            let found = Object.keys(item)
            p.debug.state && console.log('[Timeline] found dates: ', found)
            p.days = found.sort((a, b) => new Date(b) - new Date(a))
            p.debug.state && console.log('[Timeline] sorted dates: ', p.days)
            // p.days.forEach(day => p.messenger.addListener(p.chain.timerDate(day), event => timersInDayHandler(event, { day })))
        }
    }).catch(err => {
        console.log('Unable to get timerDates', err)
    })
    /**
     * p.parses msg and sets the page to get
     * @param {*} msg 
     * @param {*} msg.pagesize nubmer of sections per page
     * @param {boolean} msg.all get all found pages 
     * @param {*} msg.refresh rebuild pages
     * @param {*} msg.currentday 
     */
    const getPage = async (msg) => {
        if (p.days.length === 0) {
            await listDays()
        }
        if (msg) {
            p.pagesize = msg.pagesize
            p.debug.listeners && console.log('[Timeline Listener] getPage received', msg)
            if (msg.currentday === 0) {
                if (msg.refresh) {
                    p.debug.listeners && console.log('[Timeline Listener] refreshing pages.')
                    await listDays()
                    p.pages = []
                    p.currentday = 0
                    createPage()
                }
                else if(msg.day && msg.id) {
                    p.debug.listeners && console.log('[Timeline Listener] updating day page.')
                    await listDays()
                    if(p.days[0] === msg.day) {
                        let update = await getProjectDate(msg.day, msg.id)
                        getTimersInDay(msg.day)
                    }

                }
                else if (p.pages && p.pages.length === 0) {
                    p.debug.listeners && console.log('[Timeline Listener] getting pages.')
                    p.currentday = 0
                    createPage()
                } else {
                    p.debug.listeners && console.log('[Timeline Listener] updating pages.')
                    p.messenger.emit("pages", p.pages)
                    p.debug.listeners && console.log('[Timeline Listener] locating...', p.pagelocation.y)
                    p.messenger.emit('timelinelocation', p.pagelocation)
                }
            }
            else if (msg.currentday > 0) {
                if (msg.currentday > p.currentday) {
                    p.currentday = msg.currentday
                } else {
                    p.currentday = p.currentday + 1
                }
                p.debug.listeners && console.log('[Timeline Listener] adding pages.')
                createPage()
            }
            else {
                p.debug.listeners && console.log('[Timeline Listener] getting all pages.')
                createPages()
            }
        }
    }

    // STATE

    /**
     * Creates all pages, then emits all on completion
     */
    const createPages = () => {
        p.pages = []
        let day = p.days[0]
        p.debug.state && console.log(`[State] day: ${p.currentday}/${p.days.length} [${day}], timer: ${p.page.length}/${p.pagesize} `)
        if (p.currentday >= p.days.length) {
            p.debug.state && console.log('[Timeline State] No more days with full pages.')
            if (p.page.length > 0) {
                p.debug.state && console.log('[Timeline State] Last Page ' + p.currentPage + ' Complete.')
                setPage()
            }
            return
        }
        else if (day && p.page.length >= p.pagesize) {
            p.debug.state && console.log('[Timeline State] Page ' + p.currentPage + ' Complete.')
            setPage()
            p.messenger.emit('pages', p.pages)
        }
        else if (day) {
            p.debug.state && console.log('[Timeline State] Create Page.')
            getTimersInDay(day)

        } else {
            return
        }
    }
    /**
     * populate an array of sections
     *  
     * page
     * `[{title: 'dd-mm-yyyy', data: [{timer}, {timer}, ...]}, ...]`
     * 
     */
    const createPage = (oneday) => {
        let day = oneday ? oneday : p.days[p.currentday]
        p.debug.state && console.log(`[State] day: ${p.currentday}/${p.days.length} [${day}], timer: ${p.page.length}/${p.pagesize} `)

        if (p.currentday >= p.days.length) {
            p.debug.state && console.log('[Timeline State] No more days with full pages.')
            if (p.page.length > 0) {
                p.debug.state && console.log('[Timeline State] Last Page ' + p.currentPage + ' Complete.')
                p.messenger.emit('page', p.page)
                setPage()
                p.messenger.emit('lastpage', p.pages.length)
            }
            return
        }
        else if (day && p.page.length >= p.pagesize) {
            p.debug.state && console.log('[Timeline State] Page ' + p.currentPage + ' Complete.')
            p.messenger.emit('page', p.page)
            setPage()
        }
        else if (day) {
            p.debug.state && console.log('[Timeline State] Create Page.')
            getTimersInDay(day)

        } else {
            return
        }
    }

    /**
     * add page to pages
     */
    const setPage = () => {
        p.pages.push(p.page)
        p.page = []
        p.currentPage++ // NOTE: may spawn undefined at end of pages...
    }

    /**
     * Add section and setup next
     * @param {Object} section 
     * @param {String} section.title 
     * @param {Array} section.data 
     */
    const addSection = (section) => new Promise((resolve, reject) => {
        let alreadyInTimers = p.page.some(entry => entry.title === section.title)
        if (alreadyInTimers) reject('section already in timeline')
        //TODO: optimize, sometimes adding a random timer at beginning of new page... we filter that out here
        if (!alreadyInTimers && p.days[p.currentday] === section.title) {
            p.debug.state && console.log('[Timeline State] Adding Section: ', section)
            if (section.data.length > 0) {
                p.page.push(section)
            }
            p.currentday++
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
            let item = p.parse(event)
            p.debug.parsing && console.log('[Timeline Parsing] projectDates.', item)
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
            p.store.chainer(p.chain.projectDates(day), p.store.app).map().on((data, key) => {
                if (!data) {
                    p.debug.data && console.log('[Timeline GUN node] getProjectDates No Data Found',)
                }
                let foundData = p.trimSoul(data)
                if (foundData.type === 'project' && foundData.lastrun === day && foundData.status === 'active' && foundData.lastcount > 0) {
                    result.push(foundData)
                }
                p.debug.data && console.log('[Timeline GUN node] getProjectDates Data Found: ', day, key, foundData)
            })
            resolve(result)
        } catch (err) {
            reject(err)
        }

    })

    const getProjectDate = (day, projectId) => new Promise((resolve, reject) => {
        try {
            p.store.chainer(p.chain.projectDate(day, projectId), p.store.app).map().on((data, key) => {
                if (!data) {
                    p.debug.data && console.log('[Timeline GUN node] getTimerDate No Data Found',)
                }
                let foundData = p.trimSoul(data)
                resolve(foundData)
                p.debug.data && console.log('[Timeline GUN node] getTimerDates Data Found: ', typeof foundData, key, foundData)
            })

        } catch (err) {
            reject(err)

        }
    })

    const getTimerDates = () => new Promise((resolve, reject) => {
        try {
            let result = {}
            p.store.chainer(p.chain.timerDates(), p.store.app).map().on((data, key) => {
                if (!data) {
                    p.debug.data && console.log('[Timeline GUN node] getTimerDates No Data Found',)
                }
                let foundData = p.trimSoul(data)
                result[key] = foundData
                p.debug.data && console.log('[Timeline GUN node] getTimerDates Data Found: ', typeof foundData, foundData)
            })
            resolve(result)
        } catch (err) {
            reject(err)

        }
    })

}