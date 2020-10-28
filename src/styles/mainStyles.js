import {
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native'
import { addStyle } from '../constants/Functions'

// OPTIMIZE: cleanup and consider separate stylesheet for web

const
    titlefont = 30,
    navpadding = 5,
    footerpadding = 10,
    headerpadding = 10,
    navheight = 50

let
    headerheight = 50,
    footerheight = 55,
    windowheight = Dimensions.get('window').height,
    listheight = windowheight - (navheight + headerheight + footerheight + navpadding),
    listmargin = navheight + navpadding,
    bodyheight = windowheight - (navheight + headerheight)

if (Platform.OS === 'web') {
    Dimensions.addEventListener("change", ({ window }) => {
        windowheight = window.height
    })
}
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
    body: {
        width: '100%',
        aspectRatio: 1.5,
    }
})

const lightStyleSheet = StyleSheet.create({
    body: {
        ...baseStyles.body,
        backgroundColor: Colors.light,
    },
    app: {
        ...baseStyles.app,
        backgroundColor: Colors.light,
    },
    text: {
        color: Colors.lightfont
    }
});

const darkStyleSheet = StyleSheet.create({
    body: {
        ...baseStyles.body,
        backgroundColor: Colors.dark,
    },
    app: {
        ...baseStyles.app,
        backgroundColor: Colors.dark,
    },
    text: {
        color: Colors.darkfont
    }
});

const mainStyles = StyleSheet.create({

    navigation: {
        flexDirection: 'row',
        width: '100%',
        position: Platform.OS === 'web' ? 'fixed' : 'relative',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: navpadding,
        height: navheight,
        top: 0,
        zIndex: 99999
    },
    header: {
        width: '100%',
        padding: headerpadding,
        maxWidth: Platform.OS === 'web' ? 400 : '100%',
        position: Platform.OS === 'web' ? 'fixed' : 'relative',
        marginTop: Platform.OS === 'web' ? listmargin : 0,
        top: 0
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
        marginTop: Platform.OS === 'web' ? listmargin + titlefont : 0,
    },
    containercenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Platform.OS === 'web' ? listmargin + titlefont : 0,

    },
    containerwidth: {
        maxWidth: Platform.OS === 'web' ? 400 : '100%',
        alignItems: 'center'
    },
    list: {
        flex: Platform.OS === 'web' ? -1 : 1,
        width: '100%',
        marginTop: Platform.OS === 'web' ? listmargin + titlefont : 0,
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
        position: Platform.OS === 'web' ? 'fixed' : 'relative',
        bottom: 0
    },
    footerbuttons: {
        maxWidth: Platform.OS === 'web' ? 400 : '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    sidemenu: {
        position: 'absolute',
        top: 50,
        right: 0,
        backgroundColor: 'transparent',
        zIndex: 1500,
        height: 100,
        width: 50,
        backgroundColor: 'white'
    },
});

/**
 * 
 * @param {String} useTheme `dark` or `light` (default)
 */
export default function getStyleSheet(useTheme) {
    if (useTheme === 'dark') {
        if(Platform.OS === 'web') addStyle(`body {background: ${Colors.dark}; }`)
        return { ...mainStyles, ...darkStyleSheet }
    }
    else {
        if(Platform.OS === 'web') addStyle(`body {background: ${Colors.light}; }`)
        return { ...mainStyles, ...lightStyleSheet }
    }

}
