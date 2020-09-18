import React from 'react';
import { Text, View, SafeAreaView, Button, } from 'react-native';
import TimelineList from '../components/TimelineList'
import styles from '../styles/mainStyles'


export default function Timeline({ useHistory }) {
    let history = useHistory()
    const Header = () => (
        <View style={styles.header}>
            <Text style={styles.title}>Timeline</Text>
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