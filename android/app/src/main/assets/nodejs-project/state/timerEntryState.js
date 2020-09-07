exports.timerEntryState = p => {
    p.messenger.on('newEntry', msg => {
        if(msg && msg.projectId) {
            
        }
    })
}