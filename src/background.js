import path from "path";
import url from "url";
import {app, ipcMain, Menu, Tray} from "electron";
import createWindow from "./helpers/window";
import scenes from "./configs/scenes";
import env from "env";
import ProgramHandler from "./system/ProgramHandler";
import Store from 'electron-store';
import {trayMenuTemplate} from './menu/tray_menu_template';
import User from './system/User';
import File from "./system/File";
import Steam from "./system/Steam";
import {BrowserWindow} from "electron";

import {
  cacheScannedPrograms,
  closeExpandWindow,
  expandWindow,
  getSteamUser,
  getUserAnswer,
  isSteamExists,
  isSteamUserExists,
  itemsReady,
  launchProgram, removeProgram,
  removeProgramCache,
  renderItem,
  scanPrograms
} from "./helpers/ipcActions";
import ActiveWindowTracker from "./system/ActiveWindowTracker";
import {removeFile} from "./helpers/file";

const AutoLaunch = require('auto-launch');
const store = new Store();

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('enable-transparent-visuals');
  app.commandLine.appendSwitch('disable-gpu');
}

// windows
let mainWindow = null;
let expandedScene = null;

let tray = null;

app.on("ready", () => {
  openCollapsedWindow();
  File.createRequiredFolders();
  setAutoLaunch();
  setTray();
  ActiveWindowTracker.start((isForbidden) => {
    BrowserWindow.getAllWindows().filter(window => {
      window.setAlwaysOnTop(!isForbidden);
    })
  });
});


ipcMain.on(scanPrograms, async () => {
  const cacheHTML = store.get('cache.programs');
  if (cacheHTML != null) {
    mainWindow.webContents.send(itemsReady, {cache: cacheHTML});
  } else {
    await ProgramHandler.readShortcutFolder().then(items => {
      mainWindow.webContents.send(itemsReady, items);
    });
  }
});

ipcMain.on(cacheScannedPrograms, (err, cache) => {
  store.set('cache.programs', cache.html);
});

ipcMain.on(removeProgramCache, () => {
  store.delete('cache.programs');
});

ipcMain.on(expandWindow, (err, data) => {
  openExpandedScene(data);
});

ipcMain.on(closeExpandWindow, async () => {
  await openCollapsedWindow();
  expandedScene.close();
});

ipcMain.on(launchProgram, (err, file) => {
  ProgramHandler.launch(file);
  expandedScene.webContents.send(closeExpandWindow);
});

ipcMain.on(removeProgram, (err, path) => {
  removeFile(path).then(deleted => {
    if(deleted){
      console.log('silindi')
      store.delete('cache.programs');
    }
  })
});

ipcMain.on(getUserAnswer, (err, response) => {
  Steam.setUser(response);
});

ipcMain.on(isSteamExists, () => {
  User.getSteamUser().then(steamPath => {
    expandedScene.webContents.send(isSteamUserExists, (steamPath !== null));
  });
});

const openCollapsedWindow = () => {
  mainWindow = createWindow("collapsed", scenes.collapsedScreen);
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "collapsed.html"),
      protocol: "file:",
      slashes: true
    })
  );
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });
  if (env.name === "development") {
    // mainWindow.openDevTools();
  }
};


const openExpandedScene = (data) => {
  expandedScene = createWindow("expanded", scenes.expandedScreen);
  expandedScene.loadURL(
    url.format({
      pathname: path.join(__dirname, "expanded.html"),
      protocol: "file:",
      slashes: true
    })
  );
  if (env.name === "development") {
    expandedScene.openDevTools();
  }

  expandedScene.on('ready-to-show', () => {
    expandedScene.show();
    expandedScene.webContents.send(renderItem, data);
    Steam.getUser().then(user => {
      if (user.account !== false) {
        expandedScene.webContents.send(getSteamUser, user);
      }
    });
    mainWindow.close();
  });
};

const setTray = () => {
  tray = new Tray(path.join(__dirname, 'assets/images/core/tray.ico'));
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  tray.setToolTip('Compact Launcher');
  tray.setContextMenu(contextMenu);
};

const setAutoLaunch = (enabled = true) => {
  let autoLaunch = new AutoLaunch({
    name: 'Compact Launcher',
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
