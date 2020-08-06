// display a list of daytimers: timeline (date/daytimers), project records (project/daytimers)


import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, Dimensions } from 'react-native';
import { timeSpan, totalTime } from '../constants/Functions'
import * as Data from '../data/Data'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import { timerHistorylink, projectlink } from '../routes'
import '../state/timerState'


const debug = false
const test = false
const loadAll = false


export default function Timer({ useHistory, useParams }) {
    let history = useHistory();
    let { timerId } = useParams();
    const [online, setOnline] = useState(false)
    const [timer, setTimer] = useState();

    useEffect(() => {
        messenger.addListener(`${timerId}`, event => {
            setTimer(event)
        })
        messenger.emit('getTimer', { timerId })
        return () => messenger.removeAllListeners(`${timerId}`)
    }, [online])


    const HeaderButtons = () => (
        <View style={{ flexDirection: 'row' }}>
            <Button title='Refresh' onPress={() => {
                setOnline(!online)
            }} />
            <Button title='Clear' onPress={() => {
                setTimer([])
                setOnline(!online)
            }} />
            <Button title='Delete' onPress={() => {
                Data.deleteTimer(timer)
                history.push(projectlink(timer.project))
            }} />
            <Button title='History' onPress={() => {
                history.push(timerHistorylink(timerId))
            }} />
        </View>
    )

    const Header = () => (
        <View style={styles.header}>
            <HeaderButtons />
        </View>
    )

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <View style={styles.list}>
                {timer ? <View>
                    <Text>{timer.project}</Text>
                    <Text>{timer.started}</Text>
                    <Text>{timer.ended}</Text>
                    <Text>{totalTime(timer.started, timer.ended)}</Text>
                    <Text>{timer.mood}</Text>
                    <Text>{timer.energy}</Text>
                </View>
                    : <Text>No Timer</Text>}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        marginTop: 50,
        top: 0,
        flexDirection: 'row',
        padding: 10,
        width: '100%',
        background: 'white',
        zIndex: 10000,
        flexDirection: 'column'
    },
    container: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        marginTop: 170,
        height: Dimensions.get('window').height - 170,
        flexDirection: 'row',
        width: '100%',
        backgroundColor: '#ccc'
    },
    button: {
        margin: 20,
    },
    status: {
        fontSize: 30,
    }
});

