import path from 'path';
import { app, Menu, Tray } from 'electron';
import APP_CONFIG from '../configs/app';

export default class TrayManager {
  constructor({ foregroundProgramTracker, windowHandler, eventEmitter }) {
    this.foregroundProgramTracker = foregroundProgramTracker;
    this.windowHandler = windowHandler;
    this.eventEmitter = eventEmitter;
  }

  generateMenu = () => {
    const menu = [];

    for (const program of this.foregroundProgramTracker.lastActivePrograms) {
      const blacklist = {};

      if (this.foregroundProgramTracker.isInBlacklist(program)) {
        blacklist.label = `Remove From Blacklist (${program})`;
        blacklist.click = () => this.foregroundProgramTracker.removeFromBlacklist(program);
      } else {
        blacklist.label = `Add to Blacklist (${program})`;
        blacklist.click = () => this.foregroundProgramTracker.addToBlacklist(program);
      }

      menu.push(blacklist);
    }

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
    tray.setToolTip(APP_CONFIG.APP_NAME);

    tray.on('click', () => {
      tray.popUpContextMenu();
    });

    this.eventEmitter.on('forceUpdateTrayMenu', () => {
      tray.setContextMenu(Menu.buildFromTemplate(this.generateMenu()));
    });
    return tray;
  };
}
