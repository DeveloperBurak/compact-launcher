import { ipcMain } from 'electron';
import { devLog } from '../helpers/console';
import { removeFile } from '../helpers/file';
import { toURL } from '../helpers/url';
import * as ipc from '../strings/ipc';
import { cacheProgramHTML } from '../strings/store';
import { moveToOurDocument, renameProgram } from '../system/FileManager';
import { addNewImage } from '../system/Program';
import { setAutoLaunch, cancelShutDown } from '../system/System';
import { preferenceManager, programImageManager, storeManager, userManager, foregroundProgramTracker, timer } from '../ioc';

ipcMain.on(ipc.systemLog, (_err, value) => devLog(value));
ipcMain.handle(ipc.fetchImageFromServer, async (_err, payload) => programImageManager.fetchImage(toURL(payload.programName)));
ipcMain.on(ipc.addImageFromProgram, (_err, items) => addNewImage({ source: items.file.filePaths[0], name: items.name }));
ipcMain.on(ipc.getUserAnswer, (_err, response) => userManager.setSteamUser(response));
ipcMain.on(ipc.disableShutdown, () => cancelShutDown());
ipcMain.on(ipc.timerStarted, (_err, data) => timer.startTimer(data.time, data.action));
ipcMain.on(ipc.timerStopped, () => timer.clearTime());
ipcMain.on(ipc.setAutoLaunch, (_err, enabled) => setAutoLaunch(enabled));
ipcMain.on(ipc.setSetting, (_err, payload) => preferenceManager.set(payload.key, payload.value));
ipcMain.handle(ipc.renameProgram, async (_err, payload) => renameProgram(payload));

ipcMain.on(ipc.removeProgram, async (_err, path) => {
  try {
    const deleted = await removeFile(path);
    if (deleted) {
      storeManager.delete(cacheProgramHTML);
    }
  } catch (delErr) {
    devLog(delErr);
  }
});

ipcMain.on(ipc.removeImageFromProgram, async (_err, imagePath) => {
  try {
    const deleted = await removeFile(imagePath);
    if (deleted) {
      storeManager.delete(cacheProgramHTML);
    }
  } catch (delErr) {
    devLog(delErr);
  }
});

ipcMain.on(ipc.timerSetTime, (_err, data) => {
  timer.clearTime();
  timer.startTimer(data.timeLeft, data.action);
});

ipcMain.on(ipc.setAlwaysOnTop, (_err, enabled) => {
  if (enabled) {
    return foregroundProgramTracker.start();
  }
  return foregroundProgramTracker.stop();
});

ipcMain.on(ipc.moveFile, (_err, files) => {
  for (const file of files) {
    moveToOurDocument(file, storeManager);
  }
});

ipcMain.handle(ipc.selectImageServer, async (_err, payload) => {
  const response = await programImageManager.selectProgram(payload.docId, payload.programName);
  if (response.statusCode === 200) {
    return response.filePath;
  }
  return null;
});

ipcMain.on(ipc.disconnectUser, (_err, data) => {
  switch (data.platform) {
    case 'steam':
      return userManager.disconnectSteamUser();
    default:
      throw new Error('Invalid Platform');
  }
});
