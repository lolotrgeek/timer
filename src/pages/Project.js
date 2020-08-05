// display a list of daytimers: timeline (date/daytimers), project records (project/daytimers)


import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, SectionList, Dimensions } from 'react-native';
import { timeSpan } from '../constants/Functions'
import { runningHandler, } from '../data/Handlers'
import * as Data from '../data/Data'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import { projectHistorylink, projectEditlink, timerlink, projectsListLink } from '../routes'
import '../state/projectState'


const debug = false
const test = false
const loadAll = false


export default function Project({ useHistory, useParams }) {
    let history = useHistory();
    let { projectId } = useParams();
    const [online, setOnline] = useState(false)
    const [project, setProject] = useState({})
    const [daytimers, setDaytimers] = useState([])
    const [pages, setPages] = useState([])
    const [location, setLocation] = useState({ x: 0, y: 0, animated: false })
    const [count, setCount] = useState(0)
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
        messenger.addListener(`${projectId}/project`, event => {
            console.log(event)
            if (event) setProject(event)
        })
        return () => messenger.removeAllListeners(`${projectId}/project`)
    }, [online])

    useEffect(() => {
        messenger.addListener(`${projectId}/page`, event => {
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
            console.log('scrollTo: ', { x: event.x, y: event.y, animated: false })
            setLocation({ x: event.x, y: event.y, animated: false })
            // https://github.com/facebook/react-native/issues/13151#issuecomment-337442644
            // DANGER: raw _functions, but it works
            if (timerList.current._wrapperListRef) {
                timerList.current._wrapperListRef._listRef._scrollRef.scrollTo({ x: event.x, y: event.y, animated: false })
            }
        })
        return () => messenger.removeAllListeners(`${projectId}/lastpagelocation`)
    }, [daytimers])



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
                    <Text onPress={() => { history.push(timerlink(projectId, item.id)) }} style={{ color: 'black' }}>{timeSpan(item.started, item.ended)}</Text>
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
        <View style={{ flexDirection: 'row' }}>
            <Button title='Refresh' onPress={() => {
                setOnline(!online)
            }} />
            <Button title='Clear' onPress={() => {
                running.current = { id: 'none', name: 'none', project: 'none' }
                setDaytimers([])
                setOnline(!online)
            }} />
            <Button title='Edit' onPress={() => {
                history.push(projectEditlink(projectId))
            }} />
            <Button title='History' onPress={() => {
                history.push(projectHistorylink(projectId))
            }} />
            <Button title='Delete' onPress={() => {
                // daytimers.forEach(daytimer => {
                //     // console.log(daytimer)
                //     daytimer.data.forEach(timer => {
                //         console.log(daytimer.title, timer.key)
                //         let daychain = chain.dateTimer(timer.started, timer.id)+'/'+timer.key
                //         console.log(daychain)
                //         Data.deleteTimer(timer)
                //         // messenger.addListener(daychain, msg => {
                //         //     console.log(msg)
                //         // })
                //         // Data.getDayTimer(timer)
                //     })
                // })
                Data.deleteProject(project)
                history.push(projectsListLink())
            }} />
        </View>
    )

    const Header = () => (
        <View style={styles.header}>
            <HeaderButtons />
            <RunningTimer />
        </View>
    )

    return (
        <SafeAreaView style={styles.container} onLayout={(layout => { console.log(layout) })}>
            <Header />
            <View style={styles.list}>
                <SectionList
                    ListHeaderComponent={<Text style={{ textAlign: 'center', fontSize: 25 }}>{project && project.name ? project.name : projectId}</Text>}
                    // TODO: simplify creating sticky header/footer with list
                    //app routes: 20 padding + 50 height
                    // header: 20 padding + 100 height
                    // 20 + 20 + 50 + 100 = 190
                    style={{ marginTop: 170, height: Dimensions.get('window').height - 170 }}
                    ref={timerList}
                    onLayout={layout => {
                        // console.log(timerList.current)
                        // console.log(layout)
                    }}
                    sections={daytimers && daytimers.length > 0 ? daytimers : [{ title: 'Day', data: [{ name: 'nothing here' }] }]}
                    renderSectionHeader={({ section: { title } }) => {
                        return (<Text>{title}</Text>)
                    }}
                    renderItem={renderTimer}
                    onEndReached={() => {
                        // TODO: decouple, put in separate function
                        console.log('End Reached')
                        if (daytimers) {
                            debug && console.log(daytimers, typeof daytimers, Array.isArray(daytimers))
                            let msg = { projectId: projectId, currentday: daytimers.length, pagesize: 4 }
                            console.log('Page requesting state: ', msg)
                            messenger.emit("getProjectPages", msg)
                        } else {
                            setOnline(!online)
                        }
                    }}
                    onEndReachedThreshold={1}
                    keyExtractor={(item, index) => item.id}
                    onScroll={scroll => messenger.emit(`${projectId}/pagelocation`, scroll.nativeEvent.contentOffset)}

                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: { position: 'absolute', marginTop: 50, top: 0, flexDirection: 'row', padding: 10, width: '100%', backgroundColor: 'white', zIndex: 10000, flexDirection: 'column' },
    container: {
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
