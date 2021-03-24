import { ipcMain } from 'electron'
import { PreferenceManagerObj, WindowHandlerObj } from '../background'
import * as ipc from '../helpers/ipcActions'
import OSTimer from '../system/OSTimer'
import ProgramHandler from '../system/ProgramHandler'
import User from '../system/User'
import './ipcSystemHandler'

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
  return PreferenceManagerObj.getSetting(name)
})

ipcMain.handle(ipc.getAllSettings, async () => {
  return await PreferenceManagerObj.getAllSettings()
})

ipcMain.handle(ipc.getProgramsHTML, (err, name) => {
  return `<p>Test</p>`
})
ipcMain.on(ipc.timerRequestTime, () => {
  WindowHandlerObj.toolsWindow.webContents.send(ipc.timerRemainingTime, OSTimer.getRemainingTime())
})
ipcMain.on(ipc.launchProgram, (err, file) => {
  ProgramHandler.launch(file)
  WindowHandlerObj.expandedWindow.webContents.send(ipc.closeExpandWindow)
})

OSTimer.on('osTimer-notify', () => {
  const notification = OSTimer.getNotification()
  WindowHandlerObj.getCurrentWindow().webContents.send(ipc.notificationReceived, notification)
})
