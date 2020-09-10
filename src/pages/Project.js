// display a list of daytimers: timeline (date/daytimers), project records (project/daytimers)


import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, SectionList, Dimensions, } from 'react-native';
import { timeSpan, secondsToString } from '../constants/Functions'
import messenger from '../constants/Messenger'
import { projectHistorylink, projectsListLink, projectEditlink, timerlink, timerTrashlink, timernew } from '../routes'

const debug = false
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
            if (event) setProject(event)
            setRefresh(false)

        })
        messenger.addListener(`${projectId}/pages`, event => {
            if (event && Array.isArray(event)) {
                debug && console.log('Pages', event)
                setPages(event)
                setRefresh(false)
            }
        })
        messenger.addListener(`${projectId}/pagelocation`, event => {
            debug && console.log('scrollTo: ', { x: event.x, y: event.y, animated: false })
            setLocation({ x: event.x, y: event.y, animated: false })
            // https://github.com/facebook/react-native/issues/13151#issuecomment-337442644
            // DANGER: raw _functions, but it works
            if (timerList.current && timerList.current._wrapperListRef) {
                timerList.current._wrapperListRef._listRef._scrollRef.scrollTo({ x: event.x, y: event.y, animated: false })
            }
        })
        messenger.emit("getProject", { projectId })
        if (pages.length === 0) messenger.emit("getProjectPages", { projectId: projectId, currentday: 0, pagesize: 4 })
        return () => {
            messenger.removeAllListeners(`${projectId}/project`)
            messenger.removeAllListeners(`${projectId}/pages`)
            messenger.removeAllListeners(`${projectId}/pagelocation`)
        }
    }, [])



    const RenderTimer = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row', margin: 10, width: '100%', maxWidth: 500, }}>

                <View style={{ width: '70%' }}>
                    <Text onPress={() => { history.push(timerlink(item.id)) }} style={{ color: 'black' }}>{timeSpan(item.started, item.ended)}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Text style={{ color: 'red' }}>{secondsToString(item.total)}</Text>
                </View>
            </View>
        );
    };

    const HeaderButtons = () => (
        <View style={{ maxWidth: 400, flexDirection: 'row', justifyContent: 'space-evenly', }}>
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
                    history.push(projectsListLink())
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
            <Text style={{ color: project.color ? project.color : 'black', textAlign: 'center', fontSize: 30 }}>{project && project.name ? project.name : projectId}</Text>
        </View>
    )
    const Footer = () => (
        <View style={{ position: 'absolute', bottom: 0, padding: 10, width: '100%', alignContent:'center', backgroundColor: 'white', zIndex: 999999, height: 50 }}>
            <HeaderButtons />
        </View>
    )

    return (
        <SafeAreaView style={styles.container} onLayout={(layout => { console.log(layout) })}>
            <Header />
            <SectionList
                // TODO: simplify creating sticky header/footer with list
                //app routes: 20 padding + 50 height
                // header: 20 padding + 100 height
                // 20 + 20 + 50 + 100 = 190
                style={styles.list}
                ref={timerList}
                sections={pages && pages.flat(1).length > 0 ? pages.flat(1) : []}
                renderSectionHeader={({ section: { title } }) => {
                    return (<View style={{ marginTop: 10 }}><Text style={{ fontSize: 20 }}>{title}</Text></View>)
                }}
                renderItem={RenderTimer}
                onEndReached={() => {
                    // TODO: decouple, put in separate function
                    debug && console.log('End Reached')
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
            <Footer />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: { width: '100%', padding: 10, backgroundColor: 'white', flexDirection: 'column' },
    container: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        height: Dimensions.get('window').height - 170,
        width:'100%',
        backgroundColor: '#ccc',
        marginBottom: 50,
        padding: 10
    },
    button: {
        margin: 20,
    },
    status: {
        fontSize: 30,
    }
});
