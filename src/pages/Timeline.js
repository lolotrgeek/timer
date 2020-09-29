import React from 'react';
import { Text, View, SafeAreaView, Button, } from 'react-native';
import TimelineList from '../components/TimelineList'
import { projectsListLink } from '../routes';
import styles from '../styles/mainStyles'


export default function Timeline({ useHistory }) {
    let history = useHistory()
    const Header = () => (
        <View style={styles.header}>
            <Text style={styles.title}>Timeline</Text>
            {/* <Button title='Test Msg' onPress={() => messenger.emit('React', {Test: 'test'})} /> */}
        </View>
    )

    const Footer = () => (
        <View style={styles.footer}>
            <View style={styles.footerbuttons}>
            <Button title='Projects' onPress={() => history.push(projectsListLink())} />
            </View>
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