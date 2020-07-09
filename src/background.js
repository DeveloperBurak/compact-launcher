import {app, ipcMain} from "electron";
import ProgramHandler from "./system/ProgramHandler";
import Store from "electron-store";
import User from "./system/User";
import File from "./system/File";
import Steam from "./system/Steam";
import OSTimer from "./system/OSTimer";
import {
  addImageFromProgram,
  cacheScannedPrograms,
  closeExpandWindow,
  expandWindow,
  getUserAnswer,
  isSteamExists,
  isSteamUserExists,
  itemsReady,
  launchProgram,
  openSettingWindow,
  openToolsWindow as ipcOpenToolsWindow,
  removeImageFromProgram,
  removeProgram,
  removeProgramCache,
  scanPrograms,
  systemLog,
  ipcSetAutoLaunch,
  ipcGetSetting,
  ipcGetSettingReady,
  ipcSetAlwaysOnTop, ipcTimerStarted, ipcTimerStopped, ipcTimerRequestTime, ipcTimerRemainingTime,
} from "./helpers/ipcActions";
import {removeFile} from "./helpers/file";
import {cacheProgramHTML} from "./configs/app";
import Program from "./system/Program";
import {
  openCollapsedWindow,
  openExpandedScene,
  openSettingsWindow,
  openToolsWindow,
} from "./system/WindowHandler";
import {
  setAutoLaunch,
  setTray,
  startProgramTracking,
  getSetting,
  setSetting, stopProgramTracking,
} from "./system/System";
import {settingAlwaysOnTop} from "./helpers/settingKeys";

const store = new Store();

if (process.platform === "linux") {
  app.commandLine.appendSwitch("enable-transparent-visuals");
  app.commandLine.appendSwitch("disable-gpu");
}
// windows
let mainWindow = null;
let expandedScene = null;
let settingsWindow = null;
let toolsWindow = null;

let tray;

const version = Number.parseFloat(app.getVersion());
if (version !== store.get("app.version") || version < 0.4) {
  store.delete(cacheProgramHTML);
}

app.on("ready", () => {
  mainWindow = openCollapsedWindow();
  File.createRequiredFolders();

  try {
    // it may throw exception on linux
    tray = setTray();
  } catch (e) {
    console.log(e);
  }
  getSetting(settingAlwaysOnTop).then((value) => {
    if (value == null) {
      setSetting(settingAlwaysOnTop, true); // default is true
    }
    if (value == null || value) {
      startProgramTracking();
    }
  }).catch(error => {
    console.log(error)
  });
});

ipcMain.on(scanPrograms, async () => {
  const cacheHTML = store.get(cacheProgramHTML);
  cacheHTML != null
    ? mainWindow.webContents.send(itemsReady, {cache: cacheHTML})
    : await ProgramHandler.readShortcutFolder().then((items) => {
      if (mainWindow !== null) mainWindow.webContents.send(itemsReady, items);
    });
});

ipcMain.on(cacheScannedPrograms, (err, cache) => {
  store.set("app.version", version); // TODO dont set this in there.
  store.set(cacheProgramHTML, cache.html);
});

ipcMain.on(systemLog, (err, value) => {
  console.log(value);
});

ipcMain.on(removeProgramCache, () => {
  store.delete(cacheProgramHTML);
});

ipcMain.on(expandWindow, (err, data) => {
  expandedScene = openExpandedScene(data);
});

ipcMain.on(closeExpandWindow, async () => {
  mainWindow = openCollapsedWindow();
});

ipcMain.on(launchProgram, (err, file) => {
  ProgramHandler.launch(file);
  expandedScene.webContents.send(closeExpandWindow);
});

ipcMain.on(removeProgram, (err, path) => {
  removeFile(path).then((deleted) => {
    if (deleted) {
      store.delete(cacheProgramHTML);
    }
  });
});

ipcMain.on(removeImageFromProgram, (err, imagePath) => {
  removeFile(imagePath).then((deleted) => {
    if (deleted) {
      store.delete(cacheProgramHTML);
    }
  });
});

ipcMain.on(addImageFromProgram, (err, items) => {
  Program.addNewImage(items.file, items.name);
});

ipcMain.on(getUserAnswer, (err, response) => {
  Steam.setUser(response);
});

ipcMain.on(isSteamExists, () => {
  User.getSteamUser().then((steamPath) => {
    expandedScene.webContents.send(isSteamUserExists, steamPath !== null);
  });
});

ipcMain.on(openSettingWindow, () => {
  settingsWindow = openSettingsWindow();
});

ipcMain.on(ipcOpenToolsWindow, () => {
  toolsWindow = openToolsWindow();
});

ipcMain.on(ipcSetAutoLaunch, (err, enabled) => {
  setAutoLaunch(enabled);
});

ipcMain.on(ipcSetAlwaysOnTop, (err, enabled) => {
  if (enabled) {
    startProgramTracking();
  } else {
    stopProgramTracking();
  }
  setSetting(settingAlwaysOnTop, enabled);
});

ipcMain.on(ipcGetSetting, (err, name) => {
  getSetting(name).then((value) => {
    settingsWindow.webContents.send(ipcGetSettingReady, value);
  }).catch(error => {
    console.log(error)
  });
});

ipcMain.on(ipcTimerStarted, (err, time) => {
  OSTimer.setRemainingTime(time);
});
ipcMain.on(ipcTimerStopped, () => {
  OSTimer.clearTime();
});

ipcMain.on(ipcTimerRequestTime, () => {
  toolsWindow.webContents.send(ipcTimerRemainingTime, OSTimer.getRemainingTime());
});


export const settingWindow = () => {
  settingsWindow = openSettingsWindow();
}


