exports.appState = p => {
    // Get projects when app is first loaded
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
    getProjects().then(projects => {
        if(projects)p.debug && console.log('Initial data retrieved')
    }). catch(error => console.log(error))
}