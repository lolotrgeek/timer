export const timerRunninglink = () => `/timer/`
export const timerlink = (projectId, timerId) => `/timers/${projectId}/${timerId}`
export const timerListlink = () => `/timers`
export const timerHistorylink = (projectId, timerId) => `/timer/${projectId}/${timerId}/history`
export const timerTrashlink = (projectId) => `/timertrash/${projectId}`
export const projectlink = (projectId) => `/projects/${projectId}`
export const projectTrashlink = (projectId) => `/trash`
export const projectEditlink = (projectId) => `/projects/${projectId}/edit`
export const projectHistorylink = (projectId) => `/project/${projectId}/history`
export const projectCreatelink = () => `/projects/create/`
export const projectsListLink = () => `/projects/`