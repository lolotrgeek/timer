import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, FlatList, Dimensions, } from 'react-native';
import { fullDate, simpleDate, timeSpan } from '../constants/Functions'
import messenger from '../constants/Messenger'

export default function ProjectTrash({ useHistory, useParams }) {
    let history = useHistory()
    const [refresh, setRefresh] = useState(false)
    const [trash, setTrash] = useState([{ id: 'none' }])

    useEffect(() => {
        messenger.addListener(`projectTrash`, event => {
            console.log(event)
            if (event && Array.isArray(event) && event.length > 0) {
                setTrash(event)
                setRefresh(false)
            }
        })

        messenger.emit('getProjectTrash', {})
        return () => {

        }
    }, [])


    const renderProject = ({ item }) => {
        if (!item.id || item.id === 'none' || item.status !== 'deleted') return (<View></View>)
        else return (
            <View style={{ flexDirection: 'row', margin: 10, alignItems: 'center', justifyContent: 'space-evenly', maxWidth: 400 }}>

                <View style={{ margin: 5 }}>
                    <Text style={{ color: item.color ? item.color : 'black' }}>{item.name ? item.name : ''}</Text>
                </View>
                <View style={{ margin: 5 }}>
                    <Text>{fullDate(item.deleted)}</Text>
                </View>
                <View style={{ margin: 5 }}>
                    <Button title='Restore' onPress={() => {
                        messenger.emit('ProjectRestore', item)
                        setRefresh(false)
                    }} />
                </View>
            </View>
        );
    };

    const Header = () => (
        <View style={styles.header}>
            <Text style={{fontSize: 30 }}>Deleted Projects</Text>
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

const styles = StyleSheet.create({
    header: { padding: 10, width: '100%', backgroundColor: 'white',  },

    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    list: {
        height: Dimensions.get('window').height - 170,
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
