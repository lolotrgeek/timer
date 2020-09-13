import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, FlatList, Dimensions, Platform } from 'react-native';
import Running from '../components/Running'
import messenger from '../constants/Messenger'
import { projectlink, projectTrashlink, projectCreatelink } from '../routes'

const debug = false
const attempts = 3


export default function Projects({ useHistory, useParams }) {
    let history = useHistory()
    const [refresh, setRefresh] = useState(false)
    const [projects, setProjects] = useState([])
    const refreshTimeout = useRef()
    const refreshAttempts = useRef()

    useEffect(() => {
        messenger.addListener('projects', event => {
            debug && console.log(typeof event, event)
            if (event && typeof event === 'object' && event.length > 0) {
                clearInterval(refreshTimeout.current)
                setProjects(event)
                setRefresh(false)
            }
        })

        refreshAttempts.current = 0
        function getPages() {
            setRefresh(true)
            const interval = refreshTimeout.current = setInterval(() => {
                if (refreshAttempts.current >= attempts || projects.length > 0) {
                    debug && console.log('Clearing refresh Project timeout')
                    setRefresh(false)
                    clearInterval(refreshTimeout.current)
                } else {
                    debug && console.log('Attempting to get Project Pages ' + refreshAttempts.current)
                    messenger.emit('getProjects', { all: true, refresh: true })
                    refreshAttempts.current++
                }
            }, 1000)
            refreshTimeout.current = interval
        }
        getPages()

        return () => {
            messenger.removeAllListeners('projects')
            clearInterval(refreshTimeout.current)
        }
    }, [])

    const renderRow = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row', margin: 10, width: '100%', maxWidth: 400, alignItems: 'center', justifyContent: 'space-evenly' }}>
                <View style={{ width: '50%' }}>
                    <Text onPress={() => history.push(projectlink(item.id))} style={{ color: item.color ? item.color : 'black' }}>{item.name}</Text>
                </View>
                <View style={{ width: '25%' }}>
                    <Button title='start' onPress={() => {
                        messenger.emit('start', { projectId: item.id })
                        history.push('/')
                    }} />
                </View>
            </View>
        );
    };

    const HeaderButtons = () => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', maxWidth: 400, }}>
            <Button onPress={() => history.push(projectCreatelink())} title='Create Project' />
            <Button title='Add Timers' onPress={() => messenger.emit('GenerateTimers', { projects: projects })} />
            <Button title='Trash' onPress={() => history.push(projectTrashlink())} />
        </View>
    )
    const Header = () => (
        <View style={styles.header}>
            <Text style={{ fontSize: 30 }}>Projects</Text>
        </View>
    )
    const Footer = () => (
        <View style={{ position: 'absolute', bottom: 0, padding: 10, width: '100%', backgroundColor: 'white', zIndex: 999999, flexDirection: 'column', height: 50 }}>
            <HeaderButtons />
        </View>
    )
    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <View style={styles.list}>
                <FlatList
                    ListHeaderComponent={projects.length === 0 ? <Text>Waiting on Projects...</Text> : <Text></Text>}
                    style={{ width: '100%', marginTop: 30, height: Dimensions.get('window').height - 170 }}
                    data={projects}
                    renderItem={renderRow}
                    keyExtractor={project => project.id}
                    onRefresh={() => {
                        setRefresh(true)
                        setProjects([])
                        messenger.emit('getProjects', { all: true, refresh: true })
                    }}
                    refreshing={refresh}
                />

            </View>
            <Footer />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        padding: 10,
        width: '100%',
        backgroundColor: 'white',
        flexDirection: 'column'
    },

    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        width: '100%',
        flexDirection: 'row',
        backgroundColor: '#ccc'
    },
    button: {
        margin: 20,
    },
    status: {
        fontSize: 30,
    }
});
