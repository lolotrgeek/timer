import * as web from './Store.web'
export const chainer = web.chainer
export const app = web.app
export const put = (key, value) => web.put(key, value)
export const set = (key, value) => web.set(key, value)
export const unset = (key) => web.unset(key)
export const get = (key) => web.get(key)
export const getAll = (key) => web.getAll(key)
export const getAllOnce = (key) => web.getAllOnce(key)
