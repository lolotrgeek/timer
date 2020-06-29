import React from 'react'
import { View, Text } from 'react-native'
import { BrowserRouter as Router, Link, Switch, Route, useParams, useHistory } from "react-router-dom"
import * as routes from './routes'
import './service/timer'


// NOTE: order matters for parameter routing
import Timeline from './pages/Timeline'
import Timers from './pages/Timers'
import Projects from './pages/Projects'
import Project from './pages/Project'

export default function App() {
    return (
        <Router>
            <View style={{ flexDirection: 'row', margin: 10 }}>
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
                <Route path={routes.projectlink(':projectId')} children={<Project useParams={useParams} useHistory={useHistory} />} />
            </Switch>
        </Router >
    );
}
