import { ipcMain } from 'electron'
import { ForegroundProgramTrackerObj, PreferenceManagerObj, programImageManager, StoreManagerObj } from '../background'
import { cacheProgramHTML } from '../strings/store'
import { devLog } from '../helpers/console'
import { removeFile } from '../helpers/file'
import * as ipc from '../strings/ipc'
import FileManager from '../system/FileManager'
import Program from '../system/Program'
import Steam from '../system/Steam'
import { setAutoLaunch } from '../system/System'
import Timer from '../system/Timer'
import { toURL } from '../helpers/url'

ipcMain.on(ipc.systemLog, (err, value) => {
  devLog(value)
})

ipcMain.on(ipc.removeProgram, (err, path) => {
  removeFile(path).then((deleted) => {
    if (deleted) {
      StoreManagerObj.delete(cacheProgramHTML)
    }
  })
})

ipcMain.on(ipc.removeImageFromProgram, (err, imagePath) => {
  removeFile(imagePath).then((deleted) => {
    if (deleted) {
      StoreManagerObj.delete(cacheProgramHTML)
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
  Timer.startTimer(data.time, data.action)
})

ipcMain.on(ipc.timerSetTime, (err, data) => {
  Timer.clearTime()
  Timer.startTimer(data.timeLeft, data.action)
})

ipcMain.on(ipc.timerStopped, () => {
  Timer.clearTime()
})

ipcMain.on(ipc.setAutoLaunch, (err, enabled) => {
  setAutoLaunch(enabled)
})

ipcMain.on(ipc.setSetting, (err, payload) => {
  PreferenceManagerObj.set(payload.key, payload.value)
})

ipcMain.on(ipc.setAlwaysOnTop, (err, enabled) => {
  if (enabled) {
    ForegroundProgramTrackerObj.start()
  } else {
    ForegroundProgramTrackerObj.stop()
  }
})

ipcMain.on(ipc.moveFile, (err, files) => {
  for (let file of files) {
    FileManager.moveToOurDocument(file)
  }
})

ipcMain.handle(ipc.fetchImageFromServer, async (err, payload) => {
  return await programImageManager.fetchImage(toURL(payload.programName))
})

ipcMain.handle(ipc.selectImageServer, async (err, payload) => {
  const response = await programImageManager.selectProgram(payload.docId, payload.programName)
  if (response.statusCode === 200) {
    return response.filePath
  }
  return null
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
