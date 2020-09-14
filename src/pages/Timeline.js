// display a list of timers: timeline (date/timers), project records (project/timers)


import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, } from 'react-native';
import TimelineList from '../components/TimelineList'
import { projectCreatelink } from '../routes'
import messenger from '../constants/Messenger'

const debug = false
const test = false
const loadAll = false
const pagesize = 4

export default function Timeline({ useHistory }) {
    let history = useHistory()

    const Header = () => (
        <View style={styles.header}>
            <Text style={{ fontSize: 30 }}>Timeline</Text>
            {/* <Button title='Test Msg' onPress={() => messenger.emit('React', {Test: 'test'})} /> */}
        </View>
    )

    const Footer = () => (
        <View style={{padding: 10, width: '100%', backgroundColor: 'white', height: 50 }}>
            <Button
                onPress={() => history.push(projectCreatelink())}
                title='Create Project'
            /> 
            {/* <Button title='Test Projects' onPress={() => messenger.emit('GenerateProjects')} /> */}
            </View>

    )
    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <TimelineList useHistory={useHistory} />
            <Footer />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        padding: 10,
        width: '100%',
        backgroundColor: 'white',
    },
    container: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        margin: 20,
    },
    status: {
        fontSize: 30,
    }
});
