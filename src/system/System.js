import {app, BrowserWindow, Menu, Tray} from "electron";
import path from "path";
import {trayMenuTemplate} from "../menu/tray_menu_template";
import {programName} from "../configs/app";
import ActiveWindowTracker from "./ActiveWindowTracker";

const AutoLaunch = require('auto-launch');

export const setTray = () => {
  const fileExtension = (process.platform === 'linux') ? 'png' : 'ico';
  let tray = new Tray(path.join(__dirname, 'assets/images/core/tray.' + fileExtension)); // TODO dont set ico on linux

  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  tray.setToolTip(programName);
  tray.setContextMenu(contextMenu);
  return tray;
};

export const setAutoLaunch = (enabled = true) => {
  let autoLaunch = new AutoLaunch({
    name: programName,
    path: app.getPath('exe'),
  });

  autoLaunch.isEnabled().then((isEnabled) => {
    if (enabled) {
      if (!isEnabled) autoLaunch.enable();
    } else {
      autoLaunch.disable();
    }
  });
};

export const startProgramTracking = () => {
  ActiveWindowTracker.start((isForbidden) => {
    BrowserWindow.getAllWindows().filter(window => {
      window.setAlwaysOnTop(!isForbidden);
    })
  });
}
