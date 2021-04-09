import { ipcMain } from 'electron'
import { ListUIObj, PreferenceManagerObj, ProgramHandlerObj, StoreManagerObj, WindowHandlerObj } from '../background'
import * as ipc from '../strings/ipc'
import Timer from '../system/Timer'
import User from '../system/User'

ipcMain.on(ipc.openExpandWindow, () => {
  WindowHandlerObj.openExpandedWindow()
})

ipcMain.on(ipc.closeExpandWindow, () => {
  WindowHandlerObj.openCollapsedWindow()
})

ipcMain.on(ipc.openSettingWindow, () => {
  WindowHandlerObj.openSettingsWindow()
})

ipcMain.on(ipc.openToolsWindow, () => {
  WindowHandlerObj.openToolsWindow()
})

ipcMain.on(ipc.isSteamExists, () => {
  User.getSteamUser().then((steamPath) => {
    WindowHandlerObj.expandedWindow.webContents.send(ipc.isSteamUserExists, steamPath !== null)
  })
})

ipcMain.handle(ipc.getSetting, (err, name) => {
  return PreferenceManagerObj.get(name)
})

ipcMain.handle(ipc.getAllSettings, async () => {
  return await PreferenceManagerObj.getAll()
})

ipcMain.handle(ipc.getProgramsHTML, async (event, payload = {}) => {
  let html
  console.log(payload)
  if (payload.refreshCache == null || !payload.refreshCache) {
    html = await StoreManagerObj.getProgramListCache()
  }
  if (html == null) {
    html = await ListUIObj.getList('html')
    StoreManagerObj.setProgramListCache(html)
  }
  return html
})
ipcMain.on(ipc.timerRequestTime, () => {
  WindowHandlerObj.toolsWindow.webContents.send(ipc.timerRemainingTime, Timer.getRemainingTime())
})
ipcMain.on(ipc.launchProgram, (err, file) => {
  ProgramHandlerObj.launch(file)
  WindowHandlerObj.expandedWindow.webContents.send(ipc.closeExpandWindow)
})

Timer.on('osTimer-notify', () => {
  const notification = Timer.getNotification()
  WindowHandlerObj.getCurrentWindow().webContents.send(ipc.notificationReceived, notification)
})
