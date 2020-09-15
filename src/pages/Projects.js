import React, { useState, useEffect, useRef } from 'react';
import {Text, View, SafeAreaView, Button, FlatList } from 'react-native';
import messenger from '../constants/Messenger'
import { projectlink, projectTrashlink, projectCreatelink } from '../routes'
import styles from '../styles/mainStyles'


const debug = false
const attempts = 10

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
            <View style={styles.row}>
                <View style={{width:'70%'}}>
                    <Text onPress={() => history.push(projectlink(item.id))} style={{ color: item.color ? item.color : 'black' }}>{item.name}</Text>
                </View>
                <View style={{width:'20%'}}>
                    <Button title='start' onPress={() => {
                        messenger.emit('start', { projectId: item.id })
                        history.push('/')
                    }} />
                </View>
            </View>
        );
    };

    const FooterButtons = () => (
        <View style={styles.footerbuttons}>
            <Button onPress={() => history.push(projectCreatelink())} title='Create Project' />
            <Button title='Add Timers' onPress={() => messenger.emit('GenerateTimers', { projects: projects })} />
            <Button title='Trash' onPress={() => history.push(projectTrashlink())} />
        </View>
    )
    const Header = () => (
        <View style={styles.header}>
            <Text style={styles.title}>Projects</Text>
        </View>
    )
    const Footer = () => (
        <View style={styles.footer}>
            <FooterButtons />
        </View>
    )
    return (
        <SafeAreaView style={styles.flexcontainer}>
            <Header />
            <FlatList
                ListHeaderComponent={refresh ? <Text>Waiting on Projects...</Text> : <Text></Text>}
                style={styles.list}
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

            <Footer />
        </SafeAreaView>
    );
}
