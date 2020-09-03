
exports.test = p => {
    p.messenger.on('React', msg => {
        console.log('React Msg', typeof msg, msg)
        p.messenger.emit("App", { test: 'received' })
    })
}