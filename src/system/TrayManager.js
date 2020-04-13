import path from 'path';
import { app, Menu, Tray } from 'electron';
import { APP_NAME } from '../configs/app.json';

export default class TrayManager {
  constructor({ foregroundProgramTracker, windowHandler }) {
    this.foregroundProgramTracker = foregroundProgramTracker;
    this.windowHandler = windowHandler;
  }

  generateMenu = () => {
    const menu = [];

    let blacklist;
    if (this.foregroundProgramTracker.isInBlacklist(this.foregroundProgramTracker.activeProgram)) {
      blacklist = {
        label: `Remove From Blacklist${
          this.foregroundProgramTracker && this.foregroundProgramTracker.activeProgram ? ` (${this.foregroundProgramTracker.activeProgram})` : ''
        }`,
        click: () => {
          this.foregroundProgramTracker.removeFromBlacklist();
        },
      };
    } else {
      blacklist = {
        label: `Add to Blacklist${
          this.foregroundProgramTracker && this.foregroundProgramTracker.activeProgram ? ` (${this.foregroundProgramTracker.activeProgram})` : ''
        }`,
        click: () => {
          this.foregroundProgramTracker.addToBlacklist();
        },
      };
    }
    menu.push(blacklist);

    const settings = {
      label: 'Settings',
      click: () => {
        this.windowHandler.openSettingsWindow();
      },
    };
    menu.push(settings);

    const exit = {
      label: 'Exit',
      click: () => {
        app.quit();
      },
    };
    menu.push(exit);

    return menu;
  };

  setTray = () => {
    const fileExtension = process.platform === 'linux' ? 'png' : 'ico';
    const tray = new Tray(path.join(__dirname, 'assets', 'images', 'core', `tray.${fileExtension}`));
    tray.setToolTip(APP_NAME);

    tray.on('click', () => {
      tray.popUpContextMenu();
    });

    this.foregroundProgramTracker.on('forceUpdateTrayMenu', () => {
      tray.setContextMenu(Menu.buildFromTemplate(this.generateMenu()));
    });
    return tray;
  };
}
