import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, FlatList, } from 'react-native';
import messenger from '../constants/Messenger'
import { simpleDate, timeSpan, totalTime, secondsToString } from '../constants/Functions'
import styles from '../styles/mainStyles'

export default function TimerHistory({ useHistory, useParams }) {
    let history = useHistory()
    let { timerId } = useParams()
    const [refresh, setRefresh] = useState(false)
    const [edits, setEdits] = useState([{ id: 'none' }])

    useEffect(() => {
        messenger.addListener(`${timerId}_TimerHistory`, event => {
            if (event && Array.isArray(event) && event.length > 0) {
                setEdits(event)
                setRefresh(false)
            }
        })

        messenger.emit('getTimerHistory', { timerId })
        return () => messenger.removeAllListeners
    }, [])


    const renderTimer = ({ item, index }) => {
        return (
            <View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', }}>
                    <View style={{ margin: 5 }}>
                        {/* <Text style={{ color: item.color ? item.color : 'black' }}>{item.name ? item.name : ''}</Text> */}
                        <Text style={{ fontSize: 20 }}>{index + 1 + '.'}</Text>
                    </View>
                    <View style={{ margin: 5 }}>
                        <Text style={{ fontSize: 20 }}>{item.edited ? simpleDate(item.edited) : simpleDate(item.started)}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', }}>

                    <View style={{ margin: 10 }}>
                        <Text>{timeSpan(item.started, item.ended)}</Text>
                    </View>
                    <View style={{ margin: 10 }}>
                        <Text>{secondsToString(totalTime(item.started, item.ended))}</Text>
                    </View>
                    <View style={{ margin: 10 }}>
                        {edits.length - 1 === index ? <Text>Active</Text> :
                            index === 0 ? <Text>Running</Text>  :
                            <Button onPress={() => { messenger.emit('TimerRestore', item); setRefresh(!refresh) }} title='Restore' />
                        }
                    </View>
                </View>

            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Timer History</Text>
                <Text style={styles.subtitle}>ID: {timerId}</Text>

            </View>
            <FlatList
                // ListHeaderComponent={}
                style={styles.list}
                data={edits}
                renderItem={renderTimer}
                keyExtractor={(item, index) => item.id + index}
                onRefresh={() => {
                    setRefresh(true)
                    setEdits([{ id: 'none' }])
                    messenger.emit('getTimerHistory', { timerId })
                }}
                refreshing={refresh}
            />
        </SafeAreaView>
    )
}