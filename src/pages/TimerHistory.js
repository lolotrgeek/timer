import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, FlatList, Dimensions } from 'react-native';
import * as Data from '../data/Data'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import '../state/timerHistoryState'

export default function TimerHistory({ useHistory, useParams }) {
    let history = useHistory()
    let { timerId } = useParams()
    const [refresh, setRefresh] = useState(false)
    const [edits, setEdits] = useState([{ id: 'none' }])

    useEffect(() => {
        messenger.on(`${timerId}_TimerHistory`, event => {
            console.log(event)
            if (event && Array.isArray(event) && event.length > 0) {
                setEdits(event)
            }
        })

        messenger.emit('getTimerHistory', { timerId })
    }, [])


    const renderTimer = ({ item, index }) => {
        return (
            <View style={{ flexDirection: 'row', margin: 10, width: '100%' }}>
                <View style={{ width: '5%' }}>
                    {/* <Text style={{ color: item.color ? item.color : 'black' }}>{item.name ? item.name : ''}</Text> */}
                    <Text>{index + 1}</Text>
                </View>
                <View style={{ width: '20%' }}>
                    {/* <Text style={{ color: item.color ? item.color : 'black' }}>{item.name ? item.name : ''}</Text> */}
                    <Text>{item.status}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Text>{item.edited}</Text>
                </View>
                <View style={{ width: '15%' }}>
                    <Text>{item.mood}</Text>

                </View>
                <View style={{ width: '10%' }}>
                    <Text>{item.energy}</Text>
                </View>
                <View style={{ width: '15%' }}>
                    {edits.length - 1 === index ?
                        <Text>Active</Text> :
                        <Button onPress={() => { messenger.emit('TimerRestore', item); setRefresh(!refresh)}} title='Restore' />
                    }

                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                ListHeaderComponent={<Text style={{ textAlign: 'center', fontSize: 25 }}>Timer History: {timerId}</Text>}
                data={edits}
                renderItem={renderTimer}
                keyExtractor={(item, index) => item.id + index}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 50,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: '#ccc'
    },
    button: {
        margin: 20,
    },
    status: {
        fontSize: 30,
    }
});
