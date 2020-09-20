import {
  app
} from "electron";

import File from "./system/File";
import * as windows from "./system/WindowHandler";
import {
  setTray,
  startProgramTracking,
  getSetting,
  setSetting,
} from "./system/System";
import * as setting from "./helpers/settingKeys";
import "./main/ipcSystemHandler";
import "./main/ipcWindowHandler";

if (process.platform === "linux") {
  app.commandLine.appendSwitch("enable-transparent-visuals");
  app.commandLine.appendSwitch("disable-gpu");
}
// windows
let tray;


app.on("ready", () => {
  windows.appWindows.mainWindow = windows.openCollapsedWindow();
  // appWindows.toolsWindow = openToolsWindow();
  // appWindows.settingsWindow = openSettingsWindow();
  File.createRequiredFolders();

  try {
    // it may throw exception on linux
    tray = setTray();
  } catch (e) {
    console.log(e);
  }

  getSetting(setting.alwaysOnTop)
    .then((value) => {
      if (value == null) {
        setSetting(setting.alwaysOnTop, true); // default is true
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
  windows.appWindows.mainWindow = windows.openCollapsedWindow();
});