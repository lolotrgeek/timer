import React, { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import { NativeRouter, Switch, Route, useParams, useHistory, BackButton, Link } from "react-router-native"
import * as routes from './routes'
import messenger from './constants/Messenger.native'


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

export default function App() {
    const [online, setOnline] = useState('offline')

    useEffect(() => {
        messenger.addListener('status', msg => {
            setOnline(msg)
        })
        return () => messenger.removeAllListeners('status')
    })
    return (
        <NativeRouter>
            <BackButton >
                <View style={{ flexDirection: 'row', padding: 5, width: '100%', backgroundColor: 'white', }}>
                    <View style={{ margin: 10 }}>
                        <Link to={'/'}><Text>Timeline</Text></Link>
                    </View>
                    <View style={{ margin: 10 }}>
                        <Link to={'/projects'}><Text>Projects</Text></Link>
                    </View>
                    <View style={{ margin: 10 }}>
                        <Text >{online}</Text>
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
            </BackButton>
        </NativeRouter >
    );
}
