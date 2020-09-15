import {
    StyleSheet,
    Dimensions,
    Platform
} from 'react-native';

export default StyleSheet.create({
    title: {
        fontSize: 30
    },
    subtitle: {
        fontSize: 20
    },
    header: {
        width: '100%',
        maxWidth: Platform.OS === 'web' ? 400 : '100%',
        padding: 10,
        backgroundColor: 'white'
    },
    container: {
        backgroundColor: '#fff',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    flexcontainer: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    containercenter: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },

    list: {
        height: Dimensions.get('window').height - 180,
        width: '100%',
        padding: 10
    },
    timer: {
        height: Dimensions.get('window').height - 130,
        width: '100%',
        padding: 10,
    },
    timercontainer: {
        maxWidth: Platform.OS === 'web' ? 400 : '100%',
        alignItems: 'center'
    },
    listitem: {
        marginTop: 10
    },
    button: {
        margin: 20,
    },
    input: {
        fontSize: 30,
        alignContent: 'center',
        textAlign: 'center',
        margin: 10
    },
    status: {
        fontSize: 30,
    },
    row: {
        flexDirection: 'row',
        margin: 10,
        width: '100%',
        maxWidth: Platform.OS === 'web' ? 400 : '100%',
    },
    hide: {
        display: 'none'
    },
    footer: {
        padding: 10,
        width: '100%',
        backgroundColor: 'white'
    },
    footerbuttons: {
        maxWidth: Platform.OS === 'web' ? 400 : '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
});