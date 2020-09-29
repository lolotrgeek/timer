import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, FlatList, } from 'react-native';
import messenger from '../constants/Messenger'
import { fullTime, simpleDate } from '../constants/Functions'

export default function ProjectHistory({ useHistory, useParams, styles }) {
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
            <View style={styles.row}>
                <View style={{ margin: '1%' }}>
                    <Text style={{ color: item.color ? item.color : 'black' }}>{item.name ? item.name : ''}</Text>
                </View>
                <View style={{ margin: '1%' }}>
                    <Text>{simpleDate(item.edited ? item.edited : item.started)}</Text>
                </View>
                <View style={{ margin: '1%' }}>
                    <Text>{fullTime(item.edited ? item.edited : item.started)}</Text>
                </View>
                <View style={{ margin: '1%' }}>
                    {edits.length - 1 === index ?
                        <Text>Active</Text> :
                        <Button onPress={() => { messenger.emit('ProjectRestore', item); setRefresh(!refresh) }} title='Restore' />
                    }

                </View>
            </View>
        );
    };

    return (
        <View styles={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Project History</Text>
            </View>
            <FlatList
                ListHeaderComponent={<Text style={styles.subtitle}>{projectId}</Text>}
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
        </View>
    )
}

