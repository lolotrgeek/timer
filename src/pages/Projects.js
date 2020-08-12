import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, FlatList, Dimensions } from 'react-native';
import * as Data from '../data/Data'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import { projectlink, projectTrashlink } from '../routes'
// import '../state/countState'
import '../state/projectsState'

const debug = false
const test = false

export default function Projects({ useHistory, useParams }) {
    let history = useHistory()
    const [online, setOnline] = useState(false)
    const [projects, setProjects] = useState([])
    const [timers, setTimers] = useState([])
    const [count, setCount] = useState(0)
    const [running, setRunning] = useState({ id: 'none', name: 'none', project: 'none' })

    useEffect(() => {
        messenger.addListener("count", event => setCount(event))
        return () => messenger.removeAllListeners("count")
    }, [])

    useEffect(() => {
        messenger.addListener(chain.running(), event => setRunning(event))
        messenger.emit('getRunning')
        return () => messenger.removeAllListeners(chain.running())
    }, [])

    useEffect(() => {
        messenger.addListener('projects', event => {
            debug && console.log(event)
            if (!event || event.length === 0) {
                generateProjects()
            }
            setProjects(event)
        })
        messenger.emit('getProjects', { all: true })

        return () => {
            messenger.removeAllListeners('projects')
        }
    }, [online])

    const generateProjects = () => {
        let amount = 5
        let i = 0
        while (i < amount) {
            Data.generateProject()
            debug && console.log(i)
            i++

        }
    }

    const generateTimers = () => {
        let amount = 100
        if (projects.length > 0 && timers.length < amount) {
            let i = 0
            while (i < amount) {
                Data.generateTimer(projects)
                i++
            }
        }
    }
    const RunningTimer = () => (
        <View>
            <View style={{ flexDirection: 'row' }}>
                <View style={{ width: '20%' }}>
                    <Text style={{ fontWeight: 'bold' }}>Project</Text>
                </View>
                <View style={{ width: '20%' }}>
                    <Text style={{ fontWeight: 'bold' }}>Running </Text>
                </View>
                <View style={{ width: '10%' }}>
                    <Text style={{ fontWeight: 'bold' }}>Count</Text>
                </View>
                <View style={{ width: '20%' }}>

                </View>
            </View>
            <View style={{ flexDirection: 'row', margin: 10 }}>
                <View style={{ width: '20%' }}>
                    <Text>{running.name ? running.name : 'None'}</Text>
                    <Text>{running.project ? running.project : ''}</Text>
                </View>
                <View style={{ width: '20%' }}>
                    <Text>{running.id}</Text>
                </View>
                <View style={{ width: '10%' }}>
                    <Text>{count}</Text>
                </View>
                <View style={{ width: '20%' }}>
                    {!running || running.id === 'none' ?
                        <Text>No Running Timer</Text> : running.status === 'done' ?
                            //TODO: assuming that project exists on start... needs validation
                            <Button title='start' onPress={() => {
                                messenger.emit('start', {projectId: running.project})
                                // Data.createTimer(running.project);
                            }} /> :
                            <Button title='stop' onPress={() => {
                                messenger.emit('stop', {projectId: running.project})
                                // Data.finishTimer(running)
                            }} />
                    }
                </View>
            </View>
        </View>
    )

    const renderRow = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row', margin: 10, width: '100%' }}>
                <View style={{ width: '50%' }}>
                    <Text onPress={() => history.push(projectlink(item.id))} style={{ color: 'red' }}>{item.name}</Text>
                </View>
                <View style={{ width: '25%' }}>
                    <Button title='start' onPress={() => {
                        // if (running && running.status === 'running') Data.finishTimer(running)
                        messenger.emit('start', {projectId: item.id})
                        setOnline(!online)
                    }} />
                </View>
            </View>
        );
    };

    const HeaderButtons = () => (
        <View style={{ flexDirection: 'row', margin: 10 }}>
            <Button title="Test" onPress={() => projects.length > 0 ? generateTimers() : debug && console.log('testing')} />
            <Button title='Refresh' onPress={() => setOnline(!online)} />
            <Button title='Clear' onPress={() => {
                // running = { id: 'none', name: 'none', project: 'none' }
                setProjects([])
                setOnline(!online)
            }} />
            <Button title='Trash' onPress={() => history.push(projectTrashlink())} />
        </View>
    )
    const Header = () => (
        <View style={styles.header}>
            <HeaderButtons />
            <RunningTimer />
        </View>
    )

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <View style={styles.list}>
                <FlatList
                    style={{ width: '100%', marginTop: 220, height: Dimensions.get('window').height - 170 }}
                    data={projects}
                    renderItem={renderRow}
                    keyExtractor={project => project.id}
                />
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        marginTop: 50,
        top: 0,
        flexDirection: 'row',
        padding: 10,
        width: '100%',
        background: 'white',
        zIndex: 10000,
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
