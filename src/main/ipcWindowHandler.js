import {
  ipcMain
} from "electron";
import ProgramHandler from "../system/ProgramHandler";
import User from "../system/User";
import OSTimer from "../system/OSTimer";
import * as ipc from "../helpers/ipcActions";
import * as windows from "../system/WindowHandler";
import {
  getSetting
} from "../system/System";
import {
  cacheProgramHTML
} from "../configs/global_variables";
import "./ipcSystemHandler";


ipcMain.on(ipc.scanPrograms, async () => {
  const cacheHTML = exports.store.get(cacheProgramHTML);
  if (cacheHTML != null) {
    windows.appWindows.mainWindow.webContents.send(ipc.itemsReady, {
      cache: cacheHTML
    })
  } else {
    await ProgramHandler.readShortcutFolder().then((items) => {
      if (windows.appWindows.mainWindow !== null)
        windows.appWindows.mainWindow.webContents.send(ipc.itemsReady, items);
    })
  }
});

ipcMain.on(ipc.expandWindow, (err, data) => {
  windows.appWindows.expandedScene = windows.openExpandedScene(data);
});

ipcMain.on(ipc.closeExpandWindow, async () => {
  windows.appWindows.mainWindow = windows.openCollapsedWindow();
});

ipcMain.on(ipc.isSteamExists, () => {
  User.getSteamUser().then((steamPath) => {
    windows.appWindows.expandedScene.webContents.send(
      ipc.isSteamUserExists,
      steamPath !== null
    );
  });
});

ipcMain.on(ipc.openSettingWindow, () => {
  windows.appWindows.settingsWindow = windows.openSettingsWindow();
});

ipcMain.on(ipc.openToolsWindow, () => {
  windows.appWindows.toolsWindow = windows.openToolsWindow();
});


ipcMain.on(ipc.getSetting, (err, name) => {
  getSetting(name)
    .then((value) => {
      Object.keys(windows.appWindows).forEach((key) => {
        let window = windows.appWindows[key];
          if (window != null && !window.isDestroyed()) {
            window.webContents.send(ipc.getSettingReady, value);
          }
      });
     
    })
    .catch((error) => {
      console.log(error);
    });
});
ipcMain.on(ipc.timerRequestTime, () => {
  windows.appWindows.toolsWindow.webContents.send(
    ipc.timerRemainingTime,
    OSTimer.getRemainingTime()
  );
});
ipcMain.on(ipc.launchProgram, (err, file) => {
  ProgramHandler.launch(file);
  windows.appWindows.expandedScene.webContents.send(ipc.closeExpandWindow);
});

ipcMain.on(ipc.setAlwaysOnTop, (err, enabled) => { // disable the always on top all windows
  if (windows.appWindows.mainWindow != null)
    windows.appWindows.mainWindow.setAlwaysOnTop(enabled);
  if (windows.appWindows.expandedWindow != null)
    windows.appWindows.expandedWindow.setAlwaysOnTop(enabled);
});


OSTimer.on("time-near", (time) => {
  const notification = OSTimer.getNotification();
  sendNotification(notification);
});

const sendNotification = (notification) => {
  let notificationSent = false;
  Object.keys(windows.appWindows).forEach((key) => {
    if (!notificationSent) {
      let window = windows.appWindows[key];
      if (window != null && !window.isDestroyed()) {
        window.webContents.send(ipc.notificationReceived, notification);
        notificationSent = true;
      }
    }
  });
}
