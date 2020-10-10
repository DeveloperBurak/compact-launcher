import createWindow from "../helpers/window";
import scenes from "../configs/scenes.json";
import url from "url";
import path from "path";
import {
  getSteamUser,
  renderItem
} from "../helpers/ipcActions";
import Steam from "./Steam";

// these connects windows each other.
export let appWindows = {
  mainWindow: null,
  expandedWindow: null,
  settingsWindow: null,
  toolsWindow: null,
};

export const openCollapsedWindow = () => {
  appWindows.mainWindow = createWindow("collapsed", scenes.collapsedScreen);
  appWindows.mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "views/collapsed.html"),
      protocol: "file:",
      slashes: true,
    })
  );
  appWindows.mainWindow.on("ready-to-show", () => {
    appWindows.mainWindow.show();
    //appWindows.mainWindow.openDevTools();
    if (appWindows.expandedWindow != null) appWindows.expandedWindow.close();
  });
  appWindows.mainWindow.on('closed', () => {
    appWindows.mainWindow = null;
  });
  return appWindows.mainWindow;
};

export const openExpandedScene = (data) => {
  appWindows.expandedWindow = createWindow("expanded", scenes.expandedScreen);
  appWindows.expandedWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "views/expanded.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  appWindows.expandedWindow.on("ready-to-show", () => {
    appWindows.expandedWindow.show();
    // appWindows.expandedWindow.openDevTools();
    appWindows.expandedWindow.webContents.send(renderItem, data);
    Steam.getUser().then((user) => {
      if (user != null && user.account !== false) {
        appWindows.expandedWindow.webContents.send(getSteamUser, user);
      }
    }).catch((message) => {
      console.log(message);
    });
    appWindows.mainWindow.close();
  });
  appWindows.expandedWindow.on("closed", () => {
    appWindows.expandedWindow = null;
    if (appWindows.mainWindow != null && appWindows.settingsWindow == null && appWindows.toolsWindow == null) {
      appWindows.mainWindow.show();
    }
  });
  return appWindows.expandedWindow;
};

// TODO make a system about sub window.

export const openSettingsWindow = () => {
  if (appWindows.settingsWindow == null) {
    // scenes.settingsScreen.parent = appWindows.mainWindow ?? appWindows.expandedWindow;
    appWindows.settingsWindow = createWindow("subSettings", scenes.settingsScreen);
    appWindows.settingsWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "views/sub/settings.html"),
        protocol: "file:",
        slashes: true,
      })
    );
    appWindows.settingsWindow.setMenu(null);
    appWindows.settingsWindow.on("ready-to-show", () => {
      appWindows.settingsWindow.show();
    }).on("closed", () => {
      appWindows.settingsWindow = null;
    });
    // appWindows.settingsWindow.openDevTools();
  }
  return appWindows.settingsWindow;
};

export const openToolsWindow = () => {
  if (appWindows.toolsWindow === null) {
    appWindows.toolsWindow = createWindow("subTools", scenes.toolsScreen);
    appWindows.toolsWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "views/sub/tools.html"),
        protocol: "file:",
        slashes: true,
      })
    );
    appWindows.toolsWindow.setMenu(null);
    appWindows.toolsWindow.on("ready-to-show", () => {
      appWindows.toolsWindow.show();
    }).on("closed", () => {
      appWindows.toolsWindow = null;
    });
    // appWindows.toolsWindow.openDevTools();
  }
  return appWindows.toolsWindow;
};