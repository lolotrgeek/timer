import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, FlatList, Dimensions } from 'react-native';
import * as Data from '../data/Data'
import messenger from '../constants/Messenger'
import * as chain from '../data/Chains'
import * as routes from '../routes'
import '../state/projectTrashState'

export default function ProjectTrash({ useHistory, useParams }) {
    let history = useHistory()
    const [online, setOnline] = useState(false)
    const [trash, setTrash] = useState([{ id: 'none' }])

    useEffect(() => {
        messenger.on(`projectTrash`, event => {
            console.log(event)
            if (event && Array.isArray(event) && event.length > 0) {
                setTrash(event)
            }
        })

        messenger.emit('getProjectTrash', { })
    }, [])


    const renderProject = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row', margin: 10, width: '100%' }}>

                <View style={{ width: '30%' }}>
                    <Text style={{ color: item.color ? item.color : 'black' }}>{item.name ? item.name : ''}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Text>{item.deleted}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Button title='Restore' onPress={() => {
                        messenger.emit('ProjectRestore', item)
                        // history.push(routes.projectlink(item.id))
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
            <Text style={{ textAlign: 'center', fontSize: 25 }}>Deleted Projects</Text>
            <HeaderButtons />
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
