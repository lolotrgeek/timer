export const timerRunninglink = () => `/timer/`
export const timerlink = (projectId, timerId) => `/timer/${projectId}/${timerId}`
export const timerListlink = () => `/timers`
export const timerHistorylink = (projectId, timerId) => `/timer/${projectId}/${timerId}/history`
export const timerTrashlink = (projectId) => `/timertrash/${projectId}`
export const projectlink = (projectId) => `/project/${projectId}`
export const projectTrashlink = (projectId) => `/trash`
export const projectEditlink = (projectId) => `/edit/project/${projectId}/`
export const projectHistorylink = (projectId) => `/history/project/${projectId}/`
export const projectCreatelink = () => `/create/project/`
export const projectsListLink = () => `/projects/`