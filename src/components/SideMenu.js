import React, { useState, useContext } from 'react'
import { View, TouchableOpacity } from 'react-native'
import Text from './Text'
import ThemeContext from '../contexts/ThemeContext';

const debug = false

const ITEM_HEIGHT = 48;

/**
 * 
 * @param {*} props
 * @param {Array} props.options list of items `[{name, link, action}, ...]`
 * @param {*} props.selected default selected item in list
 *  
 */
export default function SideMenu(props) {
    const [show, setShow] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const styles = useContext(ThemeContext)

    const handleClick = event => {
        console.log(event.nativeEvent)
        setShow(true);
        setAnchorEl({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY })
    };

    const handleClose = () => {
        setShow(false);
    };

// TODO: NEXT ACTION FIX MENU STYLING
    return (
        <View>
            {debug && console.log(anchorEl)}
            <TouchableOpacity onPress={(event) => handleClick(event)} >
                <Text>Menu</Text>
            </TouchableOpacity>

            <View 
                style={{
                    maxHeight: ITEM_HEIGHT * 4.5,
                    width: 200,
                }}
                style={[{display: show ? 'flex' :'none'}, styles.sidemenu]}
            >
                {Array.isArray(props.options) ? props.options.map(option => (
                    option.link ?
                        <Text key={option.name} onPress={() => {
                            handleClose()
                            if (option.action) return option.action()
                        }}>
                            {option.name}
                        </Text>
                        :
                        <Text key={option.name} onPress={() => {
                            handleClose()
                            if (option.action) return option.action()
                        }}>
                            {option.name}
                        </Text>
                )) : null}
            </View>
        </View>
    );
}
