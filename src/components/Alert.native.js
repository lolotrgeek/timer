import React from 'react'
import { ToastAndroid } from "react-native";

/**
 * @param {*} message
 */
export const Alert = (message, type) => ToastAndroid.showWithGravity(message, ToastAndroid.SHORT, ToastAndroid.BOTTOM);