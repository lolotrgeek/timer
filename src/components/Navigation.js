import React, { useEffect, useState } from 'react'
import { View, Button } from 'react-native'
import Text from './Text'
import messenger from '../constants/Messenger'
import SideMenu from './SideMenu'


export default function Navigation({ useHistory, useLocation }) {
    const [online, setOnline] = useState('offline')
    let history = useHistory()
    let location = useLocation()

    useEffect(() => {
        messenger.addListener('status', msg => {
            setOnline(msg)
        })
        return () => messenger.removeAllListeners('status')
    })

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5, height: 50, }}>
            <View style={{ margin: 10, }}>
                {location && typeof location === 'object' && location.pathname === "/" ?
                    <View></View> : <Button title="back" onPress={() => history.goBack()} />
                }
            </View>
            <View style={{ margin: 10 }}>
                <Text >{online}</Text>
            </View>
        </View>
    )
}