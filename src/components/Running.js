import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'

const debug = false
const test = false

export default function Running() {
    const [online, setOnline] = useState(false)
    const [count, setCount] = useState(0)
    const [running, setRunning] = useState({ id: 'none', name: 'none', project: 'none' })

    useEffect(() => {
        messenger.addListener("count", event => setCount(event))
        return () => messenger.removeAllListeners("count")
    }, [])

    useEffect(() => {
        messenger.addListener(chain.running(), event => setRunning(event)) // this hooks to chained store emission that fires when changes to `running` are stored...

        return () => messenger.removeAllListeners(chain.running())
    }, [])

    if (running && running.id !== 'none') return (
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

        </View>)
    else return (<View></View>) // TODO: do a stylesheet update here? to minimize timer space, or runnning component in list and let it auto size
}

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        marginTop: 50,
        top: 0,
        flexDirection: 'row',
        padding: 10,
        width: '100%',
        backgroundColor: 'white',
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
