// WEB version
import React from 'react';
import { AppRegistry, Platform } from 'react-native';
import App from './App';

import { name as appName } from './app.json';

AppRegistry.registerComponent('Notify', () => App);

if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root') || document.getElementById('main')
  AppRegistry.runApplication('Notify', { rootTag })
  require('./data/Tests')
  require('./state/appWeb')
  require('./state/runningWeb')
  require('./state/timelineWeb')
  require('./state/projectCreateWeb')
  require('./state/projectHistoryWeb')
  require('./state/projectTrashWeb')
  require('./state/timerWeb')
  require('./state/timersWeb')
  require('./state/timerHistoryWeb')
  require('./state/timerTrashWeb')
  require('./state/projectWeb')
  require('./state/projectsStateWeb')
  require('./state/projectEditWeb')
}
