
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, Button, Dimensions, } from 'react-native';
import Text from '../components/Text'
import { timeSpan, totalTime, timeString, dateSimple, endOfDay, isRunning, secondsToString } from '../constants/Functions'
import messenger from '../constants/Messenger'
import { timerHistorylink, projectlink } from '../routes'
import { PickerDate, PickerTime } from '../components/Pickers'
import { useAlert } from '../hooks/useAlert'


const debug = false
const test = false
const loadAll = false

export default function Timer({ useHistory, useParams, styles }) {
    let history = useHistory();
    let { timerId, projectId } = useParams();
    const [refresh, setRefresh] = useState(false)
    const [timer, setTimer] = useState({});
    const alert = useAlert()

    useEffect(() => {
        messenger.addListener('alert', msg => {
            if (msg && msg.length > 0) {
                alert.show(msg[1], {
                    type: msg[0]
                })
            }
        })
        // TODO: destroys edits on refresh, keep state through refresh
        if (timerId) {
            messenger.addListener(`${timerId}`, event => { setTimer(event) })
            messenger.emit('getTimer', { timerId })
        }
        else if (projectId) {
            messenger.addListener('newEntryCreated', event => {
                setTimer(event)
                timerId = event.id
                messenger.addListener(`${event.id}`, event => { setTimer(event) })
            })
            messenger.emit('newEntry', { projectId })
        }
        return () => {
            messenger.removeAllListeners(`${timerId}`)
            messenger.removeAllListeners('newEntryCreated')
            messenger.removeAllListeners('alert')
        }
    }, [])

    const FooterButtons = () => (
        <View style={styles.footerbuttons}>
            <Button title='Refresh' onPress={() => setRefresh(!refresh)} />
            {timer && timer.status !== 'deleted' ?
                <Button title='Delete' onPress={() => {
                    messenger.emit(`${timerId}/delete`, timer)
                    history.push(projectlink(timer.project))
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

    const Footer = () => (
        <View style={styles.footer}>
            <FooterButtons />
        </View>
    )
    const onDateChoose = date => { messenger.emit('chooseNewDate', new Date(date)); setRefresh(!refresh) }
    const onTimeStart = date => { messenger.emit('chooseNewStart', new Date(date)); setRefresh(!refresh) }
    const onTimeEnd = date => { messenger.emit('chooseNewEnd', new Date(date)); setRefresh(!refresh) }

    if (!timer || !timer.id) return (<View style={styles.header}><Text style={styles.title}>No Timer</Text></View>)
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.body}>
                <View style={styles.header}>
                    <Text style={{ textAlign: 'center', }}>{timer.name} | {timer.id} | {timer.status}</Text>
                    <Text style={{ textAlign: 'center', fontSize: 30 }}>{timerId === 'running' ? 'Tracking...' : secondsToString(totalTime(timer.started, timer.ended))}</Text>
                </View>
                <View style={styles.containerwidth}>
                    {/* <Text>{timer.status}</Text> */}
                    <PickerDate
                        label='Date'
                        startdate={timerId === 'running' ? dateSimple(timer.started) : timer.started}
                        onDateChange={onDateChoose}
                        maxDate={endOfDay(new Date())}
                        previousDay={() => { messenger.emit('prevDay', timer); setRefresh(!refresh) }}
                        nextDay={() => { messenger.emit('nextDay', timer); setRefresh(!refresh) }}
                        running={timerId === 'running'}
                        styles={styles}
                    />
                    {/* <Text>{timer.started.toString()}</Text> */}
                    <PickerTime
                        label='Start'
                        time={new Date(timer.started)}
                        onTimeChange={onTimeStart}
                        addMinutes={() => { messenger.emit('increaseStarted', timer); setRefresh(!refresh) }}
                        subtractMinutes={() => { messenger.emit('decreaseStarted', timer); setRefresh(!refresh) }}
                        styles={styles}

                    />
                    {/* <Text>{timer.ended.toString()}</Text> */}
                    <PickerTime
                        label='End'
                        time={new Date(timer.ended)}
                        onTimeChange={onTimeEnd}
                        addMinutes={() => { messenger.emit('increaseEnded', timer); setRefresh(!refresh) }}
                        running={timerId === 'running'}
                        subtractMinutes={() => { messenger.emit('decreaseEnded', timer); setRefresh(!refresh) }}
                        styles={styles}

                    />
                    <View style={styles.button}>
                        <Button title='Save' onPress={() => {
                            messenger.emit(`${timer.id}/saveEdits`, { timerId: timer.id })
                            history.push(projectlink(timer.project))
                        }} />
                    </View>
                </View>
            </View>
            <Footer />
        </SafeAreaView >
    );
}
