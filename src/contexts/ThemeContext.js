import React, { createContext } from 'react'
import getStyleSheet from '../styles/mainStyles'

const theme = getStyleSheet('dark')

const ThemeContext = createContext(theme)
export const ThemeProvider = ThemeContext.Provider
export default ThemeContext