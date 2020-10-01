import React, { createContext } from 'react'
import getStyleSheet from '../styles/mainStyles'

// theme and styles being set, here
// TODO: make this dynamic for settings
const theme = getStyleSheet('dark')

const ThemeContext = createContext(theme)
export const ThemeProvider = ThemeContext.Provider
export default ThemeContext