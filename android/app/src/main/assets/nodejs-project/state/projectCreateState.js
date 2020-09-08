/* eslint-disable no-unused-vars */

exports.projectCreate = (p) => {
    p.messenger.on('ProjectCreate', event => {
        event = p.parse(event)
        if (typeof event === 'object' && event.name && event.color && event.selected) {
            p.state = event
            if (!p.nameValid(p.state.name)) {
                p.messenger.emit('ProjectCreateError', `${p.state.name} is not valid name`)
                return false
            }
            if (!p.colorValid(p.state.color)) {
                // alert('Need valid color');
                p.messenger.emit('ProjectCreateError', `${p.state.color} is not valid color`)
                return false
            }
            else { 
                try {
                    createProject(p.state.name, p.state.color, p.state.selected).then(project => {
                        console.log(`success! ${project.id}`)
                        p.messenger.emit('ProjectCreateSuccess', project)
                    })
                } catch (error) {
                    console.error(error)
                }
    
    
            }
        }
    })
    
    const createProject = (name, color, selected) => {
        return new Promise((resolve, reject) => {
            const project = p.newProject(name, color, selected)
            if (!project) reject('No Project')
            p.debug && console.log('[react Data] Creating Project', project)
            // store.set(chain.projectHistory(project.id), project)
            p.store.chainer(p.chain.project(project.id), p.store.app).put(project, ack => {
                p.debug && console.log('[NODE_DEBUG_PUT] ERR? ', ack.err)
                if(!ack.err) resolve(project)
                else reject(ack.err)
            })
        })
    }
}
