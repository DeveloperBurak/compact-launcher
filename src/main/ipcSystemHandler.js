import * as ipc from '../helpers/ipcActions'
import { app, ipcMain } from 'electron'
import Program from '../system/Program'
import OSTimer from '../system/OSTimer'
import Steam from '../system/Steam'
import { cacheProgramHTML } from '../configs/global_variables'
import { removeFile } from '../helpers/file'
import { startProgramTracking, stopProgramTracking, setSetting, setAutoLaunch } from '../system/System'
import * as setting from '../helpers/settingKeys'
import FileManager from '../system/FileManager'
import { devLog } from '../helpers/console'
import StoreManager from '../system/StoreManager'
import { PreferenceManagerObj } from '../background'

ipcMain.on(ipc.cacheScannedPrograms, (err, cache) => {
  StoreManager.set('app.version', Number.parseFloat(app.getVersion()))
  StoreManager.setProgramListCache(cache.html)
})

ipcMain.on(ipc.systemLog, (err, value) => {
  devLog(value)
})

ipcMain.on(ipc.removeProgramCache, () => {
  StoreManager.deleteProgramListCache()
})

ipcMain.on(ipc.removeProgram, (err, path) => {
  removeFile(path).then((deleted) => {
    if (deleted) {
      StoreManager.delete(cacheProgramHTML)
    }
  })
})

ipcMain.on(ipc.removeImageFromProgram, (err, imagePath) => {
  removeFile(imagePath).then((deleted) => {
    if (deleted) {
      StoreManager.delete(cacheProgramHTML)
    }
  })
})

ipcMain.on(ipc.addImageFromProgram, (err, items) => {
  Program.addNewImage(items.file, items.name)
})

ipcMain.on(ipc.getUserAnswer, (err, response) => {
  Steam.setUser(response)
})

ipcMain.on(ipc.disableShutdown, () => {
  cancelShutDown()
})

ipcMain.on(ipc.timerStarted, (err, data) => {
  OSTimer.startTimer(data.time, data.action)
})

ipcMain.on(ipc.timerSetTime, (err, data) => {
  OSTimer.clearTime()
  OSTimer.startTimer(data.timeLeft, data.action)
})

ipcMain.on(ipc.timerStopped, () => {
  OSTimer.clearTime()
})

ipcMain.on(ipc.setAutoLaunch, (err, enabled) => {
  setAutoLaunch(enabled)
})

ipcMain.on(ipc.setSetting, (err, payload) => {
  PreferenceManagerObj.setSetting(payload.key, payload.value)
})

ipcMain.on(ipc.setAlwaysOnTop, (err, enabled) => {
  if (enabled) {
    startProgramTracking()
  } else {
    stopProgramTracking()
  }
})

ipcMain.on(ipc.moveFile, (err, files) => {
  for (let file of files) {
    FileManager.moveToShortcutsFolder(file)
  }
})

ipcMain.on(ipc.disconnectUser, (err, data) => {
  switch (data.platform) {
    case 'steam':
      Steam.disconnectUser()
      break
    default:
      throw new Error('Invalid Platform')
  }
})
