// display a list of daytimers: timeline (date/daytimers), project records (project/daytimers)

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, Dimensions, } from 'react-native';
import { timeSpan, totalTime, timeString, dateSimple, endOfDay, isRunning } from '../constants/Functions'
import messenger from '../constants/Messenger'
import { timerHistorylink, projectlink } from '../routes'
import { PickerDate, PickerTime } from '../components/Pickers'

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

    const onDateChoose = date => { messenger.emit('chooseNewDate', date); setRefresh(!refresh) }
    const onTimeStart = date => { messenger.emit('chooseNewStart', date); setRefresh(!refresh) }
    const onTimeEnd = date => { messenger.emit('chooseNewEnd', date); setRefresh(!refresh) }

    if (!timer || !timer.id) return (<Text>No Timer</Text>)
    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <View style={styles.list}>
                <Text>Total: {totalTime(timer.started, timer.ended)}</Text>
                <Text>{timer.status}</Text>
                <PickerDate
                        label='Date'
                        startdate={new Date(timer.started)}
                        onDateChange={onDateChoose}
                        maxDate={endOfDay(new Date())}
                        previousDay={() => { messenger.emit('prevDay', timer); setRefresh(!refresh) }}
                        nextDay={() => { messenger.emit('nextDay', timer); setRefresh(!refresh) }}
                    />
                    {/* {started.toString()} */}
                    <PickerTime
                        label='Start'
                        time={new Date(timer.started)}
                        onTimeChange={onTimeStart}
                        addMinutes={() => { messenger.emit('increaseStarted', timer); setRefresh(!refresh) }}
                        subtractMinutes={() => { messenger.emit('decreaseStarted', timer); setRefresh(!refresh) }}
                    />
                    {/* {ended.toString()} */}
                    <PickerTime
                        label='End'
                        time={new Date(timer.ended)}
                        onTimeChange={onTimeEnd}
                        addMinutes={() => { messenger.emit('increaseEnded', timer); setRefresh(!refresh) }}
                        running={isRunning(timer)}
                        subtractMinutes={() => { messenger.emit('decreaseEnded', timer); setRefresh(!refresh) }}
                    />

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

