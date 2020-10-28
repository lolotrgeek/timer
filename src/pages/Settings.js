import React, {useEffect} from 'react'
import { View, Button } from 'react-native'
import Text from '../components/Text'
import messenger from '../constants/Messenger'
import { useAlert } from '../hooks/useAlert'

const debug = false

export default function Settings({ useLocation, styles }) {
    const alert = useAlert()
    useEffect(() => {
        messenger.addListener('alert', msg => { 
            if (msg && msg.length > 0) alert.show(msg[1], { type: msg[0] })
          })

          return () => {
            messenger.removeAllListeners(`alert`)
          }
    },[])

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>
            <View>
                <Button title='Export' onPress={()=> messenger.emit('export', true)} />
            </View>
        </View>
    )
}