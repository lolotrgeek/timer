import React from 'react'
import { NativeRouter, Switch, Route, useParams, useHistory, BackButton, useLocation } from "react-router-native"
import * as routes from './routes'


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
import Navigation from './components/Navigation'

export default function App() {
    return (
        <NativeRouter>
            <BackButton >
                <Navigation useHistory={useHistory} useLocation={useLocation} />
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
            </BackButton>
        </NativeRouter >
    );
}
