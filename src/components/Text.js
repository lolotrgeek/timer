import React, { useContext } from 'react'
import { Text as DefaultText } from 'react-native'
import ThemeContext from '../contexts/ThemeContext';

// TODO: add settings for each device in gun
export default function Text(props) {
    const styles = useContext(ThemeContext)
    return (<DefaultText {...props} style={[styles.text, props.style]}>{props.children}</DefaultText>)
}
