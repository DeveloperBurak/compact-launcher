import { BrowserWindow, screen } from 'electron'
import path from 'path'
import { PreferenceManagerObj } from '../background'
import scenes from '../configs/scenes.json'
import { isDev } from '../helpers/env'
import { getSteamUser } from '../strings/ipc'
import { isLinux, isWindows } from '../helpers/os'
import * as setting from '../strings/settings'
import Steam from './Steam'

export class WindowHandler {
  constructor() {
    this.collapsedWindow = null
    this.expandedWindow = null
    this.settingsWindow = null
    this.toolsWindow = null
  }
  openCollapsedWindow = () => {
    if (this.collapsedWindow == null) {
      let collapsedWindow = this.createWindow('collapsed', scenes.collapsedScreen)
      collapsedWindow.loadURL(path.join(__dirname, 'views/collapsed.html'))
      collapsedWindow.on('ready-to-show', () => {
        collapsedWindow.show()
        if (this.expandedWindow != null) this.expandedWindow.close()
        this.collapsedWindow = collapsedWindow
      })
      collapsedWindow.on('closed', () => {
        this.collapsedWindow = null
      })
    } else {
      this.collapsedWindow.show()
    }
  }
  openExpandedWindow = () => {
    if (this.expandedWindow == null) {
      let expandedWindow = this.createWindow('expanded', scenes.expandedScreen)
      expandedWindow.loadURL(path.join(__dirname, 'views/expanded.html'))
      expandedWindow.on('ready-to-show', () => {
        Steam.getUser()
          .then((user) => {
            if (user != null && user.account !== false) {
              expandedWindow.webContents.send(getSteamUser, user)
            }
          })
          .catch((message) => {
            console.log(message)
          })
        this.expandedWindow = expandedWindow
        // setTimeout(() => {
          this.expandedWindow.show()
        // }, 1000)

        if (this.collapsedWindow != null) {
          this.collapsedWindow.close()
          this.collapsedWindow = null
        }
      })
      expandedWindow.on('closed', () => {
        this.expandedWindow = null
      })
    } else {
      expandedWindow.show()
    }
  }
  openSettingsWindow = () => {
    if (this.settingsWindow == null) {
      let settingsWindow = this.createWindow('subSettings', scenes.settingsScreen)
      settingsWindow.loadURL(path.join(__dirname, 'views/sub/settings.html'))
      settingsWindow.setMenu(null)
      settingsWindow
        .on('ready-to-show', () => {
          this.settingsWindow = settingsWindow
          if (this.expandedWindow != null) {
            this.expandedWindow.close()
            this.expandedWindow = null
          }
          settingsWindow.show()
        })
        .on('closed', () => {
          this.settingsWindow = null
        })
    } else {
      this.settingsWindow.show()
    }
  }
  openToolsWindow = () => {
    if (this.toolsWindow === null) {
      let toolsWindow = this.createWindow('subTools', scenes.toolsScreen)
      toolsWindow.loadURL(path.join(__dirname, 'views/sub/tools.html'))
      toolsWindow.setMenu(null)
      toolsWindow
        .on('ready-to-show', () => {
          this.toolsWindow = toolsWindow
          if (this.expandedWindow != null) {
            this.expandedWindow.close()
            this.expandedWindow = null
          }
          toolsWindow.show()
        })
        .on('closed', () => {
          this.toolsWindow = null
        })
    }
  }
  getCurrentWindow = () => {
    return BrowserWindow.getFocusedWindow()
  }
  getAllWindows() {
    // we may use more customized queries later, so dont call the BrowserWindow's object directly if it isn't necessary
    return BrowserWindow.getAllWindows()
  }

  createWindow = (name, options) => {
    let win = null
    let windowOptions = {
      frame: options.frame ?? false,
      transparent: options.transparent ?? false,
      useContentSize: options.useContentSize ?? false,
      skipTaskbar: options.skipTaskbar ?? true,
      resizable: options.resizable ?? false,
      show: options.show ?? false,
      center: options.center ?? null,
      fullscreen: options.fullscreen ?? null,
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
    win.setSkipTaskbar(options.skipTaskbar ?? false)
    if (options.devTools && isDev()) {
      win.webContents.openDevTools({ mode: 'undocked' })
    }
    return win
  }
}
