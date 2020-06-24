import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, FlatList } from 'react-native';
import * as Data from '../data/Data'
import { putHandler, runningHandler, projectsHandler } from '../data/Handlers'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'

const debug = true
const test = false

export default function Projects() {

    const [online, setOnline] = useState(false)
    const [projects, setProjects] = useState([])
    const [timers, setTimers] = useState([])
    const [count, setCount] = useState(0)

    const running = useRef({ id: 'none', name: 'none', project: 'none' })
    // const projects = useRef(projects[0])

    useEffect(() => Data.getRunning(), [online])

    useEffect(() => {
        messenger.addListener("put", event => putHandler(event, { running, setTimers }))
        return () => messenger.removeAllListeners("put")
    }, [])

    useEffect(() => {
        messenger.addListener("count", event => setCount(event))
        return () => messenger.removeAllListeners("count")
    }, [])

    useEffect(() => {
        messenger.addListener(chain.running(), event => runningHandler(event, { running: running }))
        return () => messenger.removeAllListeners(chain.running())
    }, [])

    useEffect(() => {
        messenger.addListener(chain.projects(), event => projectsHandler(event, { projects, setProjects, running }))
        return () => {
            messenger.removeAllListeners(chain.projects())
        }
    }, [online])

    useEffect(() => {
        // TEST GENERATOR
        let amount = 100
        if (test && projects.length > 0 && timers.length < amount) {
            let i = 0
            while (i < amount) {
                Data.generateTimer(projects)
                i++
            }
        }
    }, [online])

    useEffect(() => {
        console.log('Get projects...')
        Data.getProjects()
    }, [online])

    const renderRow = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row', margin: 10 }}>
                <View style={{ width: '50%' }}>
                    <Text style={{ color: 'red' }}>{item.id}</Text>
                </View>
                <View style={{ width: '50%' }}>
                    <Button title='start' onPress={() => {
                        if (running.current && running.current.status === 'running') Data.finishTimer(running.current) 
                        Data.createTimer(item.id)
                        setOnline(!online)
                    }} />
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flexDirection: 'row', margin: 10 }}>
                {projects.length === 0 ? <Button title='Begin' onPress={() => {
                    Data.createProject('react project', '#ccc')
                    Data.createProject('test project', '#ccc')
                    setOnline(!online)
                }} /> : <Button title='Refresh' onPress={() => setOnline(!online)} />}
                <Button title='Clear' onPress={() => {
                    running.current = { id: 'none', name: 'none', project: 'none' }
                    setProjects([])
                    setOnline(!online)
                }} />
            </View>

            <RunningTimer />

            <View style={styles.list}>
                <FlatList
                    data={projects}
                    renderItem={renderRow}
                    keyExtractor={project => project.id}
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
        backgroundColor: '#ccc'
    },
    button: {
        margin: 20,
    },
    status: {
        fontSize: 30,
    }
});
