import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button, SectionList, Dimensions } from 'react-native';
import { isToday } from '../constants/Functions';
import messenger from '../constants/Messenger'
import { projectlink } from '../routes'

const debug = false
const test = false
const loadAll = false
const pagesize = 4

export default function TimelineList({ useHistory }) {
    let history = useHistory()
    const [pages, setPages] = useState([]) // [[{title: 'mm-dd-yyyy', data: [{id, }]}, ...], ... ]
    const [location, setLocation] = useState({ x: 0, y: 0 })
    const timelineList = useRef()

    //OPTIMIZE: pre-flatten pages...
    useEffect(() => {
        messenger.addListener("page", event => {
            debug && console.log('page:', event)
            setPages(pages => [...pages, event])
        })
        messenger.addListener("pages", event => {
            if (event && Array.isArray(event)) {
                console.log('Pages', event)
                setPages(event)
            }
        })
        messenger.on('stop', msg => {
            // NOTE: could listen on 'running' channel, but it breaks async flow on running timer
            // TODO: will need to test how this integrates with a native messenger
            setPages([])
            messenger.emit('getPage', { currentday: 0, refresh: true, pagesize: pagesize })

        })
        if (pages.length === 0) messenger.emit('getPage', { currentday: 0, refresh: true, pagesize: pagesize })

        messenger.addListener("timelinelocation", event => {
            console.log('location', event)
            setLocation({ x: event.x, y: event.y, animated: false })
            console.log('scrollTo: ', { x: event.x, y: event.y, animated: false })
            // https://github.com/facebook/react-native/issues/13151#issuecomment-337442644
            if (timelineList.current && timelineList.current._wrapperListRef) {
                timelineList.current._wrapperListRef._listRef._scrollRef.scrollTo({ x: event.x, y: event.y, animated: false })
            }
        })
        return () => {
            messenger.removeAllListeners("page")
            messenger.removeAllListeners("running")
            messenger.removeAllListeners("pages")
            messenger.removeAllListeners("timelinelocation")
        }
    }, [])

    useEffect(() => {

    }, [pages])

    const RenderTimer = ({ item }) => {
        return (
            <View style={{ flexDirection: 'row', margin: 10, width: '100%' }}>
                <View style={{ width: '30%' }}>
                    <Text onPress={() => history.push(projectlink(item.id))} style={{ color: item.color ? 'red' : 'yellow' }}>{item.name ? item.name : ''}</Text>
                </View>
                <View style={{ width: '30%' }}>
                    <Text style={{ color: 'red' }}>{item.lastcount}</Text>
                </View>
                <View style={{ width: '20%' }}>
                    <Button title='start' onPress={() => {
                        messenger.emit('start', { projectId: item.id })
                    }} />
                </View>
            </View>
        );
    };
    if (pages.length === 0) return (<Text style={styles.list}>Loading ... </Text>)
    return (
        <View style={styles.listContainter}>
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
                sections={pages && pages.flat(1).length > 0 ? pages.flat(1) : [{ title: 'Day', data: [{ name: 'nothing here' }] }]}
                renderSectionHeader={({ section: { title } }) => {
                    return (<Text>{title}</Text>)
                }}
                renderItem={RenderTimer}
                onEndReached={() => {
                    debug && console.log('End Reached')

                    debug && console.log('Getting Next')
                    debug && console.log(pages, typeof pages, Array.isArray(pages))
                    messenger.emit('getPage', { currentday: pages.length, pagesize: pagesize })

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
