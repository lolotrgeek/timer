// display a list of timers: timeline (date/timers), project records (project/timers)


import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, SectionList } from 'react-native';
import {timeSpan } from '../constants/Functions'
import { runningHandler, } from '../data/Handlers'
import * as Data from '../data/Data'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import '../state/projectState'


const debug = false
const test = false
const loadAll = false


export default function Project({ useHistory, useParams }) {
    let history = useHistory();
    let { projectId } = useParams();
    const [online, setOnline] = useState(false)
    const [timers, setTimers] = useState([])
    const [pages, setPages] = useState([])
    const [count, setCount] = useState(0)
    const [location, setLocation] = useState({ x: 0, y: 0 })
    const running = useRef({ id: 'none', name: 'none', project: 'none' })

    const timerList = useRef()

    useEffect(() => Data.getRunning(), [online, count])

    useEffect(() => {
        messenger.addListener("count", event => setCount(event))
        return () => messenger.removeAllListeners("count")
    }, [])

    useEffect(() => {
        messenger.addListener(chain.running(), event => runningHandler(event, { running: running }))
        return () => messenger.removeAllListeners(chain.running())
    }, [])

    useEffect(() => {
        messenger.addListener(`${projectId}/page`, event => {
            // setTimers(timers.concat(event))
            setPages(pages => [...pages, event])
        })
        return () => messenger.removeAllListeners(`${projectId}/page`)
    }, [])

    useEffect(() => {
        messenger.addListener(`${projectId}/pages`, event => {
            if (event && Array.isArray(event)) {
                console.log('Pages', event)
                setPages(event)
            }
        })
        return () => messenger.removeAllListeners(`${projectId}/pages`)
    }, [])

    useEffect(() => {
        messenger.addListener(`${projectId}/lastpagelocation`, event => {
            setLocation({ x: event.x, y: event.y, animated: false })
            console.log('scrollTo: ', { x: event.x, y: event.y, animated: false })
            // https://github.com/facebook/react-native/issues/13151#issuecomment-337442644
            // DANGER: raw _functions, but it works
            if (timerList.current._wrapperListRef) {
                timerList.current._wrapperListRef._listRef._scrollRef.scrollTo({ x: event.x, y: event.y, animated: false })
            }
        })
        return () => messenger.removeAllListeners(`${projectId}/lastpagelocation`)
    }, [])

    useEffect(() => {
        if (pages && Array.isArray(pages)) {
            let flattened = pages.flat(1)
            setTimers(flattened)
        }
    }, [pages])


    const renderTimer = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row', margin: 10, width: '100%' }}>

                <View style={{ width: '30%' }}>
                    <Text style={{ color: 'black' }}>{timeSpan(item.started, item.ended)}</Text>
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

            <Text>Project: </Text>
            <View style={styles.list}>
                <SectionList
                    ref={timerList}
                    onLayout={layout => {
                        console.log(timerList.current)
                    }}
                    sections={timers && timers.length > 0 ? timers : [{ title: 'Day', data: [{ name: 'nothing here' }] }]}
                    renderSectionHeader={({ section: { title } }) => {
                        return (<Text>{title}</Text>)
                    }}
                    style={{ height: 500 }}
                    renderItem={renderTimer}
                    onEndReached={() => {
                        console.log('End Reached')
                        if (timers) {
                            debug && console.log(timers, typeof timers, Array.isArray(timers))
                            let msg = { projectId: projectId, current: timers, pagesize: 4 }
                            console.log('Page requesting state: ', msg)
                            messenger.emit(`getPages`, msg)
                        } else {
                            setOnline(!online)
                        }
                    }}
                    onEndReachedThreshold={1}
                    keyExtractor={(item, index) => item.id}
                    onScroll={scroll => {
                        // console.log(scroll.nativeEvent.contentOffset.y)
                        messenger.emit(`${projectId}/pagelocation`, scroll.nativeEvent.contentOffset)
                    }}
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
