// display a list of timers: timeline (date/timers), project records (project/timers)


import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, SectionList } from 'react-native';
import { totalTime, simpleDate, sumProjectTimers, nextDay } from '../constants/Functions'
import { putHandler, runningHandler, timerDatesHandler, timersForDateHandler } from '../data/Handlers'
import * as Data from '../data/Data'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import '../state/timelineState'

const debug = false
const test = false
const loadAll = false


export default function Timeline({ useHistory }) {
    let history = useHistory();
    const [online, setOnline] = useState(false)
    const [timers, setTimers] = useState([])
    const [pages, setPages] = useState([])
    const [count, setCount] = useState(0)
    const running = useRef({ id: 'none', name: 'none', project: 'none' })

    useEffect(() => Data.getRunning(), [online, count])



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
        messenger.addListener("page", event => {
            // setTimers(timers.concat(event))
            setPages(pages => [...pages, event])
        })
        return () => messenger.removeAllListeners("page")
    }, [])

    useEffect(() => {
        messenger.addListener("pages", event => {
            if (event && Array.isArray(event)) {
                console.log('Pages', event)
                setPages(event)
            }
        })
        return () => messenger.removeAllListeners("pages")
    }, [])

    useEffect(() => {
        if(pages && Array.isArray(pages) ) {
            let flattened = pages.flat(1)
            setTimers(flattened)
        }
    }, [pages])


    const renderTimer = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row', margin: 10, width: '100%' }}>

                <View style={{ width: '30%' }}>
                    <Text style={{ color: item.color ? 'red' : 'yellow' }}>{item.project ? item.project : ''}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Text style={{ color: 'red' }}>{item.total}</Text>
                </View>
                <View style={{ width: '30%' }}>

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
                <Button title='Refresh' onPress={() => {
                    setOnline(!online)
                }} />
                <Button title='Clear' onPress={() => {
                    running.current = { id: 'none', name: 'none', project: 'none' }
                    setTimers([])
                    setOnline(!online)
                }} />
            </View>


            <RunningTimer />

            <Text>Timeline: </Text>
            <View style={styles.list}>
                <SectionList
                    sections={timers && timers.length > 0 ? timers : [{ title: 'Day', data: [{ name: 'nothing here' }] }]}
                    renderSectionHeader={({ section: { title } }) => {
                        return (<Text>{title}</Text>)
                    }}
                    style={{ height: 500 }}
                    renderItem={renderTimer}
                    onEndReached={() => {
                        console.log('End Reached')
                        if (timers) {
                            console.log(timers, typeof timers, Array.isArray(timers))
                            let msg = { current: timers, pagesize: 4 }
                            messenger.emit('getPages', msg)

                        } else {
                            setOnline(!online)
                        }

                    }}
                    onEndReachedThreshold={1}
                    keyExtractor={(item, index) => item.project}
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
