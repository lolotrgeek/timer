import React, { useState, useEffect, useRef } from 'react';
import { View, SafeAreaView, Button, FlatList, } from 'react-native';
import Text from '../components/Text'
import { fullDate, simpleDate, timeSpan } from '../constants/Functions'
import messenger from '../constants/Messenger'


export default function ProjectTrash({ useHistory, useParams, styles }) {
    let history = useHistory()
    const [refresh, setRefresh] = useState(false)
    const [trash, setTrash] = useState([{ id: 'none' }])

    useEffect(() => {
        messenger.addListener(`projectTrash`, event => {
            if (event && Array.isArray(event) && event.length > 0) {
                setTrash(event)
                setRefresh(false)
            }
        })

        messenger.emit('getProjectTrash', {})
        return () => {
            messenger.removeAllListeners(`projectTrash`)
        }
    }, [])


    const renderProject = ({ item }) => {
        if (!item.id || item.id === 'none' || item.status !== 'deleted') return (<View></View>)
        else return (
            <View style={styles.row}>
                <View style={{ margin: '1%' }}>
                    <Text style={{ color: item.color ? item.color : styles.text.color }}>{item.name ? item.name : ''}</Text>
                </View>
                <View style={{ margin: '1%' }}>
                    <Text>{fullDate(item.deleted)}</Text>
                </View>
                <View style={{ margin: '1%' }}>
                    <Button title='Restore' onPress={() => {
                        messenger.emit('ProjectRestore', item)
                        setRefresh(true)
                    }} />
                </View>
            </View>
        );
    };

    const Header = () => (
        <View style={styles.header}>
            <Text style={styles.title}>Deleted Projects</Text>
        </View>
    )
    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <FlatList
                style={styles.list}
                data={trash}
                renderItem={renderProject}
                keyExtractor={(item, index) => item.id + index}
                onRefresh={() => {
                    setRefresh(true)
                    setTrash([{ id: 'none' }])
                    messenger.emit('getProjectTrash', {})
                }}
                refreshing={refresh}
            />
        </SafeAreaView>
    )
}