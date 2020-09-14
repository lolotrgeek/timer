import { StyleSheet, Dimensions } from 'react-native';

export default StyleSheet.create({
    header: { width: '100%', padding: 10, backgroundColor: 'white', flexDirection: 'column' },
    container: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        height: Dimensions.get('window').height - 180,
        width: '100%',
        padding: 10
    },
    button: {
        margin: 20,
    },
    status: {
        fontSize: 30,
    },
    row: { flexDirection: 'row', margin: 10, width: '100%', maxWidth: 500, },
    hide: { display: 'none' }
});
