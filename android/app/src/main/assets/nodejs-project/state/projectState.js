/* eslint-disable no-unused-vars */

exports.projectState = p => {
    const newProjectState = (projectId) => ({
        pages: [],
        pagesize: 5, // number of timers per `page`
        currentday: 0, // last day where timers were retrieved
        page: [], // set of timers sectioned by day
        currentPage: 1,
        pagelocation: { x: 0, y: 0 },
        project: { id: projectId ? projectId : 'none' }
    })
    const setCurrent = (projectId) => {
        if (!p.state[projectId]) {
            p.state[projectId] = newProjectState(projectId)
        }
        p.current = p.state[projectId]
    }
    const setState = (key, value) => p.current[key] = value

    // LISTENERS
    p.messenger.on('getProjectPages', msg => {
        if (msg && msg.projectId) {
            p.debug.listeners && console.log('getProjectPages received')
            setState('pagesize', msg.pagesize)
            // setCurrentProject(msg)
            getTimersInProject()
            listenForPageLocation(p.state[msg.projectId])
        }
    })

    p.messenger.on('getProject', msg => {
        if (msg && msg.projectId) {
            p.debug.listeners && console.log('getProject received')
            setCurrentProject(msg.projectId)
        }
    })

    const listenForPageLocation = current => {
        p.messenger.removeAllListeners(`${p.current.project.id}/pagelocation`) // pre-clean, might be redundant?
        p.messenger.on(`${p.current.project.id}/pagelocation`, msg => {
            if (msg) {
                p.current.pagelocation.x = msg.x
                p.current.pagelocation.y = msg.y
                p.debug.listeners && console.log(p.current.pagelocation.y)
            }
        })
    }

    const setCurrentProject = (projectId) => {
        setCurrent(projectId)
        getProject(p.current.project.id).then(foundproject => {
            p.current.project = foundproject
            p.debug.state && console.log('Project: ', p.current.project)
            p.messenger.emit(`${p.current.project.id}/project`, p.current.project)
        }).catch(err => {
            p.debug.state && console.log(err)
        }) 
    }

    // PARSING
    /**
     * Gets all timers in project, sorts them into sections/pages and emits
     * OPTIMIZE: lazy loading. 
     */
    const getTimersInProject = async () => {
        try {
            let event = await getProjectTimers(p.current.project.id)
            let sorted = p.dayHeaders(event).sort((a, b) => new Date(b.title) - new Date(a.title))
            p.current.pages = sorted
            p.debug.parsing && console.log('[Parsing] daytimers', sorted)
            if (sorted && typeof sorted === 'object') {
                // await addSection(sorted) // would have to find day first...
                p.messenger.emit(`${p.current.project.id}/pages`, p.current.pages)
            }
        } catch (error) {
            console.log(error)
        }
    }


    // DATA
    const getProject = (projectId) => {
        return new Promise((resolve, reject) => {
            if (!projectId) reject('no projectId passed')
            try {
                p.store.chainer(p.chain.project(projectId), p.store.app).once((data, key) => {
                    const foundData = p.trimSoul(data)
                    p.debug.data && console.log('[GUN node] getProject Data Found: ', foundData)
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
    * @param {string} projectId 
    */
    const getProjectTimers = (projectId) => {
        return new Promise((resolve, reject) => {
            try {
                let result = []
                p.store.chainer(`project/${projectId}/timers`, p.store.app).map().on((data, key) => {
                    // p.store.chainer(p.chain.projectTimers(projectId), p.store.app).map().on((data, key) => {
                    if (!data) {
                        p.debug.data && console.log('[GUN node] getProjectTimers No Data Found')
                    }
                    let foundData = p.trimSoul(data)
                    p.debug.data && console.log('[GUN node] getProjectTimers Data Found: ', key, data)
                    if (foundData.project === projectId && foundData.status !== 'deleted') {
                        result.push(foundData)
                    }
                })
                resolve(result)
            } catch (err) {
                reject(err)
            }

        })
    }
}