export const timernew = projectId => `/new/${projectId}`
export const timerlink = timerId => `/timer/${timerId}`
export const timerListlink = () => `/timers`
export const timerHistorylink = timerId => `/history/timer/${timerId}`
export const timerTrashlink = (projectId) => `/timertrash/${projectId}`
export const projectlink = (projectId) => `/project/${projectId}`
export const projectTrashlink = () => `/trash`
export const projectEditlink = (projectId) => `/edit/project/${projectId}/`
export const projectHistorylink = (projectId) => `/history/project/${projectId}/`
export const projectCreatelink = () => `/create/project/`
export const projectsListLink = () => `/projects/`
export const runninglink = () => `/running/`