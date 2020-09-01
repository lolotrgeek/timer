/* eslint-disable no-unused-vars */
const { addMinutes, subMinutes, isValid, sub, add, getMonth, getYear, getHours, getMinutes, getSeconds, getDate } = require('../src/Functions')
const { timeRules, dateRules, totalTime, trimSoul, isRunning, dateSimple, sameDay } = require('../src/Functions')
const chain = require('../src/Chains')

exports.timerState = p => {
    //LISTENING
    p.messenger.on('getTimer', msg => {
        p.debug && console.log('timer', msg.timerId)
        getTimer(msg.timerId).then(found => {
            p.current = found
            previous.total = found.total
            previous.started = found.started
            p.debug && console.log(p.current)
            p.messenger.emit(`${msg.timerId}`, p.current)

            getProjectDate(dateSimple(p.current.started), p.current.project).then(projectfound => {
                project = projectfound
                p.debug && console.log(project)
                p.debug && console.log(`${p.current.id}/saveEdits`)
                p.messenger.on(`${p.current.id}/saveEdits`, msg => {
                    p.debug && console.log('edit', msg)
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

    // PARSING
    const chooseNewStart = (newTime, ended) => {
        if (!timeRules(newTime, ended)) {
            setAlert([
                'Error',
                'Cannot Start after End.',
            ])
        }
        else if (!timeRules(newTime, new Date())) {
            setAlert([
                'Error',
                'Cannot Start before now.',
            ])
        }
        else if (newTime && !dateRules(newTime)) {

            setAlert([
                'Error',
                'Cannot Pick Date before Today.',
            ])
        }
        else {

            setAlert(false)
            return isValid(newTime) ? setStarted(newTime) : false
        }
    }

    const chooseNewEnd = (newTime, started) => {
        if (!timeRules(started, newTime)) {

            setAlert([
                'Error',
                'Cannot Start after End.',
            ])
        }
        else if (!timeRules(newTime, new Date())) {

            setAlert([
                'Error',
                'Cannot End before now.',
            ])
        }
        else if (newTime && !dateRules(newTime)) {

            setAlert([
                'Error',
                'Cannot Pick Date before Today.',
            ])
        }
        else {

            setAlert(false)
            return isValid(newTime) ? setEnded(newTime) : false
        }
    }

    const chooseNewDate = (newDate, timer) => {
        if (dateRules(newDate)) {
            if (isValid(newDate)) {
                // objective, change day, keep time
                // TODO: move to a separate function
                let oldStart = isValid(timer.started) ? timer.started : new Date(timer.started)
                let oldEnd = isValid(timer.ended) ? timer.ended : new Date(timer.ended)
                let newStart = new Date(getYear(newDate), getMonth(newDate), getDate(newDate), getHours(oldStart), getMinutes(oldStart), getSeconds(oldStart))
                p.debug && console.log(isValid(newStart))
                setStarted(newStart)
                let newEnd = new Date(getYear(newDate), getMonth(newDate), getDate(newDate), getHours(oldEnd), getMinutes(oldEnd), getSeconds(oldEnd))
                setEnded(newEnd)
                return true
            }
            else return false
        } else {

            setAlert([
                'Error',
                'Cannot Pick Date before Today.'
            ])
            return false
        }
    }
    const timeRulesEnforcer = (start, end) => {
        if (!timeRules(start, end)) {
            setAlert([
                'Error',
                'Cannot Start after End.',
            ])
            return false
        }
        else if (!timeRules(start, new Date())) {
            setAlert([
                'Error',
                'Cannot Start before now.',
            ])
            return false

        }
        else if (!timeRules(end, new Date())) {
            setAlert([
                'Error',
                'Cannot End before now.',
            ])
            return false
        }
        else {
            setAlert(false)
            return true
        }
    }

    const nextDay = timer => {
        let newDate = add(new Date(timer.started), { days: 1 })
        return chooseNewDate(newDate, timer) ? newDate : timer.started
    }

    const previousDay = timer => {
        let newDate = sub(new Date(timer.started), { days: 1 })
        return chooseNewDate(newDate, timer) ? newDate : timer.started
    }

    const decreaseStarted = timer => {
        let newStarted = addMinutes(new Date(timer.started), -5)
        let checkedEnd = isRunning(timer) ? new Date() : new Date(timer.ended)
        return timeRulesEnforcer(newStarted, checkedEnd) ? setStarted(newStarted) : timer.started
    }

    const increaseStarted = timer => {
        let newStarted = addMinutes(new Date(timer.started), 5)
        let checkedEnd = isRunning(timer) ? new Date() : new Date(timer.ended)
        return timeRulesEnforcer(newStarted, checkedEnd) ? setStarted(newStarted) : timer.started
    }

    const decreaseEnded = timer => {
        let newEnded = isRunning(timer) ? new Date() : addMinutes(new Date(timer.ended), -5)
        let checkedStart = isRunning(timer) ? new Date() : new Date(timer.started)
        return timeRulesEnforcer(checkedStart, newEnded) ? setEnded(newEnded) : timer.ended
    }

    const increaseEnded = timer => {
        let newEnded = isRunning(timer) ? new Date() : addMinutes(new Date(timer.ended), 5)
        let checkedStart = isRunning(timer) ? new Date() : new Date(timer.started)
        return timeRulesEnforcer(checkedStart, newEnded) ? setEnded(newEnded) : timer.ended
    }

    const editComplete = () => {
        if (!timeRulesEnforcer(p.current.started, p.current.ended)) return false
        // let updatedtimer = p.current
        // updatedtimer.started = p.current.started.toString()
        // updatedtimer.ended = p.current.ended.toString()
        // updatedtimer.mood = p.current.mood
        // updatedtimer.energy = p.current.energy
        // updatedtimer.total = totalTime(p.current.started, p.current.ended)
        let updatedproject = project
        updatedproject.lastrun = sameDay(previous.started, project.lastrun) ? p.current.started : project.lastrun
        p.debug && console.log('p.current total', p.current.total, ' before total', previous.total)
        let prevcount = project.lastcount - previous.total // remove previous count
        let lastcount = prevcount + p.current.total
        updatedproject.lastcount = lastcount
        p.debug && console.log('updatedproject', updatedproject)
        if (p.current && p.current.type === 'timer') {
            Data.updateTimer(p.current)
            setAlert(['Success', 'Timer Updated!',])
        }
        else {
            setAlert(['Error', 'Timer Invalid!',])
        }
        if (updatedproject) {
            store.put(chain.projectDate(updatedproject.lastrun, project.id), updatedproject)
            setAlert(['Success', 'Project Updated!',])
        }
        else {
            setAlert(['Error', 'Project Invalid!',])
        }

    }

    const removeTimer = timer => {
        let timerDelete = timer
        timerDelete.deleted = new Date().toString()
        timerDelete.status = 'deleted'
        store.set(chain.timerHistory(timerDelete.id), timerDelete)
        store.put(chain.timer(timerDelete.id), timerDelete)
        store.put(chain.timerDate(timerDelete.started, timerDelete.id), false)
        store.put(chain.projectTimer(timerDelete.project, timerDelete.id), timerDelete)
        // project.lastrun = sameDay(previous.started, project.lastrun) ? p.current.started : project.lastrun
        project.lastcount = project.lastcount - previous.total
        store.put(chain.projectDate(project.lastrun, project.id), project)
        setAlert(['Success', 'Timer Deleted!'])
    }

    const restoreTimer = timer => {
        timer.status = 'done'
        store.put(chain.timer(timer.id), timer)
        store.set(chain.timerHistory(timer.id), timer)
        store.put(chain.projectTimer(timer.project, timer.id), timer)
        store.put(chain.timerDate(timer.started, timer.id), true)
        project.lastcount = project.lastcount + timer.total
        store.put(chain.projectDate(project.lastrun, project.id), project)
        setAlert(['Success', 'Timer Restored!'])
    }


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
            increaseStarted(p.current)
            p.current.total = totalTime(p.current.started, p.current.ended)
            p.debug && console.log(p.current.total, previous.total)
            p.messenger.emit(`${p.current.id}`, p.current)
        }
    })
    p.messenger.on('decreaseStarted', msg => {
        if (msg && msg.id === p.current.id) {
            decreaseStarted(p.current)
            p.current.total = totalTime(p.current.started, p.current.ended)
            p.debug && console.log(p.current.total, previous.total)
            p.messenger.emit(`${p.current.id}`, p.current)
        }
    })
    p.messenger.on('increaseEnded', msg => {
        if (msg && msg.id === p.current.id) {
            increaseEnded(p.current)
            p.current.total = totalTime(p.current.started, p.current.ended)
            p.debug && console.log(p.current.total, previous.total)
            p.messenger.emit(`${p.current.id}`, p.current)
        }
    })
    p.messenger.on('decreaseEnded', msg => {
        if (msg && msg.id === p.current.id) {
            decreaseEnded(p.current)
            p.current.total = totalTime(p.current.started, p.current.ended)
            p.debug && console.log(p.current.total, previous.total)
            p.messenger.emit(`${p.current.id}`, p.current)
        }
    })
    p.messenger.on('TimerRestore', msg => {
        if (msg && msg.id && msg.type === 'timer') {
            restoreTimer(msg)
        }
    })

    // DATA
    const getTimer = timerId => {
        return new Promise((resolve, reject) => {
            if (!timerId) reject('no timerId passed')
            try {
                // OPTIMIZE: listen for changes with 'on' then update state in the background
                store.chainer(chain.timer(timerId), store.app).once((data, key) => {
                    p.debug && console.log(key)
                    const foundData = trimSoul(data)
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


    /**
    * 
    * @param {string} day simpledate `dd-mm-yyyy` 
    */
    const getProjectDate = (day, projectId) => new Promise((resolve, reject) => {
        try {
            store.chainer(chain.projectDate(day, projectId), store.app).on((data, key) => {
                if (!data) {
                    p.debug.data && console.log('[GUN node] getProjectDate No Data Found',)
                }
                let foundData = trimSoul(data)
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