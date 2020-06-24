import * as web from './Store.web'

export const put = (key, value) => web.put({ key: key, value: value })
export const set = (key, value) => web.set({ key: key, value: value })
export const get = (key) => web.get(key)
export const getAll = (key) => web.getAll(key)
export const getAllOnce = (key) => web.getAllOnce(key)