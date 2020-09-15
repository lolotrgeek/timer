import React from 'react'
import { View, Text } from 'react-native'
import { BrowserRouter as Router, Link, Switch, Route, useParams, useHistory } from "react-router-dom"
import * as routes from './routes'
import { transitions, positions, Provider as AlertProvider } from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'

// NOTE: order matters for parameter routing
import Timeline from './pages/Timeline'
import Projects from './pages/Projects'
import Project from './pages/Project'
import ProjectCreate from './pages/ProjectCreate'
import ProjectHistory from './pages/ProjectHistory'
import ProjectTrash from './pages/ProjectTrash'
import Timer from './pages/Timer'
import TimerHistory from './pages/TimerHistory'
import TimerTrash from './pages/TimerTrash'
import Running from './pages/Running'

const alertOptions = {
    // you can also just use 'bottom center'
    position: positions.BOTTOM_CENTER,
    timeout: 5000,
    offset: '30px',
    // you can also just use 'scale'
    transition: transitions.FADE
}

export default function App() {
    return (
        <AlertProvider template={AlertTemplate} {...alertOptions}>
            <Router>
                <View style={{ flexDirection: 'row', padding: 10, width: '100%', backgroundColor: 'white', height: 50 }}>
                    <View style={{ margin: 10 }}>
                        <Link to={'/'}><Text>Timeline</Text></Link>
                    </View>
                    <View style={{ margin: 10 }}>
                        <Link to={'/projects'}><Text>Projects</Text></Link>
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
                    <Route path={routes.timerHistorylink(':timerId')} children={<TimerHistory useParams={useParams} useHistory={useHistory} />} />
                    <Route path={routes.timerTrashlink(':projectId')} children={<TimerTrash useParams={useParams} useHistory={useHistory} />} />
                    <Route path={routes.runninglink()} children={<Running useParams={useParams} useHistory={useHistory} />} />

                </Switch>
            </Router >
        </AlertProvider>
    );
}
