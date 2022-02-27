import { ipcMain } from 'electron';
import { preferenceManager, programHandler, storeManager, windowHandler, userManager, timer } from '../ioc';
import WindowHandler from '../system/WindowHandler';
import * as ipc from '../strings/ipc';
import ListUI from '../system/ListUI';

ipcMain.on(ipc.openExpandWindow, () => windowHandler.openExpandedWindow());
ipcMain.on(ipc.closeExpandWindow, () => windowHandler.openCollapsedWindow());
ipcMain.on(ipc.openSettingWindow, () => windowHandler.openSettingsWindow());
ipcMain.handle(ipc.getSetting, (err, name) => preferenceManager.get(name));
ipcMain.on(ipc.openToolsWindow, () => windowHandler.openToolsWindow());
ipcMain.handle(ipc.getAllSettings, async () => preferenceManager.getAll());
ipcMain.on(ipc.timerRequestTime, () => windowHandler.toolsWindow.webContents.send(ipc.timerRemainingTime, timer.getRemainingTime()));

ipcMain.on(ipc.openCollapsedWindow, (err, closeAll) => {
  if (closeAll) {
    WindowHandler.getAllWindows().forEach((window) => {
      window.close();
    });
  }
  windowHandler.openCollapsedWindow();
});

ipcMain.on(ipc.closeSettingWindow, () => {
  if (windowHandler.settingsWindow !== null) windowHandler.settingsWindow.close();
});

ipcMain.on(ipc.closeToolsWindow, () => {
  if (windowHandler.toolsWindow !== null) windowHandler.toolsWindow.close();
});

ipcMain.on(ipc.isSteamExists, async () => {
  const steamPath = await userManager.getSteamUser();
  windowHandler.expandedWindow.webContents.send(ipc.isSteamUserExists, steamPath !== null);
});

ipcMain.handle(ipc.getProgramsHTML, async (event, payload = {}) => {
  let html;
  if (payload.refreshCache == null || !payload.refreshCache) {
    html = await storeManager.getProgramListCache();
  }
  if (html == null) {
    html = await ListUI.getList('html');
    storeManager.setProgramListCache(html);
  }
  return html;
});

ipcMain.on(ipc.launchProgram, (err, file) => {
  programHandler.launch(file);
  windowHandler.expandedWindow.webContents.send(ipc.closeExpandWindow);
});

timer.on('osTimer-notify', () => {
  const notification = timer.getNotification();
  WindowHandler.getCurrentWindow().webContents.send(ipc.notificationReceived, notification);
});
