import React from 'react'
import { View, Text } from 'react-native'
import { NativeRouter, Switch, Route, useParams, useHistory, BackButton, Link } from "react-router-native"
import * as routes from './routes'

// NOTE: order matters for parameter routing
import Timeline from './pages/Timeline'
import Timers from './pages/Timers'
import Projects from './pages/Projects'

export default function App() {
    return (
        <NativeRouter>
            <BackButton >
                <View style={{ position: 'absolute', flexDirection: 'row', padding: 10, width: '100%', background: 'white', zIndex: 10000 }}>
                    <View style={{ width: '30%' }}>
                        <Link to={'/'}><Text>Timeline</Text></Link>
                    </View>
                    <View style={{ width: '30%' }}>
                        <Link to={'/projects'}><Text>Projects</Text></Link>
                    </View>
                    <View style={{ width: '30%' }}>
                        <Link to={'/timers'}><Text>Timers</Text></Link>
                    </View>
                </View>


                <Switch >
                    <Route exact path="/" children={<Timeline useParams={useParams} useHistory={useHistory} />} />
                    <Route path={routes.projectsListLink()} children={<Projects useParams={useParams} useHistory={useHistory} />} />
                    <Route path={routes.timerListlink()} children={<Timers useParams={useParams} useHistory={useHistory} />} />
                    {/* <Route path={routes.projectlink(':projectId')} children={<Projects useParams={useParams} useHistory={useHistory} />} /> */}
                </Switch>
            </BackButton>
        </NativeRouter >
    );
}
