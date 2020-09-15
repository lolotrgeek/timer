import React from 'react';
import { Text, View, SafeAreaView, Button, } from 'react-native';
import TimelineList from '../components/TimelineList'
import { projectCreatelink } from '../routes'
import styles from '../styles/mainStyles'


export default function Timeline({ useHistory }) {
    let history = useHistory()

    const Header = () => (
        <View style={styles.header}>
            <Text style={{ fontSize: 30 }}>Timeline</Text>
            {/* <Button title='Test Msg' onPress={() => messenger.emit('React', {Test: 'test'})} /> */}
        </View>
    )

    const Footer = () => (
        <View style={styles.footer}>
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