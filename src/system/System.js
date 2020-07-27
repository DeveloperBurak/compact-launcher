import {app, BrowserWindow, Menu, Tray} from "electron";
import path from "path";
import {trayMenuTemplate} from "../menu/tray_menu_template";
import {programName} from "../configs/app";
import ActiveWindowTracker from "./ActiveWindowTracker";
import {settingAutoLaunch} from "../helpers/settingKeys";
import File from "./File";
import {fileExists} from "../helpers/file";
import execute from "../helpers/execute";

const fs = require("fs");
const AutoLaunch = require("auto-launch");

export const setTray = () => {
  const fileExtension = process.platform === "linux" ? "png" : "ico";
  let tray = new Tray(
    path.join(__dirname, "assets/images/core/tray." + fileExtension)
  ); // TODO dont set ico on linux

  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  tray.setToolTip(programName);
  tray.setContextMenu(contextMenu);
  return tray;
};

export const setAutoLaunch = (enabled = true) => {
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
  setSetting(settingAutoLaunch, enabled);
};

export const startProgramTracking = () => {
  ActiveWindowTracker.start((isForbidden) => {
    BrowserWindow.getAllWindows().filter((window) => {
      window.setAlwaysOnTop(!isForbidden);
    });
  });
};

export const stopProgramTracking = () => {
  ActiveWindowTracker.stop();
};


export const setSetting = (name, value) => {
  const settingPath = File.get("userdata") + "/settings.json";

  fileExists(settingPath).then((result) => {
    if (!result) {
      fs.writeFileSync(settingPath, {});
    }
    let settings = {};
    fs.readFile(settingPath, (err, data) => {
      settings = JSON.parse(data.toString("utf8"));
      settings[name] = value;
      fs.writeFileSync(settingPath, JSON.stringify(settings));
    });
  }).catch(error => {
    console.log(error)
  });
};

export const getSetting = (name) => {
  const settingPath = File.get("userdata") + "/settings.json";
  return new Promise((resolve, reject) => {
    fileExists(settingPath).then((result) => {
      if (!result) {
        fs.writeFileSync(settingPath, JSON.stringify({}));
        resolve(null);
      } else {
        fs.readFile(settingPath, async (err, data) => {
          let settings = await JSON.parse(data.toString("utf8"));
          if (name === null) {
            resolve(settings);
          } else {
            resolve(settings[name]);
          }
        });
      }
    }).catch(error => {
      reject(error)
    });
  });
};


export const shutdownPC = () => {
  switch (process.platform) {
    case 'win32':
      console.log("win close")
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
      console.log("win close")
      break;
    case 'darwin':
      // TODO
      console.log("macos close")
      break;
    case 'linux':
      execute("shutdown -c", (message) => {
        console.log(message)
      });
      break;
    default:
      throw new Error("Invalid OS");
  }
}

export const sleepPC = () => {
  switch (process.platform) {
    case 'win32':
      console.log("win sleep")
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
      console.log("win lock")
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
