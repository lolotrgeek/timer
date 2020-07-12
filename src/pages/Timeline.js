// display a list of timers: timeline (date/timers), project records (project/timers)


import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, SectionList, Dimensions} from 'react-native';
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
    const [daytimers, setDaytimers] = useState([])
    const [pages, setPages] = useState([])
    const [count, setCount] = useState(0)
    const [location, setLocation] = useState({ x: 0, y: 0 })
    const running = useRef({ id: 'none', name: 'none', project: 'none' })

    const timelineList = useRef()

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
        messenger.addListener("page", event => {
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
        messenger.addListener("pagelocation", event => {
            setLocation({ x: event.x, y: event.y, animated: false })
            console.log('scrollTo: ', { x: event.x, y: event.y, animated: false })
            // https://github.com/facebook/react-native/issues/13151#issuecomment-337442644
            if (timelineList.current._wrapperListRef) {
                timelineList.current._wrapperListRef._listRef._scrollRef.scrollTo({ x: event.x, y: event.y, animated: false })
            }
        })
        return () => messenger.removeAllListeners("pagelocation")
    }, [])

    useEffect(() => {
        if (pages && Array.isArray(pages)) {
            let flattened = pages.flat(1)
            setDaytimers(flattened)
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
    const HeaderButtons = () => (
        <View style={{ flexDirection: 'row'}}>
            <Button title='Refresh' onPress={() => {
                setOnline(!online)
            }} />
            <Button title='Clear' onPress={() => {
                running.current = { id: 'none', name: 'none', project: 'none' }
                setDaytimers([])
                setOnline(!online)
            }} />
        </View>
    )
    const Header = () => (
        <View style={{ position: 'absolute', marginTop: 50, top: 0, flexDirection: 'row', padding: 10, width: '100%', background: 'white', zIndex: 10000, flexDirection: 'column' }}>
            <HeaderButtons />
            <RunningTimer />
        </View>
    )

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <View style={styles.list}>
                <SectionList
                    ListHeaderComponent={<Text style={{textAlign:'center', fontSize:25}}>Timeline</Text>}
                    // TODO: simplify creating sticky header/footer with list
                    //app routes: 20 padding + 50 height
                    // header: 20 padding + 100 height
                    // 20 + 20 + 50 + 100 = 190
                    style={{ marginTop: 170, height: Dimensions.get('window').height - 170 }}
                    ref={timelineList}
                    onLayout={layout => {
                        console.log(timelineList.current)
                    }}
                    sections={daytimers && daytimers.length > 0 ? daytimers : [{ title: 'Day', data: [{ name: 'nothing here' }] }]}
                    renderSectionHeader={({ section: { title } }) => {
                        return (<Text>{title}</Text>)
                    }}
                    renderItem={renderTimer}
                    onEndReached={() => {
                        console.log('End Reached')
                        if (daytimers) {
                            debug && console.log(daytimers, typeof daytimers, Array.isArray(daytimers))
                            let msg = { currentday: daytimers.length, pagesize: 4 }
                            messenger.emit('getPages', msg)

                        } else {
                            setOnline(!online)
                        }
                    }}
                    onEndReachedThreshold={1}
                    keyExtractor={(item, index) => item.project}
                    onScroll={scroll => {
                        // console.log(scroll.nativeEvent.contentOffset.y)
                        messenger.emit('pagelocation', scroll.nativeEvent.contentOffset)
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
