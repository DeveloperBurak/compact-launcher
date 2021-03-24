import { app } from 'electron'
import ForegroundProgramTracker from '../system/ForegroundProgramTracker'
import { WindowHandlerObj } from '../background'
export const trayMenuTemplate = [
  {
    label: 'Foreground Program',
    submenu: [
      {
        label: 'Add to Blacklist',
        click: () => {
          ForegroundProgramTracker.addProgram()
        },
      },
      {
        label: 'Remove From Blacklist',
        click: () => {
          ForegroundProgramTracker.removeProgram()
        },
      },
    ],
  },
  {
    label: 'Settings',
    click: () => {
      WindowHandlerObj.openSettingsWindow()
    },
  },
  {
    label: 'Exit',
    click: () => {
      app.quit()
    },
  },
]
