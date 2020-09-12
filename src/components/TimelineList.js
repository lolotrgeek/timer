import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button, SectionList, Dimensions } from 'react-native';
import { isToday, secondsToString, sayDay } from '../constants/Functions'
import messenger from '../constants/Messenger'
// import Running from '../components/Running'
import { projectlink } from '../routes'

const debug = false
const test = false
const loadAll = false
const pagesize = 4

export default function TimelineList({ useHistory }) {
    let history = useHistory()
    const [pages, setPages] = useState([]) // [[{title: 'mm-dd-yyyy', data: [{id, }]}, ...], ... ]
    const [refresh, setRefresh] = useState(false)
    const [hidden, setHidden] = useState('')
    const [location, setLocation] = useState({ x: 0, y: 0 })
    const [count, setCount] = useState(0)
    const [running, setRunning] = useState({ id: 'none', name: 'none', project: 'none' })
    const timelineList = useRef()

    //OPTIMIZE: pre-flatten pages...
    useEffect(() => {
        messenger.addListener('App', event => {
            debug && console.log('App', event)
        })
        messenger.addListener("page", event => {
            debug && console.log('page:', event)
            setPages(pages => [...pages, event])
            setRefresh(false)
        })
        messenger.addListener("pages", event => {
            if (event && Array.isArray(event)) {
                debug && console.log('Pages', event)
                setPages(event)
                setRefresh(false)
            }
        })
        messenger.addListener('notify', event => {
            // NOTE: could listen on 'running' channel, but it breaks async flow on running timer
            // TODO: will need to test how this integrates with a native messenger
            // TODO: need to get this to integrate by having local timer display 
            if (event && event.state === 'stop') {
                setPages([])
                setHidden('')
                setRefresh(false)
                messenger.emit('getPage', { currentday: 0, refresh: true, pagesize: pagesize })
            } else {
                setPages([])
                setHidden(event.id)
                setRefresh(false)
                messenger.emit('getPage', { currentday: 0, refresh: true, pagesize: pagesize })
            }
        })
        messenger.addListener("count", event => {
            setCount(event)
        })
        messenger.addListener('running', event => {
            if (event && event.status === 'running') {
                setRunning(event)
            } else {
                setRunning({ id: 'none' })
            }
        }) // this hooks to chained store emission that fires when changes to `running` are stored...

        if (!running || running.id === 'none') messenger.emit('getRunning')
        if (pages.length === 0) messenger.emit('getPage', { currentday: 0, refresh: true, pagesize: pagesize })

        messenger.addListener("timelinelocation", event => {
            debug && console.log('location', event)
            setLocation({ x: event.x, y: event.y, animated: false })
            debug && console.log('scrollTo: ', { x: event.x, y: event.y, animated: false })
            // https://github.com/facebook/react-native/issues/13151#issuecomment-337442644
            if (timelineList.current && timelineList.current._wrapperListRef) {
                timelineList.current._wrapperListRef._listRef._scrollRef.scrollTo({ x: event.x, y: event.y, animated: false })
            }
        })
        return () => {
            messenger.removeAllListeners("App")
            messenger.removeAllListeners("page")
            messenger.removeAllListeners("pages")
            messenger.removeAllListeners("timelinelocation")
            messenger.removeAllListeners('notify')
            messenger.removeAllListeners('running')
            messenger.removeAllListeners("count")
            messenger.removeAllListeners("notify")
        }
    }, [])


    const RenderProjectTimer = ({ item }) => {
        return (
            item.id === hidden && isToday(item.lastrun) ? <View></View> :
                <View style={styles.row}>
                    <View style={{ width: '30%' }}>
                        <Text onPress={() => history.push(projectlink(item.id))} style={{ color: !item.color || item.color.length === 0 || item.color === '#ccc' ? 'red' : item.color }}>{item.name ? item.name : ''}</Text>
                    </View>
                    <View style={{ width: '30%' }}>
                        <Text style={{ color: 'black' }}>{secondsToString(item.lastcount)}</Text>
                    </View>
                    <View style={{ width: '20%' }}>
                        <Button title='start' onPress={() => {
                            messenger.emit('start', { projectId: item.id })
                        }} />
                    </View>
                </View>
        )
    }

    const Running = () => {
        if (!running || running.id === 'none') return (<View></View>)  // TODO: do a stylesheet update here? to minimize timer space, or runnning component in list and let it auto size
        else return (
            <View>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ width: '20%' }}>
                        <Text style={{ fontSize: 20 }}>Tracking</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={{ width: '30%' }}>
                        <Text style={{ color: running.color ? running.color : 'black' }}>{running.name ? running.name : 'None'}</Text>
                    </View>
                    <View style={{ width: '30%' }}>
                        <Text>{secondsToString(count)}</Text>
                    </View>
                    <View style={{ width: '20%' }}>
                        {!running || !running.id ?
                            <Text>No Running Timer</Text> : running.status === 'done' ?
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

            </View>
        )
    }

    const TimelineHeader = () => {
        return (
            <View style={{ marginTop: 20 }}>
                <Running />
            </View>
        )
    }

    if (pages.length === 0) return (
        <View style={styles.list}>
            <TimelineHeader />
        </View>
    )
    return (
        <SectionList
            ListHeaderComponent={<TimelineHeader />}
            // TODO: simplify creating sticky header/footer with list
            //app routes: 20 padding + 50 height
            // header: 20 padding + 100 height
            // 20 + 20 + 50 + 100 = 190
            style={styles.list}
            ref={timelineList}
            onLayout={layout => {
                debug && console.log(timelineList.current)
            }}
            sections={pages && pages.flat(1).length > 0 ? pages.flat(1) : [{ title: 'Day', data: [{ name: 'nothing here' }] }]}
            renderSectionHeader={({ section: { title } }) => {
                return (<View style={{ marginTop: 10 }}><Text style={{ fontSize: 20 }}>{sayDay(title)}</Text></View>)
            }}
            renderItem={RenderProjectTimer}
            onEndReached={() => {
                debug && console.log('End Reached')
                debug && console.log(pages, typeof pages, Array.isArray(pages))
                messenger.emit('getPage', { currentday: pages.length, pagesize: pagesize })

            }}
            onEndReachedThreshold={1}
            keyExtractor={(item, index) => item.id + index}
            onScroll={scroll => {
                // console.log(scroll.nativeEvent.contentOffset.y)
                messenger.emit('pagelocation', scroll.nativeEvent.contentOffset)
            }}
            onRefresh={() => {
                setRefresh(true)
                setPages([])
                setHidden('')
                messenger.emit('getPage', { currentday: 0, refresh: true, pagesize: pagesize })
            }}
            refreshing={refresh}
        />

    )
}

const styles = StyleSheet.create({
    list: {
        height: Dimensions.get('window').height - 170,
        width: '100%',
        backgroundColor: '#ccc',
        marginBottom: 50,
    },
    row: { flexDirection: 'row', margin: 10, width: '100%', maxWidth: 500, },
    hide: { display: 'none' }
});
