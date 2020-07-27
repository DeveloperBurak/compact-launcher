export const scanPrograms = 'system:scan:programs';
export const itemsReady = 'items:ready';
export const cacheScannedPrograms = 'cache:programs';
export const removeProgramCache = 'cache:programs:remove';
export const renderItem = 'items:render';

export const getSteamUser = 'steam:user:get';
export const isSteamUserExists = 'steam:user:exists';
export const isSteamExists = 'steam:check:exists';
export const getUserAnswer = 'stem:user:answer';

export const launchProgram = 'program:launch';
export const removeProgram = 'program:remove';
export const removeImageFromProgram = 'program:remove:image';
export const addImageFromProgram = 'program:add:image';

export const expandWindow = 'window:expand';
export const closeExpandWindow = 'window:close:expanded';
export const openSettingWindow = 'window:open:settings';
export const openToolsWindow = 'window:open:tools';
export const openSubWindow = 'window:open:subWindow'; // TODO continue this

export const systemLog = 'console:log';

export const ipcSetAutoLaunch = 'system:setAutoLaunch';
export const ipcSetAlwaysOnTop = 'system:setAlwaysOnTop';
export const ipcGetSetting = 'system:getSetting';
export const ipcGetSettingReady = 'system:getSetting:ready';
export const ipcDisableShutdown = 'system:shutdown:disable';
export const ipcNotificationReceived = 'system:notification:received';

export const ipcTimerStarted = 'tools:timer:started';
export const ipcTimerSetTime = 'tools:timer:set:time';
export const ipcTimerFinished = 'tools:timer:finished';
export const ipcTimerStopped = 'tools:timer:stopped';
export const ipcTimerRequestTime = 'tools:timer:request:time'; // send a request from client
export const ipcTimerRemainingTime = 'tools:timer:time';
