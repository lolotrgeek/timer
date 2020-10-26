import { Export } from '../data/Store'
import messenger from '../constants/Messenger'
const { SettingState } = require('node/state/settingState')

SettingState({ messenger, Export })