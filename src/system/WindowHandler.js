import createWindow from "../helpers/window";
import scenes from "../configs/scenes.json";
import url from "url";
import path from "path";
import {getSteamUser, ipcSetAlwaysOnTop, ipcTimerStarted, renderItem} from "../helpers/ipcActions";
import Steam from "./Steam";
import {ipcMain} from "electron";
import {BrowserWindow} from "electron";

// these connects windows each other.
let mainWindow = null;
let settingsWindow = null;
let expandedWindow = null;
let toolsWindow = null;

let timeLimit = 0; // shut or sleep system timer

export const openCollapsedWindow = () => {
  mainWindow = createWindow("collapsed", scenes.collapsedScreen);
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "views/collapsed.html"),
      protocol: "file:",
      slashes: true,
    })
  );
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    if (expandedWindow != null) expandedWindow.close();
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  return mainWindow;
};

export const openExpandedScene = (data) => {
  expandedWindow = createWindow("expanded", scenes.expandedScreen);
  expandedWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "views/expanded.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  expandedWindow.on("ready-to-show", () => {
    expandedWindow.show();
    expandedWindow.webContents.send(renderItem, data);
    Steam.getUser().then((user) => {
      if (user != null && user.account !== false) {
        expandedWindow.webContents.send(getSteamUser, user);
      }
    }).catch((message) => {
      console.log(message);
    });
    mainWindow.close();
  });
  expandedWindow.on("closed", () => {
    expandedWindow = null;
    if (mainWindow != null && settingsWindow == null && toolsWindow == null) {
      mainWindow.show();
    }
  });
  return expandedWindow;
};

// TODO make a system about sub window.

export const openSettingsWindow = () => {
  if (settingsWindow == null) {
    // scenes.settingsScreen.parent = mainWindow ?? expandedWindow;
    settingsWindow = createWindow("subSettings", scenes.settingsScreen);
    settingsWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "views/sub/settings.html"),
        protocol: "file:",
        slashes: true,
      })
    );
    settingsWindow.setMenu(null);
    settingsWindow.on("ready-to-show", () => {
      settingsWindow.show();
    }).on("closed", () => {
      settingsWindow = null;
    });
  }
  return settingsWindow;
};

export const openToolsWindow = () => {
  if (toolsWindow === null) {
    toolsWindow = createWindow("subTools", scenes.toolsScreen);
    toolsWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "views/sub/tools.html"),
        protocol: "file:",
        slashes: true,
      })
    );
    toolsWindow.setMenu(null);
    toolsWindow.on("ready-to-show", () => {
      toolsWindow.show();
    }).on("closed", () => {
      toolsWindow = null;
    });
    // toolsWindow.openDevTools();
  }
  return toolsWindow;
};

ipcMain.on(ipcSetAlwaysOnTop, (err, enabled) => { // disable the always on top all windows
  if (mainWindow != null)
    mainWindow.setAlwaysOnTop(enabled);
  if (expandedWindow != null)
    expandedWindow.setAlwaysOnTop(enabled);
  if (toolsWindow != null)
    toolsWindow.setAlwaysOnTop(enabled);
  if (settingsWindow != null)
    settingsWindow.setAlwaysOnTop(enabled);
});

ipcMain.on(ipcTimerStarted, (err, time) => {
  timeLimit = time;
});

