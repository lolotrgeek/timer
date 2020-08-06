import messenger from '../constants/Messenger'
import { projectValid } from '../constants/Validators'
import {trimSoul} from '../constants/Functions'
import * as chain from '../data/Chains'
import * as store from '../data/Store'
let debug = true
let state = {
    trash: []
}

messenger.on(`getProjectTrash`, msg => {
    getProjectTrash().then(trash => {
        state.trash = trash
        messenger.emit(`projectTrash`, trash)
    })
})


const getProjectTrash = () => {
    return new Promise((resolve, reject) => {
        try {
            let result = []
            store.chainer(chain.projects(), store.app).map().on((data, key) => {
                let foundData = trimSoul(data)
                // debug && console.log('[GUN node] getProject Data Found: ', foundData)
                if (foundData && foundData.type === 'project' && foundData.status === 'deleted') {
                    result.push(foundData)
                }
            })
            resolve(result)
        } catch (error) {
            debug && console.debug && console.log(error)
            reject(error)
        }
    })
}