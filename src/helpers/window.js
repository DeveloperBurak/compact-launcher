// This helper remembers the size and position of your windows (and restores
// them in that place after app relaunch).
// Can be used for more than one window, just construct many
// instances of it and give each different name.
import { BrowserWindow, screen } from 'electron'
import env from 'env'
import { PreferenceManagerObj } from '../background'
import { isLinux, isWindows } from './os'
import * as setting from './settingKeys'

export default (name, options) => {
  let win = null
  let windowOptions = {
    frame: options.frame ?? false,
    transparent: options.transparent ?? false,
    useContentSize: options.useContentSize ?? false,
    skipTaskbar: options.skipTaskbar ?? true,
    resizable: options.resizable ?? false,
    show: options.show ?? false,
    center: options.center ?? null,
    width: options.width ?? screen.getPrimaryDisplay().size.width,
    height: options.height ?? screen.getPrimaryDisplay().size.height,
    webPreferences: { contextIsolation: false, enableRemoteModule: true, nodeIntegration: true }, // TODO security hole. change there
  }

  if (options.type == 'toolbar') {
    if (isWindows() || isLinux()) {
      windowOptions.type = options.type
    }
  }
  const alwaysOnTop = PreferenceManagerObj.getSetting(setting.alwaysOnTop)
  if (alwaysOnTop != null) {
    windowOptions.alwaysOnTop = alwaysOnTop
  } else if (options.alwaysOnTop) {
    windowOptions.alwaysOnTop = options.alwaysOnTop
  }
  if (windowOptions.center == null) {
    windowOptions.x = options.x ?? 0
    windowOptions.y = options.y ?? 0
  }
  win = new BrowserWindow(windowOptions)
  const additionalTitle = options.title != null ? ' - ' + options.title : ''
  win.setTitle('Compact Launcher' + additionalTitle)
  win.setSkipTaskbar(options.skipTaskbar)
  if (options.devTools && env.name === 'development') {
    win.webContents.openDevTools({ mode: 'undocked' })
  }
  return win
}
