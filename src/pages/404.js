import React from 'react';
import { View } from 'react-native';
import Text from '../components/Text'

export default function None({ useLocation, styles }) {
    return (
        <View style={styles.containercenter}>
            <View style={styles.header}>
                <Text style={styles.title}>Page does not Exist.</Text>
            </View>
        </View>
    )
}