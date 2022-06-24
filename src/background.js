import { app } from 'electron';
import { version, productName } from '../package.json';
import { errorDevLog } from './helpers/console';
import { isLinux, isWindows } from './helpers/os';
import './ipc/systemHandler';
import './ipc/windowHandler';
import * as setting from './strings/settings';
import { appVersion } from './strings/store';
import { createRequiredFolders } from './system/FileManager';
import { windowHandler, userManager, trayManager, preferenceManager, foregroundProgramTracker, storeManager, notificationHandler } from './ioc';

if (isLinux() || isWindows()) {
  app.commandLine.appendSwitch('enable-transparent-visuals'); // fix the tranparent issue
  app.commandLine.appendSwitch('disable-gpu'); // fix the tranparent issue
}

if (isWindows()) {
  // notification signing
  app.setAppUserModelId(productName);
}

app.disableHardwareAcceleration();

app.on('ready', async () => {
  await createRequiredFolders();

  try {
    await preferenceManager.init();
    foregroundProgramTracker.init();
    notificationHandler.init();
  } catch (err) {
    errorDevLog(err);
  }

  if (userManager.isFirst) {
    windowHandler.openWelcomeWindow();
  } else {
    windowHandler.openCollapsedWindow();
  }

  trayManager.setTray();

  if (storeManager.get(appVersion) == null) {
    storeManager.set(appVersion, version);
  }

  if (preferenceManager.get(setting.alwaysOnTop)) {
    foregroundProgramTracker.start();
  }
});

app.on('window-all-closed', () => windowHandler.openCollapsedWindow());
