import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { secondsToString } from '../constants/Functions'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'

const debug = false
const test = false

export default function Running() {
    const [online, setOnline] = useState(false)
    const [count, setCount] = useState(0)
    const [running, setRunning] = useState({ id: 'none', name: 'none', project: 'none' })

    useEffect(() => {
        messenger.addListener("count", event => {
            setCount(event)
            if (!running || running.id === 'none') {
                messenger.emit('getRunning')
            }
        })
        messenger.addListener(chain.running(), event => {
            if (event && event.status === 'running') {
                setRunning(event)
            } else {
                setRunning(null)
            }
        }) // this hooks to chained store emission that fires when changes to `running` are stored...
        return () => {
            messenger.removeAllListeners(chain.running())
            messenger.removeAllListeners("count")
        }
    }, [])

    if (!running || running.id === 'none') return (<View></View>)  // TODO: do a stylesheet update here? to minimize timer space, or runnning component in list and let it auto size
    else return (
        <View>
            <View style={{ flexDirection: 'row' }}>
                <View style={{ width: '20%' }}>
                    <Text style={{ fontSize: 20 }}>Tracking</Text>
                </View>
            </View>
            <View style={styles.row}>
                <View style={{ width: '30%' }}>
                    <Text style={{color: running.color ? running.color : 'black'}}>{running.name ? running.name : 'None'}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Text>{secondsToString(count)}</Text>
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

const styles = StyleSheet.create({
    row: { flexDirection: 'row', margin: 10, width: '100%', maxWidth: 500, },
});
