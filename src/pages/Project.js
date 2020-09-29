// display a list of daytimers: timeline (date/daytimers), project records (project/daytimers)


import React, { useState, useEffect, useRef } from 'react';
import { View, SafeAreaView, Button, SectionList } from 'react-native';
import Text from '../components/Text'
import { timeSpan, secondsToString, fullDay } from '../constants/Functions'
import messenger from '../constants/Messenger'
import { projectHistorylink, projectsListLink, projectEditlink, timerlink, timerTrashlink, timernew } from '../routes'

const debug = false
const test = false
const loadAll = false
const pagesize = 4
const attempts = 3


export default function Project({ useHistory, useParams, styles }) {
    let history = useHistory();
    let { projectId } = useParams();
    const [refresh, setRefresh] = useState(false)
    const [project, setProject] = useState({})
    const [pages, setPages] = useState([])
    const [location, setLocation] = useState({ x: 0, y: 0, animated: false })
    const timerList = useRef()
    const refreshTimeout = useRef()
    const refreshAttempts = useRef()

    useEffect(() => {
        messenger.addListener(`${projectId}/project`, event => {
            if (event) setProject(event)
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
        if (pages.length === 0)

            refreshAttempts.current = 0
        function getPages() {
            setRefresh(true)
            const interval = refreshTimeout.current = setInterval(() => {
                if (refreshAttempts.current >= attempts || pages.length > 0) {
                    debug && console.log('Clearing refresh Project timeout')
                    setRefresh(false)
                    clearInterval(refreshTimeout.current)
                } else {
                    debug && console.log('Attempting to get Project Pages ' + refreshAttempts.current)
                    messenger.emit("getProjectPages", { projectId: projectId, currentday: 0, pagesize: pagesize })
                    refreshAttempts.current++
                }
            }, 1000)
            refreshTimeout.current = interval
        }
        getPages()


        return () => {
            messenger.removeAllListeners(`${projectId}/project`)
            messenger.removeAllListeners(`${projectId}/pages`)
            messenger.removeAllListeners(`${projectId}/pagelocation`)
            clearInterval(refreshTimeout.current)
        }
    }, [])

    const RenderTimer = ({ item }) => {
        return (
            <View style={styles.row}>
                <View style={{ width: '70%' }}>
                    <Text onPress={() => { history.push(timerlink(item.id)) }} style={{ color: 'black' }}>{timeSpan(item.started, item.ended)}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Text style={{ color: 'red' }}>{secondsToString(item.total)}</Text>
                </View>
            </View>
        );
    };

    const FooterButtons = () => (
        <View style={styles.footerbuttons}>
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
            <Text style={[styles.title, { color: project.color ? project.color : 'black' }]}>
                {project && project.name ? project.name : projectId}
            </Text>
        </View>
    )
    const Footer = () => (
        <View style={styles.footer}>
            <FooterButtons />
        </View>
    )

    return (
        <SafeAreaView style={styles.container} >
            <Header />
            <SectionList
                style={styles.list}
                ref={timerList}
                sections={pages && pages.flat(1).length > 0 ? pages.flat(1) : [{ title: 'Waiting on Timers...', data: '' }]}
                renderSectionHeader={({ section: { title } }) => {
                    return (
                        <View style={styles.listtitle}>
                            <Text style={styles.subtitle}>{refresh || pages.length === 0 ? title : fullDay(title)}</Text>
                        </View>
                    )
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
                    messenger.emit("getProjectPages", { projectId: projectId, currentday: 0, pagesize: pagesize })
                }}
                refreshing={refresh}
                ListFooterComponent={() => <View style={styles.row}><Text style={styles.listend}>End of List.</Text></View>}

            />
            <Footer />
        </SafeAreaView>
    );
}
