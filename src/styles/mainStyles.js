import {
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';

const windowheight = Dimensions.get('window').height
const
    titlefont = 30,
    navpadding = 10,
    footerpadding = 10,
    headerpadding = 10,
    navheight = 50,
    headerheight = 50,
    footerheight = 55,
    bodyheight = windowheight - (navheight + headerheight + footerheight + navpadding),
    nofooterheight = windowheight - (navheight + headerheight)


export const Colors = {
    dark: 'black',
    darkfont: 'white',
    light: 'white',
    lightfont: 'black'
}

const baseStyles = StyleSheet.create({
    app: {
        flex: 1,
    },
})

const lightStyleSheet = StyleSheet.create({
    app: {
        ...baseStyles.app,
        backgroundColor: Colors.light,
    },
    text : {
        color: Colors.lightfont
    }
});

const darkStyleSheet = StyleSheet.create({
    app: {
        ...baseStyles.app,
        backgroundColor: Colors.dark,
    },
    text : {
        color: Colors.darkfont
    }
});

export const mainStyles = StyleSheet.create({
    navigation: {
        flexDirection: 'row',
        width: '100%',
    },
    header: {
        width: '100%',
        maxWidth: Platform.OS === 'web' ? 400 : '100%',
        padding: headerpadding,
    },
    title: {
        fontSize: titlefont
    },
    subtitle: {
        fontSize: 20
    },
    container: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    containercenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    containerwidth: {
        maxWidth: Platform.OS === 'web' ? 400 : '100%',
        alignItems: 'center'
    },
    list: {
        flex: 1,
        width: '100%',
        height: Platform.OS === 'web' ? bodyheight : 'auto',
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
        marginLeft: 10,
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
        width: '100%',
        padding: footerpadding,
        backgroundColor: '#292929',
        height: Platform.OS === 'web' ? footerheight : 'auto',
    },
    footerbuttons: {
        maxWidth: Platform.OS === 'web' ? 400 : '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
});

/**
 * 
 * @param {String} useTheme `dark` or `light` (default)
 */
export default function getStyleSheet(useTheme) {
    if( useTheme === 'dark' ) return {...mainStyles, ...darkStyleSheet}
    else return {...mainStyles, ...lightStyleSheet}
    
}
