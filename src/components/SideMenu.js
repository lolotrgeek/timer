import React, { useState } from 'react'
import { View, TouchableOpacity } from 'react-native'

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

    const handleClick = event => {
        console.log(event.nativeEvent)
        setShow(true);
        setAnchorEl({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY })
    };

    const handleClose = () => {
        setShow(false);
    };


    return (
        <View style={{}} >
            {debug && console.log(anchorEl)}
            <TouchableOpacity onPress={(event) => handleClick(event)} style={{}} >
                <MenuIcon size={30} color='black' />
            </TouchableOpacity>

            <View
                anchor={anchorEl}
                keepMounted
                visible={show}
                onDismiss={handleClose}
                contentStyle={{
                    maxHeight: ITEM_HEIGHT * 4.5,
                    width: 200,
                }
                }
            >
                {Array.isArray(props.options) ? props.options.map(option => (
                    option.link ?

                        <View key={option.name} onPress={() => {
                            handleClose()
                            if (option.action) return option.action()
                        }}>
                            {option.name}
                        </View>
                        :
                        <View key={option.name} onPress={() => {
                            handleClose()
                            if (option.action) return option.action()
                        }}>
                            {option.name}
                        </View>
                )) : null}
            </View>
        </View>
    );
}
