// projects, projectTimers, timeline, timerHistory, projectHistory
import React, { useState, useEffect, useRef } from 'react'
import { FlatList } from 'react-native'

/**
 * 
 * @param {*} props 
 * @param {*} props.title 
 */
const ListTitle = (props) => (<View><Text>{props.title}</Text></View>)

/**
 * 
 * @param {*} props 
 */
const ItemCard = (props) => (
    <View>
        <Text>{props.title}</Text>
    </View>
)

/**
 * 
 * @param {*} props 
 */
const ListCell = (props) => (
    <View style={{ width: props.width }}>
        <Text style={{ color: item.color ? item.color : '' }}>{props.item.id ? props.item.id : ''}</Text>
    </View>
)

const calcWidth = columns => 100 / columns.length

const ListItem = ({ item }) => {
    let columns = item.keys()
    let width = calcWidth(columns).toString() + '%'
    return (
        <View style={{ flexDirection: 'row', margin: 10 }}>
            {columns.map(column => <ListCell width={width} item={item} />)}
        </View>
    );
};

export default List = (props) => {
    // can use keys as column titles, has to be outside of ListItem
    return (
        <View style={styles.list}>
            <ListTitle text={props.title} />
            <ItemCard contents={props.card}/>
            <FlatList
                data={props.data}
                style={{ height: 150 }}
                renderItem={ListItem}
                keyExtractor={item => item.id}
            />
        </View>
    )
}
