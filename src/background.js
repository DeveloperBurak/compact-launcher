import { app } from 'electron'
import { devLog } from './helpers/console'
import { isLinux, isWindows } from './helpers/os'
import * as setting from './helpers/settingKeys'
import './main/ipcSystemHandler'
import './main/ipcWindowHandler'
import FileManager from './system/FileManager'
import { PreferenceManager } from './system/PreferenceManager'
import { setTray, startProgramTracking } from './system/System'
import { WindowHandler } from './system/WindowHandler'

export const WindowHandlerObj = new WindowHandler()
export const PreferenceManagerObj = new PreferenceManager()

if (isLinux() || isWindows()) {
  app.commandLine.appendSwitch('enable-transparent-visuals')
  app.commandLine.appendSwitch('disable-gpu')
}

export let tray // system tray

app.on('ready', () => {
  WindowHandlerObj.openCollapsedWindow()
  FileManager.createRequiredFolders()
  try {
    // it may throw exception on linux
    tray = setTray()
  } catch (e) {
    devLog(e)
  }

  const alwaysOnTop = PreferenceManagerObj.getSetting(setting.alwaysOnTop)
  if (alwaysOnTop == null) {
    PreferenceManagerObj.setSetting(setting.alwaysOnTop, true) // default is true
  }
  if (alwaysOnTop == null || alwaysOnTop) {
    startProgramTracking()
  }
})

app.on('window-all-closed', () => {
  WindowHandlerObj.openCollapsedWindow()
})
