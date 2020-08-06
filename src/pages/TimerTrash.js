import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, FlatList, Dimensions } from 'react-native';
import * as Data from '../data/Data'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import * as routes from '../routes'
import '../state/timerTrashState'

export default function TimerTrash({ useHistory, useParams }) {
    let history = useHistory()
    let { projectId } = useParams();
    const [online, setOnline] = useState(false)
    const [trash, setTrash] = useState([{ id: 'none' }])

    useEffect(() => {
        messenger.on(`timerTrash`, event => {
            console.log(event)
            if (event && Array.isArray(event) && event.length > 0) {
                setTrash(event)
            }
        })

        messenger.emit('getTimerTrash', {projectId: projectId })
    }, [])


    const renderTimer = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row', margin: 10, width: '100%' }}>

                <View style={{ width: '20%' }}>
                    {/* <Text style={{ color: item.color ? item.color : 'black' }}>{item.name ? item.name : ''}</Text> */}
                    <Text>{item.id}</Text>
                </View>
                <View style={{ width: '40%' }}>
                    <Text>{item.deleted}</Text>
                </View>
                <View style={{ width: '20%' }}>
                    <Button title='Restore' onPress={() => {
                        Data.restoreTimer(item)
                        history.push(routes.timerlink(item.id))
                    }} />
                </View>
            </View>
        );
    };
    const HeaderButtons = () => (
        <View style={{ flexDirection: 'row' }}>
            <Button title='Refresh' onPress={() => {
                setOnline(!online)
            }} />
            <Button title='Clear' onPress={() => {
                setTrash([])
                setOnline(!online)
            }} />
        </View>
    )
    const Header = () => (
        <View style={styles.header}>
            <Text style={{ textAlign: 'center', fontSize: 25 }}>Deleted Timers</Text>
            <HeaderButtons />
        </View>
    )
    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <FlatList
                style={styles.list}
                data={trash}
                renderItem={renderTimer}
                keyExtractor={(item, index) => item.id + index}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    header: { position: 'absolute', marginTop: 50, top: 0, flexDirection: 'row', padding: 10, width: '100%', backgroundColor: 'white', zIndex: 10000, flexDirection: 'column' },
    
    container: {
        flex: 1,
        marginTop: 50,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        marginTop: 170, 
        height: Dimensions.get('window').height - 170 ,
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
