import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, SectionList } from 'react-native';
import { isToday, secondsToString, sayDay } from '../constants/Functions'
import messenger from '../constants/Messenger'
import { projectlink, runninglink, projectsListLink } from '../routes'
import styles from '../styles/mainStyles'

const debug = false
const test = false
const loadAll = false
const pagesize = 4
var executed = false;
const attempts = 10

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

export default function TimelineList({ useHistory }) {
    let history = useHistory()
    const [pages, setPages] = useState([]) // [[{title: 'mm-dd-yyyy', data: [{id, }]}, ...], ... ]
    const [refresh, setRefresh] = useState(false)
    const [hidden, setHidden] = useState('')
    const [location, setLocation] = useState({ x: 0, y: 0 })
    const [count, setCount] = useState(0)
    const [running, setRunning] = useState({ id: 'none', name: 'none', project: 'none' })
    const timelineList = useRef()
    const refreshTimeout = useRef()
    const refreshAttempts = useRef()

    const endReached = () => {
        // getRunning()
        clearInterval(refreshTimeout.current)
        setRefresh(false)
        if (pages.length > 0) {
            debug && console.log('[get Page] End Reached')
            debug && console.log(pages, typeof pages, Array.isArray(pages))
            messenger.emit('getPage', { currentday: pages.length, pagesize: pagesize })
        }
    }
    const onRefresh = () => {
        debug && console.log('[get Page] Refreshing')
        setRefresh(true)
        setPages([])
        setHidden('')
    }

    useEffect(() => {
        getRunning()
        messenger.addListener('App', event => {
            debug && console.log('App', event)
        })
        messenger.addListener("page", event => {
            clearInterval(refreshTimeout.current)
            debug && console.log('page:', event)
            setPages(pages => [...pages, event])
            //OPTIMIZE: pre-flatten pages...
            // setPages(pages => [...pages, ...event])
            // setPages(pages => pages.concat(event))
            setRefresh(false)
        })
        messenger.addListener("pages", event => {
            if (event && Array.isArray(event)) {
                debug && console.log('Pages', event)
                setPages(event)
                setRefresh(false)
            }
        })
        messenger.addListener("count", event => {
            setCount(event)
        })

        /**
         * Listens for running events
         */
        messenger.addListener('running', event => {
            if (event && event.status === 'running') {
                setHidden(event.project)
                setRunning(event)
                // messenger.emit('getPage', { currentday:0, refresh: true, pagesize: pagesize })
            } if (event.status === 'done') {
                setHidden('')
                setPages([])
                setRunning({ id: 'none' })
                // remove today's section from UI state
                // request state recalculate today's section
            }
        })

        /**
         * listens for page number of last page
         */
        messenger.addListener('lastpage', msg => {

        })

        /**
         * BROKEN
         * listens for page location to re-located on navigation
         */
        messenger.addListener("timelinelocation", event => {
            debug && console.log('location', event)
            setLocation({ x: event.x, y: event.y, animated: false })
            debug && console.log('scrollTo: ', { x: event.x, y: event.y, animated: false })
            // https://github.com/facebook/react-native/issues/13151#issuecomment-337442644
            if (timelineList.current && timelineList.current._wrapperListRef) {
                timelineList.current._wrapperListRef._listRef._scrollRef.scrollTo({ x: event.x, y: event.y, animated: false })
            }
        })
        refreshAttempts.current = 0

        function getPages() {
            const interval = setInterval(() => {
                if (refreshAttempts.current >= attempts || pages.length > 0) {
                    debug && console.log('Clearing refresh Timeline timeout')
                    clearInterval(refreshTimeout.current)
                    setRefresh(false)
                } else {
                    debug && console.log('Attempting to get Timeline Pages ' + refreshAttempts.current)
                    messenger.emit('getPage', { currentday: 0, refresh: true, pagesize: pagesize })
                    refreshAttempts.current++
                }
            }, 1000)
            refreshTimeout.current = interval
        }
        getPages()

        return () => {
            messenger.removeAllListeners("App")
            messenger.removeAllListeners("page")
            messenger.removeAllListeners("pages")
            messenger.removeAllListeners("timelinelocation")
            messenger.removeAllListeners('running')
            messenger.removeAllListeners("count")
            messenger.removeAllListeners("lastpage")
            executed = false
            setPages([])
            clearInterval(refreshTimeout.current)
        }
    }, [])

    const RenderProjectTimer = ({ item }) => {
        return (
            item.id === hidden && isToday(item.lastrun) ? <View></View> :
                <View style={styles.row}>
                    <View style={{ width: '30%' }}>
                        <Text onPress={() => history.push(projectlink(item.id))} style={{ color: !item.color || item.color.length === 0 ? 'red' : item.color }}>{item.name ? item.name : ''}</Text>
                    </View>
                    <View style={{ width: '30%' }}>
                        <Text>{secondsToString(item.lastcount)}</Text>
                    </View>
                    <View style={{ width: '20%' }}>
                        <Button title='start' onPress={() => {
                            timelineList.current._wrapperListRef._listRef._scrollRef.scrollTo({ x: 0, y: 0, animated: false })
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
                    <View>
                        <Text style={styles.subtitle}>Tracking</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={{ width: '30%' }}>
                        <Text onPress={() => history.push(runninglink())} style={{ color: running.color ? running.color : 'black' }}>{running.name ? running.name : 'None'}</Text>
                    </View>
                    <View style={{ width: '30%' }}>
                        <Text>{count}</Text>
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
            <View style={{ marginTop: 10 }}>
                <Running />
            </View>
        )
    }

    if (pages.length === 0) return (
        <SectionList
            ListHeaderComponent={<TimelineHeader />}
            style={styles.list}
            ref={timelineList}
            sections={[{ title: refreshAttempts.current === attempts ? 'Start a new Timer' : 'Waiting for Timers...', data: '' }]}
            renderSectionHeader={({ section: { title } }) => (
                <View style={styles.listtitle}>
                    <Text style={styles.subtitle}>{title}</Text>
                    {refreshAttempts.current === attempts ? <View style={styles.row}>
                        <Button
                            onPress={() => history.push(projectsListLink())}
                            title='Go to Projects'
                        />
                    </View> :
                        <View></View>}
                </View>)}
            renderItem={({ item }) => <View></View>}
            keyExtractor={(item, index) => item.id + index}
            onEndReached={() => {
                setRefresh(true)
                messenger.emit('getPage', { currentday: 0, refresh: true, pagesize: pagesize })
            }}
            onRefresh={() => {
                setRefresh(true)
                messenger.emit('getPage', { currentday: 0, refresh: true, pagesize: pagesize })
            }}
            refreshing={refresh}
        />
    )
    else return (
        <SectionList
            ListHeaderComponent={<TimelineHeader />}
            style={styles.list}
            ref={timelineList}
            onLayout={layout => { debug && console.log(timelineList.current) }}
            sections={pages && pages.flat(1).length > 0 ? pages.flat(1) : [{ title: 'Day', data: [{ name: 'nothing here' }] }]}
            renderSectionHeader={({ section: { title } }) => <View style={styles.listtitle}><Text style={styles.subtitle}>{sayDay(title)}</Text></View>}
            renderItem={RenderProjectTimer}
            onRefresh={() => onRefresh()}
            refreshing={refresh}
            onEndReached={() => endReached()}
            onEndReachedThreshold={1}
            keyExtractor={(item, index) => item.id + index}
            onScroll={scroll => { messenger.emit('pagelocation', scroll.nativeEvent.contentOffset) }}
            ListFooterComponent={() => <View style={styles.row}><Text style={styles.listend}>End of List.</Text></View>}

        />

    )
}