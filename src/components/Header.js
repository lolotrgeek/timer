import React from 'react';
import { Text, View } from 'react-native';
import styles from '../styles/mainStyles'

export default function Header (props) {
    let history = props.useHistory()
    
    return (
    <View style={styles.header}>
        <View style={styles.navigation}>
            <View style={{ margin: 10 }}>
                <Text onPress={()=> history.push('/')}>Timeline</Text>
            </View>
            <View style={{ margin: 10 }}>
                <Text onPress={()=> history.push('/projects')}>Projects</Text>
            </View>
        </View>
        <Text style={styles.title}>{props.title}</Text>
        {/* <Button title='Test Msg' onPress={() => messenger.emit('React', {Test: 'test'})} /> */}
    </View>)
}