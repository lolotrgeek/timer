import Gun from 'gun/gun'
import messenger from '../constants/Messenger'

//TODO process to find signal server
const port = '8765'
const address = '192.168.1.109'
const peers = [`http://${address}:${port}/gun`]

const gun = new Gun({
    peers: peers,
})
const app = gun.get('app')
const debug = false

debug && console.log('App prototype:', Object.getPrototypeOf(app))


export const testGun = () => {
    app.put('hello')
    app.get('world', (data, key) => {
        debug && console.log('gunTest ', data)
    })
}

/**
 * 
 * @param {*} input
 * @returns {object | undefined} 
 */
const parse = (input) => {
    let output
    if (typeof input === 'string') {
        try { output = JSON.parse(input) }
        catch (error) { console.error(error) }
    } else if (typeof input === 'object') {
        output = input
    }
    return output
}

/**
 * 
 * @param {*} input 
 */
const parser = input => {
    try {
        return JSON.parse(input)
    } catch (error) {
        debug && console.log('[Parse node] not a JSON object')
        return input
    }
}

const inputParser = msg => {
    if (typeof msg === 'string') {
        debug && console.log('Parsing String Input')
        return parser(msg)
    }
    else if (typeof msg === 'object') {
        debug && console.log('Parsing Object Input')
        return msg
    }
}
/**
 * removes soul from given data
 * @param {*} data 
 */
const trimSoul = data => {
    if (!data || !data['_'] || typeof data['_'] !== 'object') return data
    delete data['_']
    return data
}

/**
* Create a chain by splitting a key string, adding each split to the chain
* 
* @param {string} input `key` || `key1/key2/...`
* @param {*} chain 
*/
const chainer = (input, chain) => {
    if (!input || !chain) {
        debug && console.log('[Chain node] no input or chain')
        return false
    }
    if (typeof input === 'string') {
        if (input.length === 0) return chain
        let inputKeys = input.split('/')
        // chainer(input, chain)
        // if (input.length === 0) return chain
        while (inputKeys.length > 0) {
            debug && console.log('[Chain node] Chaining key:', inputKeys[0])
            chain = chain.get(inputKeys[0])
            inputKeys = inputKeys.slice(1)
        }
    }
    debug && console.log('[Chain node] done.')
    return chain
}

const getOne = (msg) => {
    const input = inputParser(msg)
    debug && console.log('msg from react', input)
    const chain = chainer(input, app)
    // debug && console.log('[React node] Chain :', chain)
    chain.on((data, key) => {
        const foundData = trimSoul(data)
        debug && console.log('[GUN node] getOne Data Found: ', foundData)
        messenger.emit(input, foundData)
    })
}

/**
 * getAll and apply any filters, return array of filtered data
 * @param {*} msg 
 */
const getAll = (msg) => {
    const input = inputParser(msg)
    debug && console.log('getAll input', input)
    const chain = chainer(input.key, app)
    const filter = JSON.parse(input.filter)
    chain.once((data, key) => {
        const foundData = trimSoul(data)
        debug && console.log('[GUN node] getAll Data Found: ', foundData)
        let dataFiltered = []
        let id; for (id in foundData) {
            let item = parse(foundData[id])
            debug && console.log('getAll item', item)
            if (item[filter.key]) {
                debug && console.log('getAll key', item[filter.key])
                if (item[filter.key] === filter.value) {
                    dataFiltered.push(item)
                }
            }
        }
        debug && console.log('[GUN node] getAll Data Sending: ', dataFiltered)
        messenger.emit(input.key, dataFiltered)
    })
}

/**
 * `NOT WORKING`
 * Uses Gun map function to filter, emit as filtered
 * 
 * Could be optimization if getAll is too slow
 * @param {*} msg 
 */
const getAllFilter = (msg) => {
    const input = inputParser(msg)
    debug && console.log('getAll input', input)
    const chain = chainer(input.key, app)
    const filter = JSON.parse(input.filter)
    chain.once((data, key) => {
        debug && console.log('[React node] Chain :', chain)
        chain.map(found => {
            debug && console.log('getAll item', item)
            let item = parse(found)
            debug && console.log('getAll key', item[filter.key])
            return item[filter.key] === filter.value ? item : undefined
        }).once((data, key) => {
            const foundData = trimSoul(data)
            debug && console.log('[GUN node] getAll Data Found: ', foundData)
            messenger.emit(input.key, foundData)
        })
    })
}

const getAllOnce = (msg) => {
    const input = inputParser(msg)
    const chain = chainer(input, app)

    let result = {}
    chain.map().on((data, key) => {
        if (!data) {
            debug && console.log('[GUN node] getAllOnce No Data Found',)
        }
        let foundData = trimSoul(data)
        result[key] = foundData
        debug && console.log('[GUN node] getAllOnce Data Found: ', typeof foundData, foundData)
    })
    messenger.emit(input, result)

}


const runChain = (key, app) => {
    return new Promise((resolve, reject) => {
        const chain = chainer(key, app)
        resolve(chain)
    })
}

/**
 * Assign a value to keys, needs to parse msg first
 * @param {*} msg JSON or object
 * @param {string} msg.key `key` or `key1/key2/...`
 * @param {*} msg.value any
 * @param {string} [channel] optional channel name, default name `done`
 */
const putAll = (key, value) => {
    runChain(key, app).then(chain => {
        debug && console.log('Chain prototype:', Object.getPrototypeOf(chain))
        // debug && console.log('[React node] Chain :', chain)
        chain.put(value, ack => {
            const data = trimSoul(value)
            debug && console.log('[NODE_DEBUG_PUT] ERR? ', ack.err)
            messenger.emit(`${key}_put`, ack.err ? ack : data)
        })
    })

}

/**
 * Assign a value to a set, needs to parse JSON msg first
 * @param {*} msg JSON `{key: 'key' || 'key1/key2/...', value: any}`
 */
const setAll = (key, value) => {
    const chain = chainer(key, app)
    debug && console.log('Chain prototype:', Object.getPrototypeOf(chain))
    // debug && console.log('[React node] Chain :', chain)
    chain.set(value, ack => {
        const data = trimSoul(value)
        debug && console.log('[NODE_DEBUG_SET] ERR? ', ack.err)
        messenger.emit(`${key}_set`, ack.err ? ack : data)
    })
}

const offAll = msg => {
    const input = inputParser(msg)
    const chain = chainer(input.key)
    chain.off()
}

// messenger.on('get', msg => {
//     debug && console.log('[React node] incoming get: ' + typeof msg, msg)
//     try {
//         debug && console.log('[GUN node] Getting : ' + msg)
//         getOne(msg)
//     } catch (error) {
//         debug && console.log('[GUN node] : Getting failed' + error)
//     }
// })

// messenger.on('getAll', msg => {
//     debug && console.log('[React node] incoming getAll: ' + typeof msg, msg)
//     try {
//         debug && console.log('[GUN node] Getting All: ' + msg)
//         getAll(msg)
//     } catch (error) {
//         debug && console.log('[GUN node] : Getting All failed ' + error)
//     }
// })

// messenger.on('put', msg => {
//     debug && console.log('[React node] incoming put: ' + typeof msg, msg)
//     try {
//         debug && console.log('[React node] storing - ' , msg)
//         let input = parse(msg)
//         if(input && typeof input === 'object')
//         putAll(input.key, input.value)
//     } catch (error) {
//         debug && console.log('[GUN node] : Putting failed ' + error)
//     }
// })

// messenger.on('set', msg => {
//     debug && console.log('[React node] incoming set: ' + typeof msg, msg)
//     try {
//         debug && console.log('[React node] storing - ' , msg)
//         let input = parse(msg)
//         if(input && typeof input === 'object')
//         setAll(input.key, input.value)
//     } catch (error) {
//         debug && console.log('[GUN node] : Setting failed ' + error)
//     }
// })

// messenger.on('off', msg => {
//     debug && console.log('[React node] incoming off: ' + typeof msg, msg)
//     try {
//         debug && console.log('[React node] Off - ' + msg)
//         offAll(msg)
//     } catch (error) {
//         debug && console.log('[GUN node] : Off failed ' + error)
//     }
// })

export {
    chainer,
    app,
    getOne as get,
    getAll,
    getAllOnce,
    putAll as put,
    setAll as set,
    offAll as off,
    messenger as channel,
};

