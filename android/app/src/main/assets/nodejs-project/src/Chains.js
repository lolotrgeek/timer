const { dateSimple } = require('./Functions')
exports.projects = () => "projects"
exports.project = projectId => `projects/${projectId}`
exports.projectHistory = projectId => `history/projects/${projectId}`

exports.running = () => 'running'

exports.timers = () => "timers"
exports.timer = timerId => `timers/${timerId}`
exports.timerHistory = timerId => `history/timers/${timerId}`
exports.projectTimers = projectId => `project/${projectId}/timers`
exports.projectTimer = (projectId, timerId) => `project/${projectId}/timers/${timerId}`
exports.projectDate = (date, projectId) => `date/projects/${dateSimple(date)}/${projectId}`
exports.projectDates = day => `date/projects/${day}`
exports.timerDates  = () => "date/timers"
exports.timerDate = (day, timerId) => `date/timers/${dateSimple(day)}/${timerId}`

