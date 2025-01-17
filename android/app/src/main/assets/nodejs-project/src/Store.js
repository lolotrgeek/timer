/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const Gun = require('gun')
const path = require('path')
const messenger = require('./Messenger')
const fs = require("fs")

const debug = false
const config = {
    port: process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8765,
    host: 'localhost'
};
const port = '8765'
const address = '192.168.1.109'
const peers = [`http://${address}:${port}/gun`]

config.server = require('http').createServer(Gun.serve(__dirname))
// debug && console.log('GUN config ', config)
const gun = new Gun({
    // Defaults
    web: config.server.listen(config.port, config.host),
    file: path.join(__dirname, 'radata'),
    // peers: peers

})
debug && console.log('Relay peer started on port ' + config.port + ' with /gun')
const app = gun.get('app')
// debug && console.log('App prototype:', Object.getPrototypeOf(app))

const updateStatus = () => {
    let livepeers = gun._.opt.peers
    debug && console.log(livepeers)
    if (livepeers) {
        messenger.emit('status', 'online')
    }

    gun.on('hi', peer => {
        messenger.emit('status', 'online')
    })

    gun.on('bye', peer => {
        if (Object.keys(livepeers).length <= 1) {
            messenger.emit('status', 'offline')
        }
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
    chain.once((data, key) => {
        const foundData = trimSoul(data)
        debug && console.log('[GUN node] getOne Data Found: ', foundData)
        messenger.emit(input, foundData)
    })
}

const getOnce = (msg) => {
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
 * `DEPRECATED`
 * getAll and apply any filters, return array of filtered data
 * @param {*} msg 
 */
const getAllOld = (msg) => {
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

const getAll = (msg) => {
    const input = inputParser(msg)
    const chain = chainer(input, app)

    let result = []
    chain.map().on((data, key) => {
        if (!data) {
            debug && console.log('[GUN node] getAll No Data Found',)
        }
        let foundData = trimSoul(data)
        result.push(foundData)
        debug && console.log('[GUN node] getAll Data Found: ', typeof foundData, foundData)
    })
    messenger.emit(input, result)

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
 * @todo seems to crash the app when there is an err, my guess is that it emits a malformed msg over native bridge
 */
const putAll = (key, value) => {
    const chain = chainer(key, app)
    // debug && console.log('Chain prototype:', Object.getPrototypeOf(chain))
    // debug && console.log('[React node] Chain :', chain)
    chain.put(value, ack => {
        debug && console.log('[NODE_DEBUG_PUT] ERR? ', ack.err)
        debug && console.log('[NODE_DEBUG_PUT] SUCCESS: ', key, value)
        messenger.emit(key, ack.err ? ack : value)
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
        debug && console.log(key, value)
        messenger.emit(`${key}_set`, ack.err ? ack : data)
    })
}

/**
 * Remove a value from a set, needs to parse JSON msg first
 * @param {*} msg JSON `{key: 'key' || 'key1/key2/...', value: any}`
 */
const unsetAll = (key) => {
    const chain = chainer(key, app)
    debug && console.log('Chain prototype:', Object.getPrototypeOf(chain))
    // debug && console.log('[React node] Chain :', chain)
    chain.set(null, ack => {
        debug && console.log('[NODE_DEBUG_SET] ERR? ', ack.err)
        messenger.emit(`${key}_unset`, ack.err ? ack : key)
    })
}

const offAll = msg => {
    const input = inputParser(msg)
    const chain = chainer(input.key)
    chain.off()
}

// EXPORT FUNCTIONS

/**
 * 
 * @param {array} values typically an array of `Object.values()`
 */
function iskeyset(values) {
    return values.some(value => value && value['#'] && typeof value['#'] === 'string')
}

/**
 * 
 * @param {*} file 
 * @param {*} entry 
 */
const save = (file, entry) => fs.writeFile(file, entry, "utf8", () => { })
/**
 * Walks the graph
 * @param {*} key 
 * @param {*} final 
 * @todo works, but seems to miss certain keys... cause unknown... see TODO below
 */
const recursiveCall = (key, final) => {
    return new Promise((resolve) => {
        gun.get(key).once((current, currentkey) => {
            if (current && current !== null && current !== undefined) {
                // console.log('export: ', current)
                current = trimSoul(current)
                final[key] = current
                // let entry = `${JSON.stringify(key)}:${JSON.stringify(current)}`
                // final.push(entry)
                // log(`[Updating] ${JSON.stringify(entry)}`)
                let values = Object.values(current)
                if (iskeyset(values) === true) {
                    values.forEach(async value => {
                        resolve(recursiveCall(value['#'], final))
                    })
                }
                else {
                    // save(output, JSON.stringify(final))
                    console.log('exported: ', currentkey)
                    return resolve()
                }
            }
        })
        // printProgress(key)
    })

}


/**
 * Convert radata into JSON and save it
 */
function Export() {
    let final = {}
    console.log('Export Started...')
    recursiveCall('app', final)
        .then(() => messenger.emit('alert', ['Success', 'Export done.']))
        .catch(err => messenger.emit('alert', ['Error', 'Export failed.']))
}

module.exports = {
    updateStatus,
    chainer,
    app,
    get: getOne,
    getOnce: getOnce,
    getAll,
    getAllOnce,
    put: putAll,
    set: setAll,
    unset: unsetAll,
    off: offAll,
    Export: Export,
};

