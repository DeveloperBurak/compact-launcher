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
});

ipcMain.on('system:scan:programs', async () => {
  const cacheHTML = store.get('cache.programs');
  if (cacheHTML != null) {
    mainWindow.webContents.send('items:ready', {cache: cacheHTML});
  } else {
    await ProgramHandler.readShortcutFolder().then(items => {
      mainWindow.webContents.send('items:ready', items);
    });
  }
});

ipcMain.on('cache:programs', (err, cache) => {
  store.set('cache.programs', cache.html);
});

ipcMain.on('window:expand', (err, data) => {
  openExpandedScene(data);
});

ipcMain.on('window:close:expanded', async () => {
  await openCollapsedWindow();
  expandedScene.close();
});

ipcMain.on('program:launch', (err, file) => {
  ProgramHandler.launch(file);
  expandedScene.webContents.send('window:close:expand');
});

ipcMain.on('stem:user:answer', (err, response) => {
  Steam.setUser(response);
});

ipcMain.on('steam:check:exists', (err, response) => {
  User.getSteamUser().then(steamPath => {
    expandedScene.webContents.send('steam:exists', (steamPath !== null));
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
    // expandedScene.openDevTools();
  }

  expandedScene.on('ready-to-show', () => {
    expandedScene.show();
    expandedScene.webContents.send('items:render', data);
    Steam.getUser().then(user => {
      if (user.account !== false) {
        expandedScene.webContents.send('steam:user:get', user);
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
