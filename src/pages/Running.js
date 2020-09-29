
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, Dimensions, } from 'react-native';
import { timeSpan, totalTime, timeString, dateSimple, endOfDay, isRunning, secondsToString } from '../constants/Functions'
import messenger from '../constants/Messenger'
import { PickerTime } from '../components/Pickers'
import { useAlert } from '../hooks/useAlert'

const debug = false
var executed = false;

/**
 * get Running once on first load
 */
var getRunning = (function () {
    return function () {
        if (!executed) {
            executed = true;
            debug && console.log('get Running')
            messenger.emit('getRunning')
        }
    };
})();
export default function Running({ useHistory, styles }) {
    let history = useHistory();
    const [refresh, setRefresh] = useState(false)
    const [running, setRunning] = useState({ id: 'none', name: 'none', project: 'none' })
    const [count, setCount] = useState(0)

    const alert = useAlert()

    useEffect(() => {
        messenger.addListener('alert', msg => {
            if (msg && msg.length > 0) {
                alert.show(msg[1], {
                    type: msg[0]
                })
            }
        })

        messenger.addListener('running', event => {
            if (event && event.status === 'running') {
                setRunning(event)
                // messenger.emit('getPage', { currentday:0, refresh: true, pagesize: pagesize })
            } if (event.status === 'done') {
                setRunning({ id: 'none' })
                // remove today's section from UI state
                // request state recalculate today's section
            }
        })
        getRunning()

        messenger.addListener("count", event => {
            setCount(event)
        })
        return () => {
            messenger.removeAllListeners('running')
            messenger.removeAllListeners('alert')
            messenger.removeAllListeners("count")

        }
    }, [])

    const onTimeStart = date => { messenger.emit('chooseRunningStart', new Date(date)); setRefresh(!refresh) }

    if (!running || !running.id || running.id === 'none') return (
        <View style={{ maxWidth: 400, }}>
            <Text style={{ fontSize: 30 }}> No Running</Text>
            <View style={{ width: 100, margin: 10 }}>
                <Button onPress={() => history.push('/')} title='Go Home' />
            </View>
        </View>
    )
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text >{running.name} | {running.id} | {running.status}</Text>
                <Text style={styles.title}>{count}</Text>
            </View>
            <PickerTime
                time={new Date(running.started)}
                onTimeChange={onTimeStart}
                addMinutes={() => { messenger.emit('increaseRunning', running); setRefresh(!refresh) }}
                subtractMinutes={() => { messenger.emit('decreaseRunning', running); setRefresh(!refresh) }}
            />
            <View style={styles.row}>
                <View style={styles.button}>
                    <Button title='Save' onPress={() => {
                        messenger.emit("saveRunningEdits", { timerId: running.id })
                    }} />
                </View>
                <View style={styles.button}>
                    {running.status === 'done' ?
                        //TODO: assuming that project exists on start... needs validation
                        <Button title='start' onPress={() => {
                            messenger.emit('start', { projectId: running.project })
                        }} /> :
                        <Button title='stop' onPress={() => {
                            messenger.emit('stop', { projectId: running.project })
                        }} />
                    }
                </View>
            </View>
        </SafeAreaView >
    );
}
