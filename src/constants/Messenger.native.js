import { NativeModules, NativeEventEmitter } from 'react-native';
const { Heartbeat } = NativeModules;
const emitter = new NativeEventEmitter(Heartbeat)

console.log('native Messenger')
/**
 * 
 * @param {string} channel 
 * @param {*} event 
 */
function emit(channel, event) {
    const payload = JSON.stringify(event)
    Heartbeat.sendToNode(channel, payload)
}

/**
 * 
 * @param {string} channel 
 * @param {Function} listener 
 */
function addListener(channel, listener) {
    emitter.addListener(channel, event => {
        let payload
        try {
            payload = JSON.parse(event);
        } catch (e) {
            payload = event
        }
        listener(payload)
    })
}

/**
 * 
 * @param {string} channel 
 * @param {Function} listener 
 */
function removeAllListeners(channel) {
    emitter.removeAllListeners(channel)
}

export default messenger = { addListener, emit, removeAllListeners}