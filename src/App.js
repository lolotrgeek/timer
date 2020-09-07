import React from 'react'
import { View, Text } from 'react-native'
import { BrowserRouter as Router, Link, Switch, Route, useParams, useHistory } from "react-router-dom"
import * as routes from './routes'

// NOTE: order matters for parameter routing
import Timeline from './pages/Timeline'
import Projects from './pages/Projects'
import Project from './pages/Project'
import ProjectCreate from './pages/ProjectCreate'
import ProjectHistory from './pages/ProjectHistory'
import ProjectTrash from './pages/ProjectTrash'
import Timer from './pages/Timer'
import Timers from './pages/Timers'
import TimerHistory from './pages/TimerHistory'
import TimerTrash from './pages/TimerTrash'


export default function App() {
    return (
        <Router>
            <View style={{ flexDirection: 'row', padding: 10, width:'100%', backgroundColor: 'white', height:50}}>
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
                <Route path={routes.projectlink(':projectId')} children={<Project useParams={useParams} useHistory={useHistory} />} />
                <Route path={routes.projectCreatelink()} children={<ProjectCreate useParams={useParams} useHistory={useHistory} />} />
                <Route path={routes.projectEditlink(':projectId')} children={<ProjectCreate useParams={useParams} useHistory={useHistory} />} />
                <Route path={routes.projectHistorylink(':projectId')} children={<ProjectHistory useParams={useParams} useHistory={useHistory} />} />
                <Route path={routes.projectTrashlink()} children={<ProjectTrash useParams={useParams} useHistory={useHistory} />} />
                <Route path={routes.timerlink(':timerId')} children={<Timer useParams={useParams} useHistory={useHistory} />} />
                <Route path={routes.timernew(':projectId')} children={<Timer useParams={useParams} useHistory={useHistory} />} />
                <Route path={'/timers'} children={<Timers useParams={useParams} useHistory={useHistory} />} />
                <Route path={routes.timerHistorylink(':timerId')} children={<TimerHistory useParams={useParams} useHistory={useHistory} />} />
                <Route path={routes.timerTrashlink(':projectId')} children={<TimerTrash useParams={useParams} useHistory={useHistory} />} />
            </Switch>
        </Router >
    );
}
