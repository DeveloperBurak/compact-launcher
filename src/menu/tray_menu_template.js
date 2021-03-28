import { app } from 'electron'
import { ForegroundProgramTrackerObj, WindowHandlerObj } from '../background'
export const trayMenuTemplate = [
  {
    label: 'Foreground Program',
    submenu: [
      {
        label: 'Add to Blacklist',
        click: () => {
          ForegroundProgramTrackerObj.addToBlacklist()
        },
      },
      {
        label: 'Remove From Blacklist',
        click: () => {
          ForegroundProgramTrackerObj.removeFromBlacklist()
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
