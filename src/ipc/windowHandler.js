import { ipcMain } from 'electron'
import { ListUIObj, PreferenceManagerObj, ProgramHandlerObj, StoreManagerObj, WindowHandlerObj, AppUser } from '../background'
import * as ipc from '../strings/ipc'
import Timer from '../system/Timer'

ipcMain.on(ipc.openExpandWindow, () => {
  WindowHandlerObj.openExpandedWindow()
})

ipcMain.on(ipc.closeExpandWindow, () => {
  WindowHandlerObj.openCollapsedWindow()
})

ipcMain.on(ipc.openCollapsedWindow, (err, closeAll) => {
  if (closeAll) {
    WindowHandlerObj.getAllWindows().forEach((window) => {
      window.close()
    })
  }
  WindowHandlerObj.openCollapsedWindow()
})

ipcMain.on(ipc.openSettingWindow, () => {
  WindowHandlerObj.openSettingsWindow()
})

ipcMain.on(ipc.closeSettingWindow, (err) => {
  if (WindowHandlerObj.settingsWindow !== null) WindowHandlerObj.settingsWindow.close()
})

ipcMain.on(ipc.openToolsWindow, () => {
  WindowHandlerObj.openToolsWindow()
})

ipcMain.on(ipc.closeToolsWindow, () => {
  if (WindowHandlerObj.toolsWindow !== null) WindowHandlerObj.toolsWindow.close()
})

ipcMain.on(ipc.isSteamExists, () => {
  AppUser.getSteamUser().then((steamPath) => {
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
