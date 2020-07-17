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
import ProjectCreate from './pages/ProjectCreate'
import ProjectHistory from './pages/ProjectHistory'

export default function App() {
    return (
        <Router>
            <View style={{ position: 'absolute', flexDirection: 'row', padding: 10, width:'100%', background: 'white', zIndex:10000, height:50, }}>
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
                <Route path={routes.projectCreatelink()} children={<ProjectCreate useParams={useParams} useHistory={useHistory} />} />
                <Route path={routes.projectEditlink(':projectId')} children={<ProjectCreate useParams={useParams} useHistory={useHistory} />} />
                <Route path={routes.projectHistorylink(':projectId')} children={<ProjectHistory useParams={useParams} useHistory={useHistory} />} />
            </Switch>
        </Router >
    );
}
