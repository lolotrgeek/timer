import React from 'react'
import { Text as DefaultText } from 'react-native'
import getStyleSheet from '../styles/mainStyles'

export default function Text(props) {
    const styles = getStyleSheet('dark')
    return (<DefaultText style={[styles.text, props.style]}>{props.children}</DefaultText>)
}
