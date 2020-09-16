import {
    StyleSheet,
    Dimensions,
    Platform,
    PixelRatio
} from 'react-native';

const ratio = PixelRatio.get()
console.log('Font Pixel Ratio :', ratio)


const windowheight = Dimensions.get('window').height

// factors must total 1
const
    navfactor = .05,
    headerfactor = .1,
    bodyfactor = .75,
    bodynofooterfactor = .85,
    footerfactor = .1

// const
//     navheight = windowheight * navfactor,
//     headerheight = windowheight * headerfactor,
//     footerheight = windowheight * footerfactor,
//     bodyheight = windowheight * bodyfactor

const titlefont = 30

const
    navheight = 50,
    headerheight = 50,
    footerheight = 50,
    bodyheight = windowheight - (navheight + headerheight + titlefont  + footerheight),
    nofooterheight = windowheight - (navheight + headerheight)

const
    navpadding = 10,
    footerpadding = 10,
    headerpadding = 10




export default StyleSheet.create({
    app: {
        flex:1,
        backgroundColor: 'white',
    },
    navigation: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: 'white',
    },
    title: {
        fontSize: titlefont
    },
    subtitle: {
        fontSize: 20
    },
    header: {
        width: '100%',
        maxWidth: Platform.OS === 'web' ? 400 : '100%',
        padding: headerpadding,
        backgroundColor: 'white',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    containercenter: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    containerwidth: {
        maxWidth: Platform.OS === 'web' ? 400 : '100%',
        alignItems: 'center'
    },
    list: {
        flex:1,
        width: '100%',
        height: Platform.OS === 'web' ? bodyheight : 'auto'
    },
    listtitle: {
        marginTop: 10,
        marginLeft: 10
    },
    listitem: {
        marginTop: 10,
    },
    listend: {
        textAlign: 'center',
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
        marginLeft: 20,
        marginTop: 10,
        marginRight: 10,
        marginBottom: 10,
        width: '100%',
        maxWidth: Platform.OS === 'web' ? 400 : '100%',
    },
    hide: {
        display: 'none'
    },
    footer: {
        bottom:0,
        width: '100%',
        padding: footerpadding,
        backgroundColor: 'white'
    },
    footerbuttons: {
        maxWidth: Platform.OS === 'web' ? 400 : '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
});