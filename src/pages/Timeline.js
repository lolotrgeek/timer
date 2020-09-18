import React, {useState, useEffect} from 'react';
import { Text, View, SafeAreaView, Button, } from 'react-native';
import TimelineList from '../components/TimelineList'
import styles from '../styles/mainStyles'
import messenger from '../constants/Messenger'


export default function Timeline({ useHistory }) {
    let history = useHistory()
    const[ online, setOnline] =useState('')

    useEffect(() => {
        messenger.addListener('status', msg => {
            setOnline(msg)
        })
        return () => messenger.removeAllListeners('status')
    })

    const Header = () => (
        <View style={styles.header}>
            <Text style={styles.title}>Timeline</Text>
            <Text >{online}</Text>
            {/* <Button title='Test Msg' onPress={() => messenger.emit('React', {Test: 'test'})} /> */}
        </View>
    )

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <TimelineList useHistory={useHistory} />
        </SafeAreaView>
    );
}