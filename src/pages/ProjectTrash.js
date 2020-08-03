import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, FlatList, Dimensions } from 'react-native';
import * as Data from '../data/Data'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import * as routes from '../routes'
import '../state/projectHistoryState'

export default function ProjectTrash({ useHistory, useParams }) {
    let history = useHistory()
    let { projectId } = useParams()
    const [trash, setTrash] = useState([{ id: 'none' }])

    useEffect(() => {
        messenger.on(`projectTrash`, event => {
            console.log(event)
            if (event && Array.isArray(event) && event.length > 0) {
                setTrash(event)
            }
        })

        messenger.emit('getProjectTrash', { projectId })
    }, [])


    const renderProject = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row', margin: 10, width: '100%' }}>

                <View style={{ width: '30%' }}>
                    <Text style={{ color: item.color ? item.color : 'black' }}>{item.name ? item.name : ''}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Text>{item.edited}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Button title='Restore' onPress={() => {
                        Data.restoreProject(projectId)
                        history.push(routes.projectlink(projectId))
                    }} />
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                ListHeaderComponent={<Text style={{ textAlign: 'center', fontSize: 25 }}>Project Trash: {projectId}</Text>}
                data={trash}
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
