/* eslint-disable no-unused-vars */
exports.projectsState = p => {
    p.messenger.on("getProjects", msg => {
        p.debug && console.log('get projects', msg)
        getProjects().then(projects => {
            p.messenger.emit("projects", projects)
        }).catch(error => {
            console.log(error)
            p.messenger.emit("projects", error)
        })
    })

    const getProjects = () => {
        return new Promise((resolve, reject) => {
            p.store.chainer(p.chain.projects(), p.store.app).map().on((data, key) => {
                let foundData = p.trimSoul(data)
                p.debug && console.log('[GUN node] getProjects Data Found: ', key, foundData)
                if (foundData && foundData.type === 'project' && foundData.status === 'active' && !p.state.projects.some(project => project.id === foundData.id)) {
                    p.state.projects.push(foundData)
                }
            })
            if (p.state.projects.length > 0) resolve(p.state.projects)
            else reject('no projects to get')
        })
    }
}