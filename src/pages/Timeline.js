// display a list of timers: timeline (date/timers), project records (project/timers)


import React, {useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button } from 'react-native';
import Running from '../components/Running'
import TimerList from '../components/TimerList'
import { projectCreatelink } from '../routes'
import messenger from '../constants/Messenger'
import '../state/timelineState'

const debug = false
const test = false
const loadAll = false
const pagesize = 4

export default function Timeline({ useHistory }) {
    let history = useHistory()
    const [online, setOnline] = useState(false)

    const Header = () => (
        <View style={styles.header}>
            <Running />
        </View>
    )

    const Footer = () => (
        <View style={{ position: 'absolute', bottom: 0, flexDirection: 'row', padding: 10, width: '100%', backgroundColor: 'white', zIndex: 10000, flexDirection: 'column' }}>
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
            <TimerList useHistory={useHistory}/>
            <Footer />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: { position: 'absolute', marginTop: 50, top: 0, flexDirection: 'row', padding: 10, width: '100%', backgroundColor: 'white', zIndex: 10000, flexDirection: 'column' },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        margin: 20,
    },
    status: {
        fontSize: 30,
    }
});
