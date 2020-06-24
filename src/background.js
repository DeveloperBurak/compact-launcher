import {app, BrowserWindow, ipcMain} from "electron";
import ProgramHandler from "./system/ProgramHandler";
import Store from 'electron-store';
import User from './system/User';
import File from "./system/File";
import Steam from "./system/Steam";
import env from "env";
import {
  addImageFromProgram,
  cacheScannedPrograms,
  closeExpandWindow,
  expandWindow,
  getUserAnswer,
  isSteamExists,
  isSteamUserExists,
  itemsReady,
  launchProgram, openSettingWindow, openToolsWindow as ipcOpenToolsWindow,
  removeImageFromProgram,
  removeProgram,
  removeProgramCache,
  scanPrograms,
  systemLog
} from "./helpers/ipcActions";
import {removeFile} from "./helpers/file";
import {cacheProgramHTML} from "./configs/app";
import Program from "./system/Program";
import {openCollapsedWindow, openExpandedScene, openSettingsWindow,openToolsWindow} from "./system/WindowHandler";
import {setAutoLaunch, setTray, startProgramTracking} from "./system/System";

const store = new Store();

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('enable-transparent-visuals');
  app.commandLine.appendSwitch('disable-gpu');
}
// windows
let mainWindow = null;
let expandedScene = null;
let settingsWindow = null;
let toolsWindow = null;

let tray;

const version = Number.parseFloat(app.getVersion());
if (version !== store.get('app.version') || version < 0.4) {
  store.delete(cacheProgramHTML);
}

app.on("ready", () => {
  mainWindow = openCollapsedWindow();
  File.createRequiredFolders();
  if (env.name !== 'development') setAutoLaunch();
  try { // it may throw exception on linux
    tray = setTray();
  } catch (e) {
    console.log(e)
  }
  startProgramTracking();
});


ipcMain.on(scanPrograms, async () => {
  const cacheHTML = store.get(cacheProgramHTML);
  (cacheHTML != null) ?
    mainWindow.webContents.send(itemsReady, {cache: cacheHTML}) :
    await ProgramHandler.readShortcutFolder().then(items => {
      if(mainWindow !== null) mainWindow.webContents.send(itemsReady, items);
    });
});

ipcMain.on(cacheScannedPrograms, (err, cache) => {
  store.set('app.version', version); // TODO dont set this in there.
  store.set(cacheProgramHTML, cache.html);
});

ipcMain.on(systemLog, (err, value) => {
  console.log(value)
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
  removeFile(path).then(deleted => {
    if (deleted) {
      store.delete(cacheProgramHTML);
    }
  })
});

ipcMain.on(removeImageFromProgram, (err, imagePath) => {
  removeFile(imagePath).then(deleted => {
    if (deleted) {
      store.delete(cacheProgramHTML);
    }
  })
});

ipcMain.on(addImageFromProgram, (err, items) => {
  Program.addNewImage(items.file, items.name);
});

ipcMain.on(getUserAnswer, (err, response) => {
  Steam.setUser(response);
});

ipcMain.on(isSteamExists, () => {
  User.getSteamUser().then(steamPath => {
    expandedScene.webContents.send(isSteamUserExists, (steamPath !== null));
  });
});

ipcMain.on(openSettingWindow, () => {
  settingsWindow = openSettingsWindow();
})

ipcMain.on(ipcOpenToolsWindow, () => {
  toolsWindow = openToolsWindow();
})

