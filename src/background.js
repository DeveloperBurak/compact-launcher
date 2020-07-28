import { app, ipcMain } from "electron";
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
  ipcSetAlwaysOnTop,
  ipcTimerStarted,
  ipcTimerStopped,
  ipcTimerRequestTime,
  ipcTimerRemainingTime,
  ipcTimerSetTime,
  ipcDisableShutdown,
  ipcNotificationReceived,
} from "./helpers/ipcActions";
import { removeFile } from "./helpers/file";
import { cacheProgramHTML } from "./configs/app";
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
  setSetting,
  stopProgramTracking,
  cancelShutDown,
} from "./system/System";
import { settingAlwaysOnTop } from "./helpers/settingKeys";

const store = new Store();

if (process.platform === "linux") {
  app.commandLine.appendSwitch("enable-transparent-visuals");
  app.commandLine.appendSwitch("disable-gpu");
}
// windows

let appWindows = {
  mainWindow: null,
  expandedScene: null,
  settingsWindow: null,
  toolsWindow: null,
};

let tray;

const version = Number.parseFloat(app.getVersion());
if (version !== store.get("app.version") || version < 0.4) {
  store.delete(cacheProgramHTML);
}

app.on("ready", () => {
  appWindows.mainWindow = openCollapsedWindow();
  // appWindows.toolsWindow = openToolsWindow();
  File.createRequiredFolders();

  try {
    // it may throw exception on linux
    tray = setTray();
  } catch (e) {
    console.log(e);
  }

  getSetting(settingAlwaysOnTop)
    .then((value) => {
      if (value == null) {
        setSetting(settingAlwaysOnTop, true); // default is true
      }
      if (value == null || value) {
        startProgramTracking();
      }
    })
    .catch((error) => {
      console.log(error);
    });
});
app.on("window-all-closed", () => {
  appWindows.mainWindow = openCollapsedWindow();
});

ipcMain.on(scanPrograms, async () => {
  const cacheHTML = store.get(cacheProgramHTML);
  cacheHTML != null
    ? appWindows.mainWindow.webContents.send(itemsReady, { cache: cacheHTML })
    : await ProgramHandler.readShortcutFolder().then((items) => {
        if (appWindows.mainWindow !== null)
          appWindows.mainWindow.webContents.send(itemsReady, items);
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
  appWindows.expandedScene = openExpandedScene(data);
});

ipcMain.on(closeExpandWindow, async () => {
  appWindows.mainWindow = openCollapsedWindow();
});

ipcMain.on(launchProgram, (err, file) => {
  ProgramHandler.launch(file);
  appWindows.expandedScene.webContents.send(closeExpandWindow);
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
    appWindows.expandedScene.webContents.send(
      isSteamUserExists,
      steamPath !== null
    );
  });
});

ipcMain.on(openSettingWindow, () => {
  appWindows.settingsWindow = openSettingsWindow();
});

ipcMain.on(ipcOpenToolsWindow, () => {
  appWindows.toolsWindow = openToolsWindow();
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
  getSetting(name)
    .then((value) => {
      appWindows.settingsWindow.webContents.send(ipcGetSettingReady, value);
    })
    .catch((error) => {
      console.log(error);
    });
});

let notificationSent = false;

ipcMain.on(ipcTimerStarted, (err, data) => {
  OSTimer.startTimer(data.time, data.action);
  notificationSent = false;
});

OSTimer.on("time-near", (time) => {
  if (!notificationSent) {
    const notification = OSTimer.getNotification();
    Object.keys(appWindows).forEach((key) => {
      let window = appWindows[key];
      if (window != null && !window.isDestroyed())
        window.webContents.send(ipcNotificationReceived, notification);
    });
  }
  notificationSent = true;
});

ipcMain.on(ipcTimerSetTime, (err, data) => {
  OSTimer.clearTime();
  OSTimer.startTimer(data.timeLeft, data.action);
  notificationSent = false;
});

ipcMain.on(ipcTimerStopped, () => {
  OSTimer.clearTime();
});

ipcMain.on(ipcTimerRequestTime, () => {
  appWindows.toolsWindow.webContents.send(
    ipcTimerRemainingTime,
    OSTimer.getRemainingTime()
  );
});

ipcMain.on(ipcDisableShutdown, () => {
  cancelShutDown();
});

export const settingWindow = () => {
  // it required for tray
  appWindows.settingsWindow = openSettingsWindow();
};
