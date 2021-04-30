import { exec } from 'child_process'
import { app, Menu, Tray } from 'electron'
import path from 'path'
import { APP_NAME } from '../configs/app.json'
import { trayMenuTemplate } from '../menu/tray_menu_template'
import AutoLaunch from 'auto-launch'
import { devLog } from '../helpers/console'

export const setTray = () => {
  const fileExtension = process.platform === 'linux' ? 'png' : 'ico'
  let tray = new Tray(path.join(__dirname, 'assets/images/core/tray.' + fileExtension))

  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate)
  tray.setToolTip(APP_NAME)
  tray.setContextMenu(contextMenu)
  return tray
}

export const setAutoLaunch = (enabled = true) => {
  // auto launch the program on startup
  let autoLaunch = new AutoLaunch({
    name: app.getName().replace(' ', '-').toLowerCase(),
    path: process.execPath,
    isHidden: true,
  })

  autoLaunch.isEnabled().then((isEnabled) => {
    if (enabled) {
      autoLaunch.enable() // TODO it is not working properly on ubuntu snap
    } else {
      autoLaunch.disable()
    }
  })
}

export const shutdownPC = () => {
  switch (process.platform) {
    case 'win32':
      exec('shutdown -s -f')
      break
    case 'darwin':
      // TODO
      devLog('macos close')
      break
    case 'linux':
      exec('shutdown', (message) => {
        devLog(message)
      })
      break
    default:
      throw new Error('Invalid OS')
  }
}

export const cancelShutDown = () => {
  switch (process.platform) {
    case 'win32':
      exec('shutdown -a')
      break
    case 'darwin':
      // TODO
      devLog('macos close')
      break
    case 'linux':
      exec('shutdown -c')
      break
    default:
      throw new Error('Invalid OS')
  }
}

export const sleepPC = () => {
  switch (process.platform) {
    case 'win32':
      exec('rundll32.exe powrprof.dll,SetSuspendState 0,1,0') // TODO add a caution about your pc may go to hibernate mode
      break
    case 'darwin':
      // TODO
      devLog('macos sleep')
      break
    case 'linux':
      exec('systemctl suspend')
      break
    default:
      throw new Error('Invalid OS')
  }
}

export const lockPC = () => {
  switch (process.platform) {
    case 'win32':
      exec('rundll32.exe user32.dll,LockWorkStation')
      break
    case 'darwin':
      // TODO
      devLog('macos lock')
      break
    case 'linux':
      exec('gnome-screensaver-command --lock')
      break
    default:
      throw new Error('Invalid OS')
  }
}
