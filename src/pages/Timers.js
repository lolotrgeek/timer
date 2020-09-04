// display a list of daytimers: timeline (date/daytimers), project records (project/daytimers)


import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, Dimensions, FlatList } from 'react-native';
import { dateSimple } from '../constants/Functions'
import messenger from '../constants/Messenger'
import * as Data from '../data/Data'
import * as store from '../data/Store'
import * as chain from '../data/Chains'

const debug = true
const test = false
const loadAll = false


export default function Timers() {
    const [online, setOnline] = useState(false)
    const [timers, setTimers] = useState([]);
    const [timerdates, setTimerDates] = useState([]);

    useEffect(() => {
        // messenger.addListener('timersFound', event => {
        //     console.log('timers', event)
        //     setTimers(event)
        // })
        // messenger.emit('getTimers', {all: true})


        messenger.addListener('projectTimers', event => {
            if (!event) return
            debug && console.log('finding projects: ', event)
            setTimers(event)
        })
        messenger.emit('getProjectTimers', { all: true })


        // TIMERS
        // store.chainer(chain.timers(), store.app).map().on((data, key) => {
        //     if (!data) {
        //         console.log('[Timers] No Data Found',)
        //     }
        //     setTimers(timers => [...timers, data])
        //     console.log('[Timers] Data Found: ', key, data)
        // })

        // TIMER DATES
        // store.chainer(chain.timerDates(), store.app).on((data, key) => {
        //     if (!data) {
        //         console.log('[Timer Dates] No Data Found',)
        //     }
        //     setTimerDates(timerdates => [...timerdates, data])
        //     console.log('[Timer Dates] Data Found: ', typeof data, data)
        // })

        return () => {
            messenger.removeAllListeners('timersFound')
            messenger.removeAllListeners('timerDates')
        }
    }, [])


    const HeaderButtons = () => (
        <View style={{ flexDirection: 'row' }}>
            <Button title='Refresh' onPress={() => {
                setOnline(!online)
            }} />
            <Button title='Clear' onPress={() => {
                setTimers([])
                setOnline(!online)
            }} />

        </View>
    )

    const Header = () => (
        <View style={styles.header}>
            <HeaderButtons />
        </View>
    )
    const renderTimer = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row', margin: 10, width: '100%' }}>
                <View style={{ width: '30%' }}>
                    <Text onPress={() => { }} >{item.name ? item.name : ''}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Text style={{ color: 'red' }}>{item.lastrun}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Text style={{ color: 'red' }}>{item.lastcount}</Text>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <View style={styles.listContainer}>
                <FlatList
                    style={styles.list}
                    ListHeaderComponent={<Text style={{ textAlign: 'center', fontSize: 25 }}>Timers:</Text>}
                    data={timers}
                    renderItem={renderTimer}
                    keyExtractor={(item, index) => item.id + index}
                />
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        marginTop: 30,
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
    listContainer: {
        width: '100%',
        flexDirection: 'row',
        backgroundColor: '#ccc'
    },
    list: {
        marginTop: 30, height: Dimensions.get('window').height - 170
    },
    button: {
        margin: 20,
    },
    status: {
        fontSize: 30,
    }
});

