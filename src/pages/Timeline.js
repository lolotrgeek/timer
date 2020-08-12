// display a list of timers: timeline (date/timers), project records (project/timers)


import React, { Suspense, useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, SectionList, Dimensions } from 'react-native';
import Running from '../components/Running'
import * as Data from '../data/Data'
import { projectCreatelink, projectlink, timerlink } from '../routes'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import '../state/timelineState'
import { preFetch } from '../service/prefetch'

const debug = false
const test = false
const loadAll = false
const pagesize = 4;

const resource = preFetch()

export default function Timeline({ useHistory }) {
    let history = useHistory()
    const [online, setOnline] = useState(false)
    const [daytimers, setDaytimers] = useState([])
    const [pages, setPages] = useState([])
    const [location, setLocation] = useState({ x: 0, y: 0 })
    const timelineList = useRef()

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
        // convert page into daytimers
        if (pages && Array.isArray(pages)) {
            console.log('timeline pages', pages)
            let flattened = pages.flat(1)
            console.log('converted page to daytimer', flattened)
            setDaytimers(flattened)
        }
    }, [pages])

    const renderTimer = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row', margin: 10, width: '100%' }}>
                <View style={{ width: '30%' }}>
                    <Text onPress={() => history.push(projectlink(item.project))} style={{ color: item.color ? 'red' : 'yellow' }}>{item.name ? item.name : ''}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Text style={{ color: 'red' }}>{item.total}</Text>
                </View>
                <View style={{ width: '30%' }}>

                </View>
            </View>
        );
    };

    const refresh = () => {
        setPages([])
        setDaytimers([])
        messenger.emit('getPages', { currentday: 0, refresh: true, pagesize: pagesize })
        setOnline(!online)
    }

    const HeaderButtons = () => (
        <View style={{ flexDirection: 'row' }}>
            <Button title='Refresh' onPress={() => refresh()} />
        </View>
    )
    const Header = () => (
        <View style={styles.header}>
            <HeaderButtons />
            <Running />
        </View>
    )

    const Footer = () => (
        <View style={{ position: 'absolute', bottom: 0, flexDirection: 'row', padding: 10, width: '100%', backgroundColor: 'white', zIndex: 10000, flexDirection: 'column' }}>
            <Button
                onPress={() => history.push(projectCreatelink())}
                title='Create Project'
            />
        </View>
    )

    const parseSection = section => section && section.length > 0 ? section : [{ title: 'Day', data: [{ name: 'nothing here' }] }]

    const TimerList = () => {
        const initial = resource.daytimers.read()
        console.log('initial', initial)
        // setDaytimers(initial)
        return (
            <View style={styles.container}>
                <Header />
                <View style={styles.list}>
                    <SectionList
                        ListHeaderComponent={<Text style={{ textAlign: 'center', fontSize: 25 }}>Timeline</Text>}
                        // TODO: simplify creating sticky header/footer with list
                        //app routes: 20 padding + 50 height
                        // header: 20 padding + 100 height
                        // 20 + 20 + 50 + 100 = 190
                        style={{ marginTop: 170, height: Dimensions.get('window').height - 170 }}
                        ref={timelineList}
                        onLayout={layout => {
                            console.log(timelineList.current)
                        }}
                        sections={daytimers.length === 0 ? parseSection(initial) : parseSection(daytimers)}
                        renderSectionHeader={({ section: { title } }) => {
                            return (<Text>{title}</Text>)
                        }}
                        renderItem={renderTimer}
                        onEndReached={() => {
                            console.log('End Reached')
                            if (daytimers) {
                                debug && console.log(daytimers, typeof daytimers, Array.isArray(daytimers))
                                messenger.emit('getPages', { currentday: daytimers.length, pagesize: pagesize })
                                console.log('daytimers: ', daytimers)
                            }
                            else {
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
                <Footer />
            </View>
        )
    }

    return (
        <Suspense fallback={<View style={{marginTop: 50}}><Text>Loading Timers...</Text></View>}>
            <TimerList />
        </Suspense>
    );
}

const styles = StyleSheet.create({
    header: { position: 'absolute', marginTop: 50, top: 0, flexDirection: 'row', padding: 10, width: '100%', backgroundColor: 'white', zIndex: 10000, flexDirection: 'column' },
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
