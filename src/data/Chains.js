import { dateSimple } from '../constants/Functions'
export const projects = () => "projects"
export const project = projectId => `projects/${projectId}`
export const projectHistory = projectId => `history/projects/${projectId}`

export const running = () => 'running'

export const timers = () => "timers"
export const timer = timerId => `timers/${timerId}`
export const timerHistory = timerId => `history/timers/${timerId}`
export const projectTimers = projectId => `project/${projectId}/timers`
export const projectTimer = (projectId, timerId) => `project/${projectId}/timers/${timerId}`
export const projectDate = (date, projectId) => `date/projects/${dateSimple(date)}/${projectId}`
export const projectDates = day => `date/projects/${day}`
export const timerDates  = () => "date/timers"
export const timerDate = (day, timerId) => `date/timers/${dateSimple(day)}/${timerId}`
