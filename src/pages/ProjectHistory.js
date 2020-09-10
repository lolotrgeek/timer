import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, FlatList, } from 'react-native';
import messenger from '../constants/Messenger'
import { fullTime, simpleDate } from '../constants/Functions'

export default function ProjectHistory({ useHistory, useParams }) {
    let history = useHistory()
    let { projectId } = useParams()
    const [refresh, setRefresh] = useState(false)
    const [edits, setEdits] = useState([{ id: 'none' }])

    useEffect(() => {
        messenger.addListener(`${projectId}_ProjectHistory`, event => {
            if (event && Array.isArray(event) && event.length > 0) {
                setEdits(event)
                setRefresh(false)
            }
        })

        messenger.emit('getProjectHistory', { projectId })
        return () => messenger.removeAllListeners(`${projectId}_ProjectHistory`)
    }, [])


    const renderProject = ({ item, index }) => {
        return (
            <View style={{ flexDirection: 'row', margin: 10, width: '100%', justifyContent:'space-evenly' }}>

                <View style={{ margin: 5 }}>
                    <Text style={{ color: item.color ? item.color : 'black' }}>{item.name ? item.name : ''}</Text>
                </View>
                <View style={{ margin: 5 }}>
                    <Text>{simpleDate(item.edited ? item.edited : item.started)}</Text>
                    <Text>{fullTime(item.edited ? item.edited : item.started)}</Text>
                </View>
                <View style={{ margin: 5 }}>
                    {edits.length - 1 === index ?
                        <Text>Active</Text> :
                        <Button onPress={() => { messenger.emit('ProjectRestore', item); setRefresh(!refresh) }} title='Restore' />
                    }

                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={{ textAlign: 'center', fontSize: 30 }}>Project History</Text>
            <FlatList
                ListHeaderComponent={<Text style={{ textAlign: 'center', fontSize: 18 }}>{projectId}</Text>}
                style={styles.list}
                data={edits}
                renderItem={renderProject}
                keyExtractor={(item, index) => item.id + index}
                onRefresh={() => {
                    setRefresh(true)
                    setEdits([{ id: 'none' }])
                    messenger.emit('getProjectHistory', { projectId })
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
        width: '100%',
    },
    list: {
        alignContent: 'center'
    },
    button: {
        margin: 20,
    },
    status: {
        fontSize: 30,
    }
});
