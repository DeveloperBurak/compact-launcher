import { app } from 'electron'
import { version } from '../package.json'
import { devLog } from './helpers/console'
import { isLinux, isWindows } from './helpers/os'
import './ipc/systemHandler'
import './ipc/windowHandler'
import * as setting from './strings/settings'
import { appVersion } from './strings/store'
import FileManager from './system/FileManager'
import ForegroundProgramTracker from './system/ForegroundProgramTracker'
import ListUI from './system/ListUI'
import { PreferenceManager } from './system/PreferenceManager'
import ProgramHandler from './system/ProgramHandler'
import StoreManager from './system/StoreManager'
import User from './system/User'
import { setTray } from './system/System'
import { WindowHandler } from './system/WindowHandler'

// app wide objects. use these objects for app wide actions
export const ForegroundProgramTrackerObj = new ForegroundProgramTracker()
export const WindowHandlerObj = new WindowHandler()
export const AppUser = new User()
export const PreferenceManagerObj = new PreferenceManager()
export const ListUIObj = new ListUI()
export const ProgramHandlerObj = new ProgramHandler()
export const StoreManagerObj = new StoreManager()

if (isLinux() || isWindows()) {
  app.commandLine.appendSwitch('enable-transparent-visuals') // fix the tranparent issue
  app.commandLine.appendSwitch('disable-gpu') // fix the tranparent issue
}

export let tray // system tray
app.on('ready', () => {
  if (AppUser.isFirst) {
    WindowHandlerObj.openWelcomeWindow()
  } else {
    WindowHandlerObj.openCollapsedWindow()
  }
  FileManager.createRequiredFolders()
  try {
    // it may throw exception on linux
    tray = setTray()
  } catch (e) {
    devLog(e)
  }
  if (StoreManagerObj.get(appVersion) == null) {
    StoreManagerObj.set(appVersion, version)
  }
  const alwaysOnTop = PreferenceManagerObj.get(setting.alwaysOnTop)
  if (alwaysOnTop == null) {
    PreferenceManagerObj.set(setting.alwaysOnTop, true) // default value is true
  }
  if (alwaysOnTop == null || alwaysOnTop) {
    ForegroundProgramTrackerObj.start() // if always on top is true or null, start the
  }
})

app.on('window-all-closed', () => {
  WindowHandlerObj.openCollapsedWindow()
})
