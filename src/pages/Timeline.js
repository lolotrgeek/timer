// display a list of timers: timeline (date/timers), project records (project/timers)


import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, } from 'react-native';
import TimelineList from '../components/TimelineList'
import { projectCreatelink } from '../routes'
import messenger from '../constants/Messenger'

const debug = false
const test = false
const loadAll = false
const pagesize = 4

export default function Timeline({ useHistory }) {
    let history = useHistory()
    const [refresh, setRefresh] = useState(false)

    useEffect(() => {
        messenger.emit('getRunning')
        return () => { }
    }, [])

    const Header = () => (
        <View style={{width: '100%', padding: 10, backgroundColor: 'white', flexDirection: 'column'}}>
            {/* <Button title='Test Msg' onPress={() => messenger.emit('React', {Test: 'test'})} /> */}
            <Button title='Test Projects' onPress={() => messenger.emit('GenerateProjects')} />
        </View>
    )

    const Footer = () => (
        <View style={{ position: 'absolute', bottom: 0, padding: 10, width: '100%', backgroundColor: 'white', zIndex: 999999, flexDirection: 'column', height: 50 }}>
            <Button
                onPress={() => history.push(projectCreatelink())}
                title='Create Project'
            />
        </View>
    )
    // if (!ready) return (<View style={styles.container}><Text> Loading...</Text></View>)
    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <TimelineList useHistory={useHistory} />
            <Footer />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ccc',
    },
    button: {
        margin: 20,
    },
    status: {
        fontSize: 30,
    }
});
