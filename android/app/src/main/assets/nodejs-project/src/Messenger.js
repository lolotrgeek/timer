const native = require('./native-bridge')

function emit(channelname, event) {
    native.channel.post(channelname, event)
}

function addListener (channelname, event) {
    native.channel.on(channelname, event)
}

function on (channelname, event) {
    native.channel.on(channelname, event)
}

exports = {emit, addListener, on}