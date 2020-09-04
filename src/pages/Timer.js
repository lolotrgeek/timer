// display a list of daytimers: timeline (date/daytimers), project records (project/daytimers)


import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, Dimensions, } from 'react-native';
import { timeSpan, totalTime, timeString, dateSimple } from '../constants/Functions'
import messenger from '../constants/Messenger'
import { timerHistorylink, projectlink } from '../routes'

const debug = false
const test = false
const loadAll = false

export default function Timer({ useHistory, useParams }) {
    let history = useHistory();
    let { timerId } = useParams();
    const [refresh, setRefresh] = useState(false)
    const [timer, setTimer] = useState({});

    useEffect(() => {
        // TODO: destroys edits on refresh, keep state through refresh
        messenger.addListener(`${timerId}`, event => {
            setTimer(event)
        })
        messenger.emit('getTimer', { timerId })
        return () => messenger.removeAllListeners(`${timerId}`)
    }, [])

    const HeaderButtons = () => (
        <View style={{ flexDirection: 'row' }}>
            <Button title='Refresh' onPress={() => setRefresh(!refresh)} />
            {timer && timer.status !== 'deleted' ?
                <Button title='Delete' onPress={() => {
                    messenger.emit(`${timerId}/delete`, timer)
                    // history.push(projectlink(timer.project))
                }} />
                : timer.status === 'deleted' ?
                    <Button title='Restore' onPress={() => { }} />
                    : <Text></Text>
            }
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
    if (!timer || !timer.id) return (<Text>No Timer</Text>)
    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <View style={styles.list}>
                <Text>Total: {totalTime(timer.started, timer.ended)}</Text>
                <Text>{timer.status}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Button title='<' onPress={() => { messenger.emit('prevDay', timer); setRefresh(!refresh) }} />
                    <Text>{dateSimple(timer.started)}</Text>
                    <Button title='>' onPress={() => { messenger.emit('nextDay', timer); setRefresh(!refresh) }} />
                </View>

                <View style={{ flexDirection: 'row' }}>
                    <Button title='<' onPress={() => { messenger.emit('decreaseStarted', timer); setRefresh(!refresh) }} />
                    <Text>{timeString(timer.started)}</Text>
                    <Button title='>' onPress={() => { messenger.emit('increaseStarted', timer); setRefresh(!refresh) }} />
                </View>

                <View style={{ flexDirection: 'row' }}>
                    <Button title='<' onPress={() => { messenger.emit('decreaseEnded', timer); setRefresh(!refresh) }} />
                    <Text>{timeString(timer.ended)}</Text>
                    <Button title='>' onPress={() => { messenger.emit('increaseEnded', timer); setRefresh(!refresh) }} />
                </View>

                <Text>{timer.mood}</Text>
                <Text>{timer.energy}</Text>

                <Button title='Save' onPress={() => {
                    messenger.emit(`${timerId}/saveEdits`, { timerId })
                    console.log(`${timerId}/saveEdits`)
                }} />

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
        backgroundColor: 'white',
        zIndex: 10000,
        flexDirection: 'column',

    },
    container: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        marginTop: 170,
        height: Dimensions.get('window').height - 170,
        flexDirection: 'column',
        alignItems: 'center',
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

