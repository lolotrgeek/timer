/* eslint-disable no-async-promise-executor */

exports.runningState = p => {
    const parseRunning = async (data) => {
        if (data.status === 'running' && data.id) {
            p.running = data
            try {
                p.runningproject = await getProject(data.project)
                if (p.runningproject && p.runningproject.status === 'active') {
                    let count = p.totalTime(p.running.started, new Date()) + p.running.count
                    p.debug && console.log('[START] running found, setting count, ', count)
                    p.setCount(count)
                    p.runCounter()
                    p.messenger.emit('notify', { title: p.runningproject.name, id: p.running.project, subtitle: count, state: "start" })
                }
                // TODO: handle if a project gets deleted offline/remotely -> stop and store it?
            } catch (error) {
                console.log(error)
            }

        }
        else if (!data.id || data.id === 'none') {
            p.debug && console.log('[STOP] running cleared')
            p.running = data
            p.stopCounter()
            p.messenger.emit('notify', { state: "stop" })
        }
        else if (data.status === 'done' && data.id === p.running.id) {
            p.debug && console.log('[STOP] running stopped')
            p.running = data
            p.stopCounter()
            p.messenger.emit('notify', { state: "stop" })
        }
        else {
            p.debug && console.log('[STOP] no running timer')
            p.running = {}
            p.stopCounter()
            p.messenger.emit('notify', { state: "stop" })
        }
    }



    // DATA
    /**
     * creates a running timer entry, emits 'running'
     * @param {Object} project 
     */
    const createRunning = project => new Promise((resolve, reject) => {
        if (!project || typeof project !== 'object' || !project.id || project.id.length < 9) {
            reject(' cannot create invalid project')
            return
        }
        let timer = p.newTimer(project.id)
        p.debug && console.log('last run: ', project.lastrun, project.lastcount)
        timer.name = project.name
        timer.color = project.color
        timer.count = project.lastrun && project.lastcount ? p.getTodaysCount(project.lastrun, project.lastcount) : 0
        p.debug && console.log('[react Data] Created Timer', timer)
        p.store.put(p.chain.running(), timer)
        p.store.set(p.chain.timerHistory(timer.id), timer) // TODO: might be un-necessary...
        resolve(timer)
    })

    /**
     * creates and updates entries to end a timer
     * @param {*} timer 
     */
    const endTimer = (timer, project) => new Promise((resolve, reject) => {
        p.debug && console.log('[react Data] Ending', timer, project)
        if (!timer || !timer.id || timer.id === 'none') {
            reject('no timer')
        }
        else if (!project || !project.id || project.id === 'none' || project.id.length < 9) {
            reject('no project')
        } else {
            let endproject = project
            endproject.lastcount = p.settingCount(timer, project)
            endproject.lastrun = p.dateSimple(new Date())
            timer.total = p.totalTime(timer.started, timer.ended)
            // debug && console.log('[react Data] storing count', project.lastrun, project.lastcount)
            p.debug && console.log('[react Data] storing timer', timer)
            // debug && console.log('[react Data] storing project', project)
            p.store.put(p.chain.project(endproject.id), endproject)
            p.store.put(p.chain.timer(timer.id), timer)
            p.store.set(p.chain.timerHistory(timer.id), timer)
            p.store.put(p.chain.timerDate(timer.started, timer.id), true) // maybe have a count here?
            p.debug && console.log('[react Data] Project Date Storing ', endproject.lastrun, endproject.id, endproject)
            p.store.put(p.chain.projectDate(endproject.lastrun, endproject.id), endproject)
            p.store.put(p.chain.projectTimer(endproject.id, timer.id), timer)
            p.debug && console.log('[react Data] Ended', timer, endproject)
            resolve(timer)
        }
    })

    /**
     * Generates a new timer using the given timer model
     * @param {String} projectId project hashid
     */
    const addTimer = (timer, project) => new Promise(async (resolve, reject) => {
        if (!timer) reject('no timer to add')
        const clonedTimer = p.cloneTimer(timer)
        p.debug && console.log('[node Data] Storing Timer', clonedTimer)
        await endTimer(clonedTimer, project)
        resolve(clonedTimer)
    })

    const finishRunning = (timer, project) => new Promise(async (resolve, reject) => {
        if (p.isRunning(timer)) {
            p.debug && console.log('[react Data STOP] Finishing', timer)
            let done = p.doneTimer(timer)
            p.store.put(p.chain.running(), done)
            // Danger zone until endTimer is called
            p.debug && console.log('[react Data STOP] Checking for Multi-day...')
            if (p.multiDay(done.started, done.ended)) {
                p.debug && console.log('[react Data STOP] Is Multi-day...')
                const dayEntries = p.newEntryPerDay(done.started, done.ended)
                dayEntries.map(async (dayEntry, i) => {
                    let splitTimer = done
                    splitTimer.started = dayEntry.start
                    splitTimer.ended = dayEntry.end
                    p.debug && console.log('[react Data] Split', i, splitTimer)
                    if (i === 0) { await endTimer(splitTimer, project) } // use initial timer id for first day
                    else { await addTimer(splitTimer, project) }
                    resolve(splitTimer)
                })
            } else {
                p.debug && console.log('[react Data STOP] Not Multi-day, ending...')
                try {
                    // not being called...
                    let ended = await endTimer(done, project)
                    resolve(ended)
                } catch (error) {
                    reject('unable to Finish ', error)
                }
            }
        } else { reject('Timer not running.') }
    })

    const getProject = (projectId) => {
        return new Promise((resolve, reject) => {
            if (!projectId) resolve({id: 'none'})
            try {
                p.store.chainer(p.chain.project(projectId), p.store.app).once((data, key) => {
                    const foundData = p.trimSoul(data)
                    p.debug && console.log('[GUN node] getProject Data Found: ', key, foundData)
                    if (foundData && foundData.type === 'project') {
                        resolve(foundData)
                    }

                })
            } catch (error) {
                p.debug && console.log(error)
                reject(error)
            }
        })
    }

    const getRunning = () => new Promise((resolve, reject) => {
        p.store.chainer('running', p.store.app).once((data, key) => {
            if (!data) reject('no Running')
            data = p.trimSoul(data)
            p.debug && console.log('[GUN node] getRunning Data Found: ', key, data)
            if (data && data.type === 'timer') {
                p.debug && console.log('Got Running Timer...')
                resolve(data)
            }
        })

    })

    const stopRunning = async () => {
        try {
            p.stopCounter()
            p.debug && console.log('[STOP] ', p.running, p.runningproject)
            await finishRunning(p.running, p.runningproject)
        } catch (error) {
            p.debug && console.log('[Timer node] : Stop failed ' + error)
        }

    }

    /**
     * Local Stop Listener
     */
    p.messenger.on('stop', async msg => {
        p.debug && console.log('[React node] incoming Stop: ' + typeof msg, msg)
        try {
            await stopRunning()
        } catch (error) {
            p.debug && console.log('[Timer node] : Stop failed ' + error)
        }
    })
    /**
     * Local Start Listener
     */
    p.messenger.on('start', async msg => {
        p.debug && console.log('[React node] incoming Start: ' + typeof msg, msg)
        try {
            if (p.running && p.running.status === 'running') await stopRunning()
            if (!msg || typeof msg !== 'object' || !msg.projectId || msg.projectId === 'none') {
                if (p.runningproject && p.runningproject.id && p.runningproject.type === 'project') {
                    await createRunning(p.runningproject)
                }
            } else {
                p.runningproject = await getProject(msg.projectId)
                await createRunning(p.runningproject)
            }
        } catch (error) {
            p.debug && console.log('[Timer node] : Start failed ', error)
        }
    })

    /**
     * Running Request Listener
     */
    p.messenger.on('getRunning', async () => {
        try {
            //TODO: might not need this? could be redundant
            let data = await getRunning()
            parseRunning(data)
            if (p.running && p.running.id && p.running.project) {
                p.messenger.emit('running', p.running)
            }
        } catch (error) {
            console.log(error)
        }
    })


    /**
     * Running Listener
     */
    p.store.chainer('running', p.store.app).on((data, key) => {
        if (!data) p.debug && console.log('no Running')
        data = p.trimSoul(data) // NOTE: always trimSoul of incoming data, soulFul data will destroy p.chains!!!
        if (data && data.type === 'timer') {
            p.debug && console.log('Received Running Timer...', key, data)
            parseRunning(data)
            p.messenger.emit('running', p.running)
        }
    })

    //EDITING
    const editRunning = () => {
        if (!timeRulesEnforcer(p.running.started, new Date())) return false
        if (p.running && p.running.type === 'timer') {
            p.debug && console.log('[react Data] Editing Timer', p.running)
            p.store.put(p.chain.running(), p.running)
            p.store.set(p.chain.timerHistory(p.running.id), p.running) // TODO: might be un-necessary...
            p.setAlert(['Success', 'Running Updated!',])
        }
        else {
            p.setAlert(['Error', 'Running Invalid!',])
        }

    }
    p.messenger.on('increaseRunning', msg => {
        if (msg && msg.id === p.running.id) {
            p.running.started = increaseStarted(p.running)
            p.debug && console.log('[Running]' , typeof p.running.started, p.running.started)
        }
    })
    p.messenger.on('decreaseRunning', msg => {
        if (msg && msg.id === p.running.id) {
            p.running.started = decreaseStarted(p.running)
            p.debug && console.log('[Running]' , typeof p.running.started, p.running.started)
        }
    })

    p.messenger.on('chooseRunningStart', msg => {
        if (msg) {
            let date = new Date(msg)
            let newStart = chooseNewStart(date, p.running.ended)
            p.debug && console.log('[Running] [Alert] NewStart:', newStart, date.toString())
            p.running.started = newStart === true ? date.toString() : p.running.started
            p.debug && console.log('[Running] chooseNewStart:', p.running)
        }
    })
    const decreaseStarted = timer => {
        let newStarted = p.addMinutes(timer.started, -5)
        p.debug && console.log('[Running] [Alert] NewStart:', typeof newStarted, newStarted)
        let checkedEnd = new Date().toString()
        return timeRulesEnforcer(newStarted, checkedEnd) ? newStarted.toString() : timer.started
    }

    const increaseStarted = timer => {
        let newStarted = p.addMinutes(new Date(timer.started), 5)
        let checkedEnd = new Date().toString()
        return timeRulesEnforcer(newStarted, checkedEnd) ? newStarted.toString() : timer.started
    }

    p.messenger.on('saveRunningEdits', msg => {
        editRunning()
    })

    const chooseNewStart = (newTime, ended) => {
        if (p.isValid(newTime) === false) {
            p.setAlert([
                'Error',
                'Date Invalid.',
            ])
            return false
        }
        else if (!p.timeRules(newTime, ended)) {
            p.setAlert([
                'Error',
                'Cannot Start after End.',
            ])
            return false
        }
        else if (!p.timeRules(newTime, new Date())) {
            p.setAlert([
                'Error',
                'Cannot Start before now.',
            ])
            return false
        }
        else if (newTime && !p.dateRules(newTime)) {
            p.setAlert([
                'Error',
                'Cannot Pick Date before Today.',
            ])
            return false
        }
        else {
            p.setAlert(false)
            return true
        }
    }
    const timeRulesEnforcer = (start, end) => {
        if (!p.timeRules(start, end)) {
            p.setAlert([
                'Error',
                'Cannot Start after End.',
            ])
            return false
        }
        else if (!p.timeRules(start, new Date())) {
            p.setAlert([
                'Error',
                'Cannot Start before now.',
            ])
            return false

        }
        else {
            p.setAlert(false)
            return true
        }
    }
}