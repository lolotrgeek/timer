import * as store from './Store.back'

export const put = (key, value) => store.put({ key: key, value: value })
export const set = (key, value) => store.set({ key: key, value: value })
export const get = (key) => store.get(key)
export const getAll = (key) => store.getAll(key)
export const getAllOnce = (key) => store.getAllOnce(key)