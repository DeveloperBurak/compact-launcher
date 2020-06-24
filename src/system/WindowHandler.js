import createWindow from "../helpers/window";
import scenes from "../configs/scenes.json";
import url from "url";
import path from "path";
import {getSteamUser, renderItem} from "../helpers/ipcActions";
import Steam from "./Steam";

// these connects windows each other.
let mainWindow = null;
let settingsWindow = null;
let expandedScene = null;
let toolsWindow = null;


export const openCollapsedWindow = () => {
  mainWindow = createWindow("collapsed", scenes.collapsedScreen);
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "views/collapsed.html"),
      protocol: "file:",
      slashes: true
    })
  );
  mainWindow.on('ready-to-show', () => {
    if (expandedScene != null) expandedScene.close();
    mainWindow.show();
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  return mainWindow;
};

export const openExpandedScene = (data) => {
  expandedScene = createWindow("expanded", scenes.expandedScreen);
  expandedScene.loadURL(
    url.format({
      pathname: path.join(__dirname, "views/expanded.html"),
      protocol: "file:",
      slashes: true
    })
  );

  expandedScene.on('ready-to-show', () => {
    expandedScene.show();
    expandedScene.webContents.send(renderItem, data);
    Steam.getUser().then(user => {
      if (user != null && user.account !== false) {
        expandedScene.webContents.send(getSteamUser, user);
      }
    }).catch(message => {
      console.log(message);
    });
    mainWindow.close();
  });
  expandedScene.on('closed', () => {
    if (settingsWindow != null) settingsWindow.close();
    if (toolsWindow != null) toolsWindow.close();
    expandedScene = null;
  })
  return expandedScene;
};

// TODO make a system about sub window.

export const openSettingsWindow = () => {
  if (settingsWindow === null) {
    settingsWindow = createWindow("subSettings", scenes.settingsScreen);
    settingsWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "views/sub/settings.html"),
        protocol: "file:",
        slashes: true
      })
    );
    settingsWindow.setMenu(null);
    settingsWindow.on('ready-to-show', () => {
      expandedScene.hide();
      settingsWindow.show();
    });
    settingsWindow.on('closed', () => {
      expandedScene.show();
      settingsWindow = null;
    });
    // settingsWindow.openDevTools();
  }

  return settingsWindow;
};

export const openToolsWindow = () => {
  if (toolsWindow === null) {
    toolsWindow = createWindow("subTools", scenes.settingsScreen);
    toolsWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "views/sub/tools.html"),
        protocol: "file:",
        slashes: true
      })
    );
    toolsWindow.setMenu(null);
    toolsWindow.on('ready-to-show', () => {
      expandedScene.hide();
      toolsWindow.show();
    });
    toolsWindow.on('closed', () => {
      expandedScene.show();
      toolsWindow = null;
    });
    toolsWindow.openDevTools();
  }

  return toolsWindow;
};
