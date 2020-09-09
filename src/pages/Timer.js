// display a list of daytimers: timeline (date/daytimers), project records (project/daytimers)

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, Dimensions, } from 'react-native';
import { timeSpan, totalTime, timeString, dateSimple, endOfDay, isRunning, secondsToString } from '../constants/Functions'
import messenger from '../constants/Messenger'
import { timerHistorylink, projectlink } from '../routes'
import { PickerDate, PickerTime } from '../components/Pickers'

const debug = false
const test = false
const loadAll = false

export default function Timer({ useHistory, useParams }) {
    let history = useHistory();
    let { timerId, projectId } = useParams();
    const [refresh, setRefresh] = useState(false)
    const [timer, setTimer] = useState({});

    useEffect(() => {
        // TODO: destroys edits on refresh, keep state through refresh
        messenger.addListener(`${timerId}`, event => { setTimer(event) })
        if (timerId) messenger.emit('getTimer', { timerId })
        else if (projectId) messenger.emit('newEntry', { projectId })
        return () => {
            messenger.removeAllListeners(`${timerId}`)
            messenger.removeAllListeners(`${timerId}/editComplete`)
        }
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
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 70, margin: 30, }}><Text style={{ fontSize: 30 }}>Total</Text></View>
                    <View style={{ width: 120, margin: 20 }}><Text style={{ fontSize: 30 }}>{secondsToString(totalTime(timer.started, timer.ended))}</Text></View>
                </View>
                {/* <Text>{timer.status}</Text> */}
                <PickerDate
                    label='Date'
                    startdate={new Date(timer.started)}
                    onDateChange={onDateChoose}
                    maxDate={endOfDay(new Date())}
                    previousDay={() => { messenger.emit('prevDay', timer); setRefresh(!refresh) }}
                    nextDay={() => { messenger.emit('nextDay', timer); setRefresh(!refresh) }}
                />
                {/* <Text>{timer.started.toString()}</Text> */}
                <PickerTime
                    label='Start'
                    time={new Date(timer.started)}
                    onTimeChange={onTimeStart}
                    addMinutes={() => { messenger.emit('increaseStarted', timer); setRefresh(!refresh) }}
                    subtractMinutes={() => { messenger.emit('decreaseStarted', timer); setRefresh(!refresh) }}
                />
                {/* <Text>{timer.ended.toString()}</Text> */}
                <PickerTime
                    label='End'
                    time={new Date(timer.ended)}
                    onTimeChange={onTimeEnd}
                    addMinutes={() => { messenger.emit('increaseEnded', timer); setRefresh(!refresh) }}
                    running={isRunning(timer)}
                    subtractMinutes={() => { messenger.emit('decreaseEnded', timer); setRefresh(!refresh) }}
                />
                <View style={styles.button}>
                    <Button title='Save' onPress={() => {
                        messenger.emit(`${timer.id}/saveEdits`, { timerId: timer.id })
                        history.push(projectlink(timer.project))
                    }} />
                </View>
            </View>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        padding: 10,
        width: '100%',

    },
    container: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
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

