/* eslint-disable no-unused-vars */
exports.timelineState = p => {
    // LISTENERS
    p.messenger.on(p.chain.timerDates(), event => {
        if (!event) return
        let item = p.parse(event)
        if (item && typeof item === 'object') {
            let found = Object.keys(item)
            p.days = found.sort((a, b) => new Date(b) - new Date(a))
            p.debug && console.log('found dates: ', p.days)
            // p.days.forEach(day => p.messenger.addListener(p.chain.timerDate(day), event => timersInDayHandler(event, { day })))
        }
    })
    p.store.getAllOnce(p.chain.timerDates())


    p.messenger.on("pagelocation", msg => {
        if (msg) {
            p.pagelocation.x = msg.x
            p.pagelocation.y = msg.y
            p.debug.listeners && console.log(p.pagelocation.y)
        }
    })
    p.messenger.on("getPage", msg => getPage(msg))

    /**
     * p.parses msg and sets the page to get
     * @param {*} msg 
     * @param {*} msg.pagesize nubmer of sections per page
     * @param {boolean} msg.all get all found pages 
     * @param {*} msg.refresh rebuild pages
     * @param {*} msg.currentday 
     */
    const getPage = (msg) => {
        if (msg) {
            p.pagesize = msg.pagesize
            p.debug.listeners && console.log('[Listener] getPage received', msg)
            if (msg.currentday === 0) {
                if (msg.all) {
                    p.all = msg.all
                }
                if (msg.refresh) {
                    p.currentday = 0
                    p.debug.listeners && console.log('[Listener] refreshing pages.')
                    createPage()
                }
                else if (p.pages && p.pages.length === 0) {
                    p.currentday = 0
                    p.debug.listeners && console.log('[Listener] getting pages.')
                    createPage()
                } else {
                    p.debug.listeners && console.log('[Listener] updating pages.')
                    p.messenger.emit("pages", p.pages)
                    p.debug.listeners && console.log('[Listener] locating...', p.pagelocation.y)
                    p.messenger.emit('timelinelocation', p.pagelocation)
                }
            }
            else if (msg.currentday > 0) {
                if (msg.currentday > p.currentday) {
                    p.currentday = msg.currentday
                } else {
                    p.currentday = p.currentday + 1
                }
                p.debug.listeners && console.log('[Listener] adding pages.')
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
        let day = p.days[p.currentday]
        p.debug.state && console.log(`[State] day: ${p.currentday}/${p.days.length} [${day}], timer: ${p.page.length}/${p.pagesize} `)

        if (p.currentday >= p.days.length) {
            p.debug.state && console.log('[State] No more p.days with full pages.')
            if (p.page.length > 0) {
                p.debug.state && console.log('[State] Last Page ' + p.currentPage + ' Complete.')
                setPage()
            }
            return
        }
        else if (day && p.page.length >= p.pagesize) {
            p.debug.state && console.log('[State] Page ' + p.currentPage + ' Complete.')
            setPage()
        }
        else if (day) {
            p.debug.state && console.log('[State] Create Page.')
            getTimersInDay(day)

        } else {
            return
        }

    }

    /**
     * add page to pages
     */
    const setPage = () => {
        p.messenger.emit('page', p.page)
        p.pages.push(p.page)
        p.page = []
        p.currentPage++
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
            p.debug.state && console.log('[State] Adding Section: ', section)
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
            p.debug.parsing && console.log('[Parsing] projectDates.', item)
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
                    p.debug.data && console.log('[GUN node] getProjectDates No Data Found',)
                }
                let foundData = p.trimSoul(data)
                if (foundData.type === 'project' && foundData.lastrun === day && foundData.status === 'active') {
                    result.push(foundData)
                }
                p.debug.data && console.log('[GUN node] getProjectDates Data Found: ', day, key, foundData)
            })
            resolve(result)
        } catch (err) {
            reject(err)
        }

    })
}