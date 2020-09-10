/* eslint-disable no-unused-vars */

exports.timerState = p => {
    //LISTENING
    p.messenger.on('getTimer', msg => {
        p.debug && console.log('timer', msg.timerId)
        getTimer(msg.timerId).then(found => {
            p.current = found
            p.previous.total = found.total
            p.previous.started = found.started
            p.messenger.emit(`${msg.timerId}`, p.current)

            getProjectDate(p.dateSimple(p.current.started), p.current.project).then(projectfound => {
                p.project = projectfound
                p.debug && console.log('project found', p.project)
                p.messenger.on(`${p.current.id}/saveEdits`, msg => {
                    p.debug && console.log(`${p.current.id}/saveEdits`, msg)
                    editComplete()
                })
                p.messenger.on(`${p.current.id}/delete`, msg => {
                    if (msg && msg.id === p.current.id) {
                        removeTimer(p.current)
                        p.current = {}
                        p.messenger.emit(`${p.current.id}/deleted`, p.current)
                    }
                })
            })
        })

    })


    p.messenger.on('newEntry', msg => {
        if (msg && msg.projectId) {
            createEntry(msg.projectId).then(newTimer => {
                p.current = newTimer
                p.previous.started = newTimer.started
                p.previous.total = 0
                p.messenger.emit(`${msg.timerId}`, p.current)
                p.debug && console.log('newEntry', p.current)
                getProject(msg.projectId).then(project => {
                    p.project = project
                    p.debug && console.log('project found', p.project)
                    p.messenger.on(`${p.current.id}/saveEdits`, msg => {
                        p.debug && console.log(`${p.current.id}/saveEdits`, msg)
                        let endproject = project
                        endproject.lastcount = p.settingCount(p.current, project)
                        endproject.lastrun = p.dateSimple(p.current.started)
                        p.current.total = p.totalTime(p.current.started, p.current.ended)
                        // debug && console.log('[react Data] storing count', project.lastrun, project.lastcount)
                        p.debug && console.log('[react Data] storing timer', p.current)
                        // debug && console.log('[react Data] storing project', project)
                        p.store.put(p.chain.project(endproject.id), endproject)
                        p.store.put(p.chain.timer(p.current.id), p.current)
                        p.store.set(p.chain.timerHistory(p.current.id), p.current)
                        p.store.put(p.chain.timerDate(p.current.started, p.current.id), true) // maybe have a count here?
                        p.store.put(p.chain.projectDate(endproject.lastrun, endproject.id), endproject)
                        p.store.put(p.chain.projectTimer(endproject.id, p.current.id), p.current)
                        p.debug && console.log('New Entry Stored', p.current, endproject)
                    })
                })

            })

        }
    })


    // PARSING
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

    const chooseNewEnd = (newTime, started) => {
        if (p.isValid(newTime) === false) {
            p.setAlert([
                'Error',
                'Date Invalid.',
            ])
            return false
        }
        else if (!p.timeRules(started, newTime)) {

            p.setAlert([
                'Error',
                'Cannot Start after End.',
            ])
            return false
        }
        else if (!p.timeRules(newTime, new Date())) {

            p.setAlert([
                'Error',
                'Cannot End before now.',
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

    const dateRules = (newDate) => {
        if (p.isValid(newDate) === false) {
            p.setAlert([
                'Error',
                'Date Invalid.',
            ])
            return false
        }
        else if (!p.dateRules(newDate)) {
            p.setAlert([
                'Error',
                'Cannot Pick Date before Today.'
            ])
            return false
        } else {
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
        else if (!p.timeRules(end, new Date())) {
            p.setAlert([
                'Error',
                'Cannot End before now.',
            ])
            return false
        }
        else {
            p.setAlert(false)
            return true
        }
    }

    const dateRulesEnforcer = (start, end) => {
        if (!p.timeRules(start, new Date())) {
            p.setAlert([
                'Error',
                'Cannot Start before now.',
            ])
            return false

        }
        else if (!p.timeRules(end, new Date())) {
            p.setAlert([
                'Error',
                'Cannot End before now.',
            ])
            return false
        }
        else {
            p.setAlert(false)
            return true
        }
    }

    /**
     * changes start and end dates, outputs new timer
     * @param {*} newDate 
     * @param {*} timer 
     * @todo needs some checking...
     */
    const changeDate = (newDate, timer) => {
        let oldStart = p.isValid(timer.started) ? timer.started : new Date(timer.started)
        let oldEnd = p.isValid(timer.ended) ? timer.ended : new Date(timer.ended)
        let newStart = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), oldStart.getHours(), oldStart.getMinutes(), oldStart.getSeconds())
        let newEnd = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), oldEnd.getHours(), oldEnd.getMinutes(), oldEnd.getSeconds())
        p.debug && console.log(newStart, newEnd)
        if (dateRulesEnforcer(newStart, newEnd) === true) {
            timer.started = p.isValid(newStart) ? newStart.toString() : timer.started
            timer.ended = p.isValid(newEnd) ? newEnd.toString() : timer.ended
        }
        return timer
    }

    const chooseNewDate = (date, timer) => {
        let newDate = changeDate(date, timer)
        if (dateRules(newDate) === true) {
            let newTimer = changeDate(newDate, p.current)

            p.current = newTimer
        }
    }


    const nextDay = timer => {
        let newDate = p.addDays(timer.started, 1)
        p.debug && console.log('current', p.current)
        if (dateRules(newDate) === true) {
            p.current = changeDate(newDate, p.current)
        }
    }

    const previousDay = timer => {
        let newDate = p.subDays(timer.started, 1)
        if (dateRules(newDate) === true) {
            p.current = changeDate(newDate, p.current)
        }
    }

    const decreaseStarted = timer => {
        let newStarted = p.addMinutes(timer.started, -5)
        let checkedEnd = p.isRunning(timer) ? new Date() : new Date(timer.ended)
        return timeRulesEnforcer(newStarted, checkedEnd) ? p.setStarted(newStarted) : timer.started
    }

    const increaseStarted = timer => {
        let newStarted = p.addMinutes(timer.started, 5)
        let checkedEnd = p.isRunning(timer) ? new Date() : new Date(timer.ended)
        return timeRulesEnforcer(newStarted, checkedEnd) ? p.setStarted(newStarted) : timer.started
    }

    const decreaseEnded = timer => {
        let newEnded = p.isRunning(timer) ? new Date() : p.addMinutes(timer.ended, -5)
        let checkedStart = p.isRunning(timer) ? new Date() : new Date(timer.started)
        return timeRulesEnforcer(checkedStart, newEnded) ? p.setEnded(newEnded) : timer.ended
    }

    const increaseEnded = timer => {
        let newEnded = p.isRunning(timer) ? new Date() : p.addMinutes(timer.ended, 5)
        let checkedStart = p.isRunning(timer) ? new Date() : new Date(timer.started)
        return timeRulesEnforcer(checkedStart, newEnded) ? p.setEnded(newEnded) : timer.ended
    }

    const editComplete = () => {
        if (!timeRulesEnforcer(p.current.started, p.current.ended)) return false
        // let updatedtimer = p.current
        // updatedtimer.started = p.current.started.toString()
        // updatedtimer.ended = p.current.ended.toString()
        // updatedtimer.mood = p.current.mood
        // updatedtimer.energy = p.current.energy
        // updatedtimer.total = totalTime(p.current.started, p.current.ended)
        let updatedproject = p.project
        updatedproject.lastrun = p.dateSimple(p.sameDay(p.previous.started, p.project.lastrun) ? p.current.started : p.project.lastrun)
        p.debug && console.log('p.current total', p.current.total, ' before total', p.previous.total)
        let prevcount = p.project.lastcount - p.previous.total // remove previous count
        let lastcount = prevcount + p.current.total
        updatedproject.lastcount = lastcount
        p.debug && console.log('updatedproject', updatedproject)
        if (p.current && p.current.type === 'timer') {
            updateTimer(p.current)
            p.setAlert(['Success', 'Timer Updated!',])
        }
        else {
            p.setAlert(['Error', 'Timer Invalid!',])
        }
        if (updatedproject && updatedproject.id && updatedproject.lastrun && updatedproject.lastcount) {
            p.store.put(p.chain.projectDate(updatedproject.lastrun, p.project.id), updatedproject)
            p.setAlert(['Success', 'Project Updated!',])
        }
        else {
            p.setAlert(['Error', 'Project Invalid!',])
        }

    }

    const updateTimer = (timer) => {
        let editedTimer = timer
        if (editedTimer.deleted) { editedTimer.deleted = null }
        editedTimer.edited = new Date().toString()
        p.debug && console.log('[react Data] Updating Timer', editedTimer)
        p.store.set(p.chain.timerHistory(editedTimer.id), editedTimer)
        p.store.put(p.chain.timer(editedTimer.id), editedTimer)
        p.store.put(p.chain.timerDate(editedTimer.started, editedTimer.id), true)
        p.store.put(p.chain.projectTimer(editedTimer.project, editedTimer.id), editedTimer)
        if (timer.started !== editedTimer.started) {
            let timerMoved = timer
            timerMoved.deleted = new Date().toString()
            timerMoved.status = 'moved'
            p.store.set(p.chain.timerDate(timer.started, timer.id), timerMoved)
        }
        p.store.set(p.chain.timerDate(editedTimer.started, editedTimer.id), editedTimer)
    }

    const removeTimer = timer => {
        let timerDelete = timer
        timerDelete.deleted = new Date().toString()
        timerDelete.status = 'deleted'
        p.store.set(p.chain.timerHistory(timerDelete.id), timerDelete)
        p.store.put(p.chain.timer(timerDelete.id), timerDelete)
        p.store.put(p.chain.timerDate(timerDelete.started, timerDelete.id), false)
        p.store.put(p.chain.projectTimer(timerDelete.project, timerDelete.id), timerDelete)
        // project.lastrun = sameDay(previous.started, project.lastrun) ? p.current.started : project.lastrun
        p.project.lastcount = p.project.lastcount - p.previous.total
        p.store.put(p.chain.projectDate(p.project.lastrun, p.project.id), p.project)
        p.setAlert(['Success', 'Timer Deleted!'])
    }

    const restoreTimer = timer => {
        timer.status = 'done'
        p.store.put(p.chain.timer(timer.id), timer)
        p.store.set(p.chain.timerHistory(timer.id), timer)
        p.store.put(p.chain.projectTimer(timer.project, timer.id), timer)
        p.store.put(p.chain.timerDate(timer.started, timer.id), true)
        p.project.lastcount = p.project.lastcount + timer.total
        p.store.put(p.chain.projectDate(p.project.lastrun, p.project.id), p.project)
        p.setAlert(['Success', 'Timer Restored!'])
    }

    p.messenger.on('chooseNewDate', msg => {
        if (msg) {
            let date = new Date(msg)
            chooseNewDate(date, p.current)
            p.debug && console.log('chooseNewDate:', p.current)
            p.messenger.emit(`${p.current.id}`, p.current)
        }
    })
    p.messenger.on('chooseNewStart', msg => {
        if (msg) {
            let date = new Date(msg)
            let newStart = chooseNewStart(date, p.current.ended)
            p.debug && console.log('[Alert] NewStart:', newStart, date.toString())
            p.current.started = newStart === true ? date.toString() : p.current.started
            p.debug && console.log('chooseNewStart:', p.current)
            p.messenger.emit(`${p.current.id}`, p.current)
        }
    })
    p.messenger.on('chooseNewEnd', msg => {
        if (msg) {
            let date = new Date(msg)
            let newEnd = chooseNewEnd(date, p.current.started)
            p.debug && console.log('[Alert] NewEnd:', newEnd, date.toString())
            p.current.ended = newEnd === true ? date.toString() : p.current.started
            p.debug && console.log('chooseNewEnd:', p.current)
            p.messenger.emit(`${p.current.id}`, p.current)
        }
    })
    p.messenger.on('nextDay', msg => {
        if (msg && msg.id === p.current.id) {
            nextDay(p.current)
            p.debug && console.log('nextDay:', p.current)
            p.messenger.emit(`${p.current.id}`, p.current)
        }
    })
    p.messenger.on('prevDay', msg => {
        if (msg && msg.id === p.current.id) {
            previousDay(p.current)
            p.debug && console.log('prevDay:', p.current)
            p.messenger.emit(`${p.current.id}`, p.current)
        }
    })
    p.messenger.on('increaseStarted', msg => {
        if (msg && msg.id === p.current.id) {
            p.current.started = increaseStarted(p.current)
            p.current.total = p.totalTime(p.current.started, p.current.ended)
            p.debug && console.log('total: ', p.current.total, ' previous total: ', p.previous.total)
            p.messenger.emit(`${p.current.id}`, p.current)
        }
    })
    p.messenger.on('decreaseStarted', msg => {
        if (msg && msg.id === p.current.id) {
            p.current.started = decreaseStarted(p.current)
            p.current.total = p.totalTime(p.current.started, p.current.ended)
            p.debug && console.log('total: ', p.current.total, ' previous total: ', p.previous.total)
            p.messenger.emit(`${p.current.id}`, p.current)
        }
    })
    p.messenger.on('increaseEnded', msg => {
        if (msg && msg.id === p.current.id) {
            p.current.ended = increaseEnded(p.current)
            p.current.total = p.totalTime(p.current.started, p.current.ended)
            p.debug && console.log(p.current.total, p.previous.total)
            p.messenger.emit(`${p.current.id}`, p.current)
        }
    })
    p.messenger.on('decreaseEnded', msg => {
        if (msg && msg.id === p.current.id) {
            p.current.ended = decreaseEnded(p.current)
            p.current.total = p.totalTime(p.current.started, p.current.ended)
            p.debug && console.log(p.current.total, p.previous.total)
            p.messenger.emit(`${p.current.id}`, p.current)
        }
    })
    p.messenger.on('TimerRestore', msg => {
        if (msg && msg.id && msg.type === 'timer') {
            restoreTimer(msg)
        }
    })

    // DATA
    const createEntry = (projectId) => new Promise((resolve, reject) => {
        try {
            const newTimer = p.newEntry(projectId)
            resolve(newTimer)
        } catch (error) {
            reject(error)
        }

    })
    const getTimer = timerId => {
        return new Promise((resolve, reject) => {
            if (!timerId) reject('no timerId passed')
            try {
                // OPTIMIZE: listen for changes with 'on' then update state in the background
                p.store.chainer(p.chain.timer(timerId), p.store.app).once((data, key) => {
                    p.debug && console.log(key)
                    const foundData = p.trimSoul(data)
                    p.debug && console.log('foundTimer', foundData) // left off here try to p.debug with 'ack'
                    if (foundData && foundData.type === 'timer') {
                        resolve(foundData)
                    }
                })
            } catch (error) {
                p.debug && console.log(error)
                reject(error)
            }
        })
    }

    const getProject = (projectId) => {
        return new Promise((resolve, reject) => {
            if (!projectId) reject('no projectId passed')
            try {
                p.store.chainer(p.chain.project(projectId), p.store.app).once((data, key) => {
                    const foundData = p.trimSoul(data)
                    //   debug && console.log('[GUN node] getProject Data Found: ', foundData)
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


    /**
    * 
    * @param {string} day simpledate `dd-mm-yyyy` 
    */
    const getProjectDate = (day, projectId) => new Promise((resolve, reject) => {
        try {
            p.store.chainer(p.chain.projectDate(day, projectId), p.store.app).on((data, key) => {
                if (!data) {
                    p.debug.data && console.log('[GUN node] getProjectDate No Data Found',)
                }
                let foundData = p.trimSoul(data)
                if (foundData.type === 'project') {
                    p.debug.data && console.log('[GUN node] getProjectDate Data Found: ', key, foundData)

                    resolve(foundData)
                }
            })
        } catch (err) {
            reject(err)
        }

    })
}