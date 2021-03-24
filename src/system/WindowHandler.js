import path from 'path'
import url from 'url'
import scenes from '../configs/scenes.json'
import { getSteamUser } from '../helpers/ipcActions'
import createWindow from '../helpers/window'
import Steam from './Steam'
import { BrowserWindow } from 'electron'

export class WindowHandler {
  constructor() {
    this.collapsedWindow = null
    this.expandedWindow = null
    this.settingsWindow = null
    this.toolsWindow = null
  }
  openCollapsedWindow = () => {
    if (this.collapsedWindow == null) {
      let collapsedWindow = createWindow('collapsed', scenes.collapsedScreen)
      collapsedWindow.loadURL(
        url.format({
          pathname: path.join(__dirname, 'views/collapsed.html'),
          protocol: 'file:',
          slashes: true,
        }),
      )
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
      let expandedWindow = createWindow('expanded', scenes.expandedScreen)
      expandedWindow.loadURL(
        url.format({
          pathname: path.join(__dirname, 'views/expanded.html'),
          protocol: 'file:',
          slashes: true,
        }),
      )

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
        if (this.collapsedWindow != null) {
          this.collapsedWindow.close()
          this.collapsedWindow = null
        }
        expandedWindow.show()
      })
      expandedWindow.on('closed', () => {
        this.expandedWindow = null
      })
      this.expandedWindow = expandedWindow
    } else {
      expandedWindow.show()
    }
  }
  openSettingsWindow = () => {
    if (this.settingsWindow == null) {
      let settingsWindow = createWindow('subSettings', scenes.settingsScreen)
      settingsWindow.loadURL(
        url.format({
          pathname: path.join(__dirname, 'views/sub/settings.html'),
          protocol: 'file:',
          slashes: true,
        }),
      )
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
      let toolsWindow = createWindow('subTools', scenes.toolsScreen)
      toolsWindow.loadURL(
        url.format({
          pathname: path.join(__dirname, 'views/sub/tools.html'),
          protocol: 'file:',
          slashes: true,
        }),
      )
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
}
