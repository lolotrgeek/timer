import {Alert} from '../components/Alert.native'

export function useAlert() {
    /**
     * 
     * @param {*} message 
     * @param {*} options 
     */
    const show = (message, options) => Alert(message)
    return {show}
}