
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
export default function Running({ useHistory }) {
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

    const FooterButtons = () => (
        <View style={{ maxWidth: 400, flexDirection: 'row', justifyContent: 'space-evenly', }}>
            <Button title='Refresh' onPress={() => setRefresh(!refresh)} />
            {/* <Button title='Delete' onPress={() => {
                messenger.emit(`running/delete`, running)
                history.push('/')
            }} /> */}
        </View>
    )

    const Footer = () => (
        <View style={{ position: 'absolute', bottom: 0, padding: 10, width: '100%', alignContent: 'center', backgroundColor: 'white', zIndex: 999999, height: 50 }}>
            <FooterButtons />
        </View>
    )
    const onTimeStart = date => { messenger.emit('chooseRunningStart', new Date(date)); setRefresh(!refresh) }

    if (!running || !running.id) return (<Text>No Running</Text>)
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.list}>
                <View style={{ marginTop: 10, maxWidth: 400, }}>
                    <Text style={{ textAlign: 'center', }}>{running.name} | {running.id} | {running.status}</Text>
                    <Text style={{ textAlign: 'center', fontSize: 30 }}>{count}</Text>
                </View>
                <View style={{ maxWidth: 400, alignItems: 'center' }}>

                    {/* <Text>{running.started.toString()}</Text> */}
                    <PickerTime
                        label='Start'
                        time={new Date(running.started)}
                        onTimeChange={onTimeStart}
                        addMinutes={() => { messenger.emit('increaseRunning', running); setRefresh(!refresh) }}
                        subtractMinutes={() => { messenger.emit('decreaseRunning', running); setRefresh(!refresh) }}
                    />
                </View>

            </View>
            <Footer />
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
        height: Dimensions.get('window').height - 120,
        width: '100%',
        marginBottom: 50,
    },
    button: {
        margin: 20,
    },
    status: {
        fontSize: 30,
    }
});

