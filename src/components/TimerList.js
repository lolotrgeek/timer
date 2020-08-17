import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SectionList, Dimensions } from 'react-native';
import messenger from '../constants/Messenger'
import { projectlink } from '../routes'
import '../state/timelineState'

const debug = false
const test = false
const loadAll = false
const pagesize = 4

export default function TimerList({ useHistory }) {
    let history = useHistory()
    const [pages, setPages] = useState([])
    const [location, setLocation] = useState({ x: 0, y: 0 })
    const timelineList = useRef()

    useEffect(() => {
        messenger.addListener("page", event => {
            console.log('page:', event)
            setPages(pages => [...pages, event])
        })
        messenger.addListener("pages", event => {
            if (event && Array.isArray(event)) {
                console.log('Pages', event)
                setPages(event)
            }
        })
        messenger.addListener("pagelocation", event => {
            setLocation({ x: event.x, y: event.y, animated: false })
            console.log('scrollTo: ', { x: event.x, y: event.y, animated: false })
            // https://github.com/facebook/react-native/issues/13151#issuecomment-337442644
            if (timelineList.current._wrapperListRef) {
                timelineList.current._wrapperListRef._listRef._scrollRef.scrollTo({ x: event.x, y: event.y, animated: false })
            }
        })
        messenger.emit('getPage', { currentday: pages.length, pagesize: pagesize })
        return () => {
            messenger.removeAllListeners("page")
            messenger.removeAllListeners("pages")
            messenger.removeAllListeners("pagelocation")
        }
    }, [])


    const renderTimer = ({ item }) => {
        console.log('rendering:', item)
        return (
            <View style={{ flexDirection: 'row', margin: 10, width: '100%' }}>
                <View style={{ width: '30%' }}>
                    <Text onPress={() => history.push(projectlink(item.project))} style={{ color: item.color ? 'red' : 'yellow' }}>{item.name ? item.name : ''}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Text style={{ color: 'red' }}>{item.total}</Text>
                </View>
                <View style={{ width: '30%' }}>

                </View>
            </View>
        );
    };
    return (
        <View style={styles.listContainter}>
            {console.log('rendering...', pages)}
            <SectionList
                ListHeaderComponent={<Text style={{ textAlign: 'center', fontSize: 25 }}>Timeline</Text>}
                // TODO: simplify creating sticky header/footer with list
                //app routes: 20 padding + 50 height
                // header: 20 padding + 100 height
                // 20 + 20 + 50 + 100 = 190
                style={styles.list}
                ref={timelineList}
                onLayout={layout => {
                    debug && console.log(timelineList.current)
                }}
                sections={pages && pages.length > 0 ? pages.flat(1) : [{ title: 'Day', data: [{ name: 'nothing here' }] }]}
                renderSectionHeader={({ section: { title } }) => {
                    return (<Text>{title}</Text>)
                }}
                renderItem={renderTimer}
                onEndReached={() => {
                    debug && console.log('End Reached')
                    if (pages) {
                        debug && console.log(pages, typeof pages, Array.isArray(pages))
                        messenger.emit('getPage', { currentday: pages.flat(1).length, pagesize: pagesize })
                    }
                }}
                onEndReachedThreshold={1}
                keyExtractor={(item, index) => item.project}
                onScroll={scroll => {
                    // console.log(scroll.nativeEvent.contentOffset.y)
                    messenger.emit('pagelocation', scroll.nativeEvent.contentOffset)
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    listContainter: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: '#ccc'
    },
    list: {
        marginTop: 170, height: Dimensions.get('window').height - 170
    }
});
