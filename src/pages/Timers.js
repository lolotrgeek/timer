// display a list of timers: timeline (date/timers), project records (project/timers)


import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button } from 'react-native';
import { totalTime } from '../constants/Functions'
import * as Data from '../data/Data'
import { putHandler, runningHandler, timersHandler } from '../data/Handlers'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import { FlatList } from 'react-native-gesture-handler';

const debug = false
const test = false



export default function Timers() {

    const [online, setOnline] = useState(false)
    const [timers, setTimers] = useState([])
    const [count, setCount] = useState(0)
    const running = useRef({ id: 'none', name: 'none', project: 'none' })

    useEffect(() => Data.getRunning(), [online])

    useEffect(() => {
        messenger.addListener("put", event => putHandler(event, { running, setTimers }))
        return () => messenger.removeAllListeners("put")
    }, [])

    useEffect(() => {
        messenger.addListener("count", event => setCount(event))
        return () => messenger.removeAllListeners("count")
    }, [])

    useEffect(() => {
        messenger.addListener(chain.running(), event => runningHandler(event, { running: running }))
        return () => messenger.removeAllListeners(chain.running())
    }, [])

    useEffect(() => {
        messenger.addListener(chain.timers(), event => timersHandler(event, { timers, setTimers, running }))
        return () => {
            messenger.removeAllListeners(chain.timers())
        }
    }, [online])


    useEffect(() => {
        console.log('Get timers...')
        Data.getTimers()
    }, [online])



    const renderTimer = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row', margin: 10 }}>
                <View style={{ width: '30%' }}>
                    <Text style={{ color: 'red' }}>{item.id}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Text style={{ color: 'red' }}>{JSON.stringify(item.project)}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Text style={{ color: 'red' }}>{totalTime(item.started, item.ended)}</Text>
                </View>
            </View>
        );
    };

    const RunningTimer = () => {
        return (
            <View style={{ flexDirection: 'row', margin: 10 }}>
                <View style={{ width: '25%' }}>
                    <Text>{running.current.name ? running.current.name : 'no Project'}</Text>
                    <Text>{running.current.project ? running.current.project : ''}</Text>
                </View>
                <View style={{ width: '25%' }}>
                    <Text>{running.current.status === 'done' || running.current.id === 'none' ? 'Last Run: ' + running.current.id : 'Running: ' + running.current.id}</Text>
                </View>
                <View style={{ width: '25%' }}>
                    <Text>{count}</Text>
                </View>
                <View style={{ width: '25%' }}>
                    {!running.current || running.current.id === 'none' ?
                        <Text>No Running Timer</Text> : running.current.status === 'done' ?
                            //TODO: assuming that project exists on start... needs validation
                            <Button title='start' onPress={() => { Data.createTimer(running.current.project); setOnline(!online) }} /> :
                            <Button title='stop' onPress={() => { Data.finishTimer(running.current); setOnline(!online) }} />
                    }
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flexDirection: 'row', margin: 10 }}>
                <Button title='Refresh' onPress={() => setOnline(!online)} />
                <Button title='Clear' onPress={() => {
                    running.current = { id: 'none', name: 'none', project: 'none' }
                    setTimers([])
                    setOnline(!online)
                }} />
            </View>


            <RunningTimer />

            <Text>Timers: </Text>
            <View style={styles.list}>
                {/* {timers.length > 0 && typeof timers[0] === 'object' ? Object.keys(timers[0]).forEach(key => <View>{key}</View>) : null} */}
                <FlatList
                    data={timers}
                    style={{ height: 500 }}
                    renderItem={renderTimer}
                    keyExtractor={(item, index) => item.id}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        flexDirection: 'row',
        backgroundColor: '#ccc'
    },
    button: {
        margin: 20,
    },
    status: {
        fontSize: 30,
    }
});
