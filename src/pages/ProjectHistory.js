import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, FlatList, } from 'react-native';
import * as Data from '../data/Data'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'

export default function ProjectHistory({ useHistory, useParams }) {
    let history = useHistory()
    let { projectId } = useParams()
    const [refresh, setRefresh] = useState(false)
    const [edits, setEdits] = useState([{ id: 'none' }])

    useEffect(() => {
        messenger.addListener(`${projectId}_ProjectHistory`, event => {
            console.log(event)
            if (event && Array.isArray(event) && event.length > 0) {
                setEdits(event)
            }
        })

        messenger.emit('getProjectHistory', { projectId })
    }, [])


    const renderProject = ({ item, index }) => {
        return (
            <View style={{ flexDirection: 'row', margin: 10, width: '100%' }}>

                <View style={{ width: '30%' }}>
                    <Text style={{ color: item.color ? item.color : 'black' }}>{item.name ? item.name : ''}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Text>{item.edited}</Text>
                </View>
                <View style={{ width: '30%' }}>
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
            <FlatList
                ListHeaderComponent={<Text style={{ textAlign: 'center', fontSize: 25 }}>Project History: {projectId}</Text>}
                data={edits}
                renderItem={renderProject}
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
