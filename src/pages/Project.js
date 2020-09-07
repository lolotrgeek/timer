// display a list of daytimers: timeline (date/daytimers), project records (project/daytimers)


import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, SectionList, Dimensions, } from 'react-native';
import { timeSpan } from '../constants/Functions'
import messenger from '../constants/Messenger'
import { projectHistorylink, projectEditlink, timerlink, timerTrashlink, timernew } from '../routes'



const debug = true
const test = false
const loadAll = false


export default function Project({ useHistory, useParams }) {
    let history = useHistory();
    let { projectId } = useParams();
    const [refresh, setRefresh] = useState(false)
    const [project, setProject] = useState({})
    const [pages, setPages] = useState([])
    const [location, setLocation] = useState({ x: 0, y: 0, animated: false })
    const timerList = useRef()

    useEffect(() => {
        messenger.addListener(`${projectId}/project`, event => {
            console.log(event)
            if (event) setProject(event)
        })
        messenger.addListener(`${projectId}/pages`, event => {
            if (event && Array.isArray(event)) {
                console.log('Pages', event)
                setPages(event)
                setRefresh(false)
            }
        })
        messenger.addListener(`${projectId}/pagelocation`, event => {
            console.log('scrollTo: ', { x: event.x, y: event.y, animated: false })
            setLocation({ x: event.x, y: event.y, animated: false })
            // https://github.com/facebook/react-native/issues/13151#issuecomment-337442644
            // DANGER: raw _functions, but it works
            if (timerList.current && timerList.current._wrapperListRef) {
                timerList.current._wrapperListRef._listRef._scrollRef.scrollTo({ x: event.x, y: event.y, animated: false })
            }
        })
        if (pages.length === 0) messenger.emit("getProjectPages", { projectId: projectId, currentday: 0, pagesize: 4 })
        return () => {
            messenger.removeAllListeners(`${projectId}/project`)
            messenger.removeAllListeners(`${projectId}/pages`)
            messenger.removeAllListeners(`${projectId}/pagelocation`)
        }
    }, [])



    const RenderTimer = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row', margin: 10, width: '100%' }}>

                <View style={{ width: '30%' }}>
                    <Text onPress={() => { history.push(timerlink(item.id)) }} style={{ color: 'black' }}>{timeSpan(item.started, item.ended)}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Text style={{ color: 'red' }}>{item.total}</Text>
                </View>
                <View style={{ width: '30%' }}>

                </View>
            </View>
        );
    };

    const HeaderButtons = () => (
        <View style={{ flexDirection: 'row' }}>
            <Button title='New Entry' onPress={() => history.push(timernew(projectId))} />
            <Button title='Edit' onPress={() => {
                history.push(projectEditlink(projectId))
            }} />
            <Button title='History' onPress={() => {
                history.push(projectHistorylink(projectId))
            }} />
            {project && project.status !== 'deleted' ?
                <Button title='Delete' onPress={() => {
                    messenger.emit('ProjectDelete', project)
                    // history.push(projectlink(timer.project))
                }} />
                : project.status === 'deleted' ?
                    <Button title='Restore' onPress={() => { messenger.emit('ProjectRestore', project) }} />
                    : <Text></Text>
            }
            <Button title='Trash' onPress={() => history.push(timerTrashlink(projectId))} />

        </View>
    )

    const Header = () => (
        <View style={styles.header}>
            <HeaderButtons />
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
                    sections={pages && pages.flat(1).length > 0 ? pages.flat(1) : []}
                    renderSectionHeader={({ section: { title } }) => {
                        return (<Text>{title}</Text>)
                    }}
                    renderItem={RenderTimer}
                    onEndReached={() => {
                        // TODO: decouple, put in separate function
                        console.log('End Reached')
                    }}
                    onEndReachedThreshold={1}
                    keyExtractor={(item, index) => item.id}
                    onScroll={scroll => messenger.emit(`${projectId}/pagelocation`, scroll.nativeEvent.contentOffset)}
                    onRefresh={() => {
                        setRefresh(true)
                        setPages([])
                        messenger.emit("getProjectPages", { projectId: projectId, currentday: 0, pagesize: 4 })
                    }}
                    refreshing={refresh}
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
