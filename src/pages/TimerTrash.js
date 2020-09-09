import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, FlatList, Dimensions, } from 'react-native';
import messenger from '../constants/Messenger'
import * as routes from '../routes'
import { fullDate, simpleDate, timeSpan } from '../constants/Functions'

export default function TimerTrash({ useHistory, useParams }) {
    let history = useHistory()
    let { projectId } = useParams();
    const [refresh, setRefresh] = useState(false)
    const [trash, setTrash] = useState([{ id: 'none' }])

    useEffect(() => {
        messenger.addListener(`timerTrash`, event => {
            console.log(event)
            if (event && Array.isArray(event) && event.length > 0) {
                setTrash(event)
                setRefresh(false)
            }
        })
        messenger.emit('getTimerTrash', { projectId })

        return () => messenger.removeAllListeners('timerTrash')
    }, [])


    const renderTimer = ({ item, index }) => {
        if (!item.id || item.id === 'none' || item.status !== 'deleted') return (<View></View>)
        else return (
            <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ margin: 5 }}>
                        <Text style={{ fontSize: 20 }}>Deleted: {simpleDate(item.deleted)}</Text>
                    </View>
                    <View style={{ margin: 5 }}>
                        <Text>id: {item.id}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                    <View style={{ margin: 5 }}>
                        <Text>{simpleDate(item.started)}</Text>
                    </View>
                    <View style={{ margin: 10 }}>
                        <Text>{timeSpan(item.started, item.ended)}</Text>
                    </View>
                    <View style={{ margin: 5 }}>
                        <Button title='Restore' onPress={() => {
                            messenger.emit('TimerRestore', item)
                            history.push(routes.projectlink(item.project))
                        }} />

                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={{ textAlign: 'center', fontSize: 30 }}>Deleted Timers</Text>
            <FlatList
                style={styles.list}
                data={trash}
                renderItem={renderTimer}
                keyExtractor={(item, index) => item.id + index}
                onRefresh={() => {
                    setRefresh(true)
                    setTrash([{ id: 'none' }])
                    messenger.emit('getTimerTrash', { projectId: projectId })

                }}
                refreshing={refresh}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    list: {
        marginTop: 50,
        height: Dimensions.get('window').height - 170,
        flexDirection: 'row',
        width: '100%',
        backgroundColor: '#fff'
    },
    button: {
        margin: 20,
    },
    status: {
        fontSize: 30,
    }
});
