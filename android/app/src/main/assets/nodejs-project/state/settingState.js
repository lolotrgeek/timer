/* eslint-disable no-unused-vars */
exports.SettingState = p => {
    p.messenger.on(`export`, msg => {
        if (msg) {
            p.Export() // todo: make this a promise...
        }
    })
}