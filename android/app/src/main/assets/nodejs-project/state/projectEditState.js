/* eslint-disable no-async-promise-executor */
exports.projectEditState = p => {
    p.messenger.on('ProjectDetails', event => {
        if (event && typeof event === 'string') getProject(event).then(project => {
            p.state.original = project
            p.debug && console.log(project)
            p.messenger.emit(`${project.id}_details`, { name: project.name, color: project.color, selected: project.selected })
        })
    })

    p.messenger.on('ProjectEdit', event => {
        if (typeof event === 'object' && event.name && event.color) {
            p.state.edit = p.state.original
            p.state.edit.color = event.color
            p.state.edit.name = event.name
            if (!p.nameValid(p.state.edit.name)) {
                p.messenger.emit('ProjectCreateError', `${p.state.edit.name} is not valid name`)
                return false
            }
            if (!p.colorValid(p.state.edit.color)) {
                // alert('Need valid color');
                p.messenger.emit('ProjectCreateError', `${p.state.edit.color} is not valid color`)
                return false
            }
            else if (p.projectValid(p.state.edit)) {
                updateProject(p.state.edit).then(project => {
                    p.debug && console.log(`success! ${project.id}`)
                    p.messenger.emit('ProjectCreateSuccess', project)
                })
            }
        }
        //TODO unhappy paths
    })

    p.messenger.on('ProjectDelete', event => {
        if (event && event.id && event.type === 'project') {
            deleteProject(event)
        }
    })

    p.messenger.on('ProjectRestore', event => {
        if (event && event.id && event.type === 'project') {
            restoreProject(event)
        }
    })

    // DATA \\
    const getProject = (projectId) => {
        return new Promise((resolve, reject) => {
            if (!projectId) reject('no projectId passed')
            try {
                p.store.chainer(p.chain.project(projectId), p.store.app).once((data, key) => {
                    const foundData = p.trimSoul(data)
                    p.debug && console.log('[GUN node] getProject Data Found: ', key, foundData)
                    if (foundData && foundData.type === 'project') {
                        resolve(foundData)
                    }

                })
            } catch (error) {
                p.debug && console.p.debug && console.log(error)
                reject(error)
            }
        })
    }

    const updateProject = (projectEdit) => {
        return new Promise(async (resolve, reject) => {
            if (projectEdit.deleted) { projectEdit.deleted = null }
            projectEdit.edited = new Date().toString()
            p.debug && console.log('[react Data] Updating Project', projectEdit)
            p.store.set(p.chain.projectHistory(projectEdit.id), projectEdit)
            p.store.put(p.chain.project(projectEdit.id), projectEdit)
            try {
                let days = Object.keys(await getTimerDates()) // OPTIMIZE: triple mapping
                console.log(days)
                if (days && days.length > 0) {
                    days.forEach(async day => {
                        let projectDates = await getProjectDates(day)
                        console.log('projectDates: ', projectDates)
                        projectDates.forEach(projectDate => {
                            if (projectDate.id === projectEdit.id) {
                                projectDate.name = projectEdit.name
                                projectDate.color = projectEdit.color
                                projectDate.selected = projectEdit.selected
                                projectDate.edited = projectEdit.edited
                                console.log('Edited projectDate: ', projectDate)
                                p.store.put(p.chain.projectDate(day, projectEdit.id), projectDate)
                            }
                        })
                    })
                }
            } catch (error) {
                reject('could not update ', error)
            }

            // Callback message = UI
            // TODO: make this part of chaining?
            p.messenger.on(`project/${projectEdit.id}`, event => {
                if (event === projectEdit) resolve(projectEdit)
                else reject(event)
            })
        })
    }

    const deleteProject = (projectDelete) => {
        return new Promise(async (resolve, reject) => {
            projectDelete.status = 'deleted'
            projectDelete.deleted = new Date().toString()
            p.debug && console.log('[react Data] Deleting Project', projectDelete)
            p.store.set(p.chain.projectHistory(projectDelete.id), projectDelete)
            p.store.put(p.chain.project(projectDelete.id), projectDelete)
            try {
                let days = Object.keys(await getTimerDates()) // OPTIMIZE: triple mapping
                console.log(days)
                if (days && days.length > 0) {
                    days.forEach(async day => {
                        let projectDates = await getProjectDates(day)
                        console.log('projectDates: ', projectDates)
                        projectDates.forEach(projectDate => {
                            if (projectDate.id === projectDelete.id) {
                                projectDate.status = projectDelete.status
                                projectDate.deleted = projectDelete.deleted
                                console.log('Deleted projectDate: ', projectDate)
                                p.store.put(p.chain.projectDate(day, projectDelete.id), projectDate)
                            }
                        })
                    })
                }
            } catch (error) {
                reject('could not delete ', error)
            }

            // Callback message = UI
            // TODO: make this part of chaining?
            p.messenger.on(`project/${projectDelete.id}`, event => {
                if (event === projectDelete) resolve(projectDelete)
                else reject(event)
            })
        })
    }

    const restoreProject = (project) => {
        return new Promise(async (resolve, reject) => {
            project.status = 'active'
            project.deleted = new Date().toString()
            p.debug && console.log('[react Data] Restoring Project', project)
            p.store.set(p.chain.projectHistory(project.id), project)
            p.store.put(p.chain.project(project.id), project)
            try {
                let days = Object.keys(await getTimerDates()) // OPTIMIZE: triple mapping
                console.log(days)
                if (days && days.length > 0) {
                    days.forEach(async day => {
                        let projectDates = await getProjectDates(day)
                        console.log('projectDates: ', projectDates)
                        projectDates.forEach(projectDate => {
                            if (projectDate.id === project.id) {
                                projectDate.status = 'active'
                                console.log('Restoring projectDate: ', projectDate)
                                p.store.put(p.chain.projectDate(day, project.id), projectDate)
                            }
                        })
                    })
                }
            } catch (error) {
                reject('could not restore ', error)
            }

            // Callback message = UI
            // TODO: make this part of chaining?
            p.messenger.on(`project/${project.id}`, event => {
                if (event === project) resolve(project)
                else reject(event)
            })
        })
    }


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
                if (foundData.type === 'project') {
                    result.push(foundData)
                }
                p.debug.data && console.log('[GUN node] getProjectDates Data Found: ', key, foundData)
            })
            resolve(result)
        } catch (err) {
            reject(err)
        }

    })

    /**
     * OPTIMIZE: double mapping, can just output expected map once
     */
    const getTimerDates = () => new Promise((resolve, reject) => {
        try {
            let result = {}
            p.store.chainer(p.chain.timerDates(), p.store.app).map().on((data, key) => {
                if (!data) {
                    p.debug.data && console.log('[GUN node] getTimerDates No Data Found',)
                }
                let foundData = p.trimSoul(data)
                result[key] = foundData
                p.debug.data && console.log('[GUN node] getTimerDates Data Found: ', key, foundData)
            })
            resolve(result)
        } catch (err) {
            reject(err)
        }
    })

    /**
    * OPTIMIZE: USE THIS INSTEAD OF MAP IN RESTORE/EDIT/DELETE FUNCTIONS
    * @param {string} day simpledate `dd-mm-yyyy` 
    */
    // eslint-disable-next-line no-unused-vars
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