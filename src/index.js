// WEB version
import React from 'react';
import { AppRegistry, Platform } from 'react-native';
import App from './App';

import { name as appName } from './app.json';

AppRegistry.registerComponent('Notify', () => App);

if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root') || document.getElementById('main');
  AppRegistry.runApplication('Notify', { rootTag });
  require('./service/timer')
  require('./state/timelineState')
  require('./state/projectCreateState')
  require('./state/projectHistoryState')
  require('./state/projectTrashState')
  require('./state/timerState')
  require('./state/timerHistoryState')
  require('./state/timerTrashState')
  require('./state/projectState')
  require('./state/projectsState')
  require('./state/projectEditState')
}
