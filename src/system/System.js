import {app, BrowserWindow, Menu, Tray} from "electron";
import path from "path";
import {trayMenuTemplate} from "../menu/tray_menu_template";
import {programName} from "../configs/global_variables";
import ForegroundProgramTracker from "./ForegroundProgramTracker";
import * as setting from "../helpers/settingKeys";
import FileManager from "./FileManager";
import {fileExists} from "../helpers/file";
import execute from "../helpers/execute";

const fs = require("fs");
const AutoLaunch = require("auto-launch");

export const setTray = () => {
  const fileExtension = process.platform === "linux" ? "png" : "ico";
  let tray = new Tray(
    path.join(__dirname, "assets/images/core/tray." + fileExtension)
  );

  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  tray.setToolTip(programName);
  tray.setContextMenu(contextMenu);
  return tray;
};

export const setAutoLaunch = (enabled = true) => { // auto launch the program on startup
  let autoLaunch = new AutoLaunch({
    name: app.getName().replace(' ', '-').toLowerCase(),
    path: process.execPath,
    isHidden: true
  });

  autoLaunch.isEnabled().then((isEnabled) => {
    if (enabled) {
      autoLaunch.enable(); // TODO it is not working properly on ubuntu snap
    } else {
      autoLaunch.disable();
    }
  });
};

export const startProgramTracking = () => {
  ForegroundProgramTracker.start((isForbidden) => {
    BrowserWindow.getAllWindows().filter((window) => {
      window.setAlwaysOnTop(!isForbidden);
    });
  });
};

export const stopProgramTracking = () => {
  ForegroundProgramTracker.stop();
};

export const shutdownPC = () => {
  switch (process.platform) {
    case 'win32':
      execute("shutdown -s -f");
      break;
    case 'darwin':
      // TODO
      console.log("macos close")
      break;
    case 'linux':
      execute("shutdown", (message) => {
        console.log(message)
      });
      break;
    default:
      throw new Error("Invalid OS");
  }
}

export const cancelShutDown = () => {
  switch (process.platform) {
    case 'win32':
      execute("shutdown -a");
      break;
    case 'darwin':
      // TODO
      console.log("macos close")
      break;
    case 'linux':
      execute("shutdown -c");
      break;
    default:
      throw new Error("Invalid OS");
  }
}

export const sleepPC = () => {
  switch (process.platform) {
    case 'win32':
      execute("rundll32.exe powrprof.dll,SetSuspendState 0,1,0") // TODO add a caution about your pc may go to hibernate mode
      break;
    case 'darwin':
      // TODO
      console.log("macos sleep")
      break;
    case 'linux':
      execute("systemctl suspend");
      break;
    default:
      throw new Error("Invalid OS");
  }
}

export const lockPC = () => {
  switch (process.platform) {
    case 'win32':
      execute("rundll32.exe user32.dll,LockWorkStation")
      break;
    case 'darwin':
      // TODO
      console.log("macos lock")
      break;
    case 'linux':
      execute("gnome-screensaver-command --lock");
      break;
    default:
      throw new Error("Invalid OS");
  }
}
