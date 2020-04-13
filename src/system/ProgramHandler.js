import { exec } from 'child_process';
import { constants as fsConstants } from 'fs';
import { access, readFile } from 'fs/promises';
import { devLog, errorDevLog } from '../helpers/console';

export default class ProgramHandler {
  constructor() {
    this.pidsFromApp = []; // pid that started through this app, currently we use it for setting always on top
    this.listeningInterval = null;
  }

  launch = async (file) => {
    let command;
    switch (process.platform) {
      case 'win32':
        command = `start "" "${file}"`;
        break;
      case 'linux': {
        // check the file has execute permission
        const canAccess = await access(file.replace(/(\s+)/g, '$1'), fsConstants.X_OK);
        if (!canAccess) {
          throw new Error('cannot execute');
        }
        const data = await readFile(file.replace(/(\s+)/g, '$1'));
        let execString = data.toString();
        execString = execString.search('/\bExec=(.*)+');
        command = `gtk-launch ${execString}`;
        break;
      }
      default:
        throw new Error('OS not supported');
    }
    if (command != null) {
      devLog(command);
      const executed = exec(command, (error) => {
        if (error != null) {
          devLog(error);
        }
      });
      if (executed.pid !== 0) {
        this.pidsFromApp.push(executed.pid);
      }
      if (this.listeningInterval == null) this.startToListenExecutedProcesses();
    }
  };

  startToListenExecutedProcesses() {
    this.listeningInterval = setInterval(async () => {
      for (const pid of this.pidsFromApp) {
        if (ProgramHandler.pidIsRunning(pid)) {
          return;
        }
      }
      this.stopListenExecutedProcesses();
    }, this.pidsFromApp.length * 500); // let the 50ms for every proccess, this prevents the getting over cpu usage while number of executed commands increaces
  }

  stopListenExecutedProcesses() {
    devLog('closing interval');
    // if the method is not returned, this mean all proccesses closed
    if (this.listeningInterval != null) clearInterval(this.listeningInterval);
  }

  static pidIsRunning = (pid) => {
    try {
      process.kill(pid, 0);
      return true;
    } catch (e) {
      errorDevLog();
      return false;
    }
  };
}
