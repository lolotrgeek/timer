exports.timerListState = p => {
    
    let projecttimers = []
    p.messenger.on('getProjectTimers', async msg => {
        if (msg) {
            let timerdates = await getTimerDates()
            let days = Object.keys(timerdates)
            days.map(async day => {
                await getProjectDates(day)
            })
            p.messenger.emit('projectTimers', projecttimers)
        }
    })

    p.messenger.on('getTimers', async msg => {
        if (msg) {
            let timerdates = await getTimers()
            p.messenger.emit('timersFound', timerdates)
        }
    })

    const getTimerDates = () => new Promise((resolve, reject) => {
        try {
            let result = {}
            p.store.chainer(p.chain.timerDates(), p.store.app).map().on((data, key) => {
                if (!data) {
                    p.debug && console.log('[Timeline GUN node] getTimerDates No Data Found',)
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

        /**
    * 
    * @param {string} day simpledate `dd-mm-yyyy` 
    */
   const getProjectDates = (day) => new Promise((resolve, reject) => {
    try {
        p.store.chainer(p.chain.projectDates(day), p.store.app).map().on((data, key) => {
            if (!data) {
                p.debug.data && console.log('[Timeline GUN node] getProjectDates No Data Found',)
            }
            let foundData = p.trimSoul(data)
            if (foundData.type === 'project' && foundData.lastrun === day && foundData.status === 'active') {
                projecttimers.push(foundData)
            }
            p.debug.data && console.log('[Timeline GUN node] getProjectDates Data Found: ', day, key, foundData)
        })
    } catch (err) {
        reject(err)
    }

})

    const getTimers = () => new Promise((resolve, reject) => {
        try {
            let result = []
            p.store.chainer(p.chain.timers(), p.store.app).map().on((data, key) => {
                if (!data) {
                    p.debug && console.log('[Timeline GUN node] getTimers No Data Found',)
                }
                let foundData = p.trimSoul(data)
                result.push(foundData)
                p.debug.data && console.log('[Timeline GUN node] getTimers Data Found: ', typeof foundData, key, foundData)
            })
            resolve(result)
        } catch (err) {
            reject(err)
        }

    })
}

