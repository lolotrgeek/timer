const native = require('./native-bridge')

exports.emit = (channelname, event) => native.channel.post(channelname, event)
exports.addListener = (channelname, event) => native.channel.on(channelname, event)
exports.on = (channelname, listener) => {
    native.channel.on(channelname, event => {
        let payload
        try {
            payload = JSON.parse(event)
        } catch (error) {
            payload = event
        }
        listener(payload)
    })
}

exports.removeAllListeners = (channelname) => {
    native.channel.removeAllListeners(channelname)
}
