// display a list of daytimers: timeline (date/daytimers), project records (project/daytimers)


import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, Dimensions, FlatList } from 'react-native';
import {dateSimple} from '../constants/Functions'
import messenger from '../constants/Messenger'
import * as Data from '../data/Data'
import * as store from '../data/Store'
import * as chain from '../data/Chains'

const debug = false
const test = false
const loadAll = false


export default function Timers() {
    const [online, setOnline] = useState(false)
    const [timers, setTimers] = useState([]);
    const [timerdates, setTimerDates] = useState([]);

    useEffect(() => {
        messenger.on(chain.timers(), event => {
            // console.log('timers', event)
            setTimers(event)
        })
        // Data.getTimers()

        messenger.on(chain.timerDates(), event => {
            if (!event) return
            debug && console.log('finding dates: ', event)
        })

        
        store.chainer(chain.timerDates(), store.app).on((data, key) => {
            if (!data) {
                console.log('[Timer Dates] No Data Found',)
            }
            setTimerDates(timerdates => [...timerdates, data])
            console.log('[Timer Dates] Data Found: ', typeof data, data)
        })

        return () => {
            messenger.removeAllListeners(chain.timers())
            messenger.removeAllListeners(chain.timerDates())
        }
    }, [online])


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
                <View style={{ width: '20%' }}>
                    {/* <Text style={{ color: item.color ? item.color : 'black' }}>{item.name ? item.name : ''}</Text> */}
                    <Text>{item.name}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Text>{dateSimple(item.started)}</Text>
                </View>
                <View style={{ width: '20%' }}>
                    <Text>{item.project}</Text>

                </View>
                <View style={{ width: '10%' }}>
                    <Text>{item.total}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <Text>{JSON.stringify(timerdates)}</Text>
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
    listContainer: {
        width: '100%',
        flexDirection: 'row',
        backgroundColor: '#ccc'
    },
    list: {
        marginTop: 170, height: Dimensions.get('window').height - 170
    },
    button: {
        margin: 20,
    },
    status: {
        fontSize: 30,
    }
});

