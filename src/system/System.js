import { exec } from 'child_process';
import { app } from 'electron';
import AutoLaunch from 'auto-launch';
import { devLog } from '../helpers/console';

/**
 * supported os: windows, linux
 */

export const setAutoLaunch = async (enabled = true) => {
  const autoLaunch = new AutoLaunch({
    name: app.getName().replace(' ', '-').toLowerCase(),
    path: process.execPath,
    isHidden: true,
  });

  const isCurrentEnabled = await autoLaunch.isEnabled();
  if (enabled && !isCurrentEnabled) {
    autoLaunch.enable();
  } else if (!enabled && isCurrentEnabled) {
    autoLaunch.disable();
  }
};

export const shutdownPC = () => {
  switch (process.platform) {
    case 'win32':
      exec('shutdown -s -f');
      break;
    case 'linux':
      exec('shutdown', (message) => {
        devLog(message);
      });
      break;
    default:
      throw new Error('Invalid OS');
  }
};

export const cancelShutDown = () => {
  switch (process.platform) {
    case 'win32':
      exec('shutdown -a');
      break;
    case 'linux':
      exec('shutdown -c');
      break;
    default:
      throw new Error('Invalid OS');
  }
};

export const sleepPC = () => {
  switch (process.platform) {
    case 'win32':
      exec('rundll32.exe powrprof.dll,SetSuspendState 0,1,0');
      break;
    case 'linux':
      exec('systemctl suspend');
      break;
    default:
      throw new Error('Invalid OS');
  }
};

export const lockPC = () => {
  switch (process.platform) {
    case 'win32':
      exec('rundll32.exe user32.dll,LockWorkStation');
      break;
    case 'linux':
      exec('gnome-screensaver-command --lock');
      break;
    default:
      throw new Error('Invalid OS');
  }
};
