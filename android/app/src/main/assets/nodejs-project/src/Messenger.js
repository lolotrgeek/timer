const native = require('./native-bridge')

exports.emit = (channelname, event) => {
    native.channel.post(channelname, event)
}

exports.addListener =(channelname, event)=> {
    native.channel.on(channelname, event)
}

exports.on = (channelname, event) => {
    native.channel.on(channelname, event)
}
