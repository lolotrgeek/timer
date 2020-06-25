import messenger from '../constants/Messenger'
export { app, chainer } from '../data/Store.web'
export const put = (key, value) => messenger.emit('put', {key, value})
export const set = (key, value) => messenger.emit('set', {key, value})
export const get = (key) => messenger.emit('get', key)
export const getAll = (key) => messenger.emit('getAll', key)
export const getAllOnce = (key) => messenger.emit('getAllOnce', key)