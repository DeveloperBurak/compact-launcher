import activeWin from 'active-win';
import fs from 'fs/promises';
import path from 'path';
import { writeFile } from '../helpers/file';
import { isWindows } from '../helpers/os';
import { getPathOf } from './FileManager';
import WindowHandler from './WindowHandler';

export default class ForegroundProgramTracker {
  constructor({ eventEmitter }) {
    this.blackList = [];
    this.exludeForActivePrograms = ForegroundProgramTracker.excludeForActiveProgram();
    this.activeProgram = null;
    this.forbiddenProgramsFile = path.join(getPathOf('userdata'), 'forbidden-programs.json');
    this.trackingInterval = null;
    this.eventEmitter = eventEmitter;
  }

  init = async () => {
    let file;
    try {
      file = await fs.readFile(this.forbiddenProgramsFile);
      if (file) {
        this.blackList = JSON.parse(file.toString('utf8'));
      }
      this.start();
    } catch (err) {
      await writeFile(this.forbiddenProgramsFile, JSON.stringify(this.blackList), { flag: 'w' });
    }
  };

  static excludeForActiveProgram = () => {
    if (isWindows()) {
      return ['Compact Launcher', 'Electron'];
    }
    return [];
  };

  start = (interval = 2000) => {
    this.trackingInterval = setInterval(async () => {
      this.watch();
    }, interval);
  };

  stop = () => {
    if (this.trackingInterval != null) clearInterval(this.trackingInterval);
  };

  addToBlacklist = () => {
    if (this.blackList.indexOf(this.activeProgram) === -1) {
      this.blackList.push(this.activeProgram);
      fs.writeFile(this.forbiddenProgramsFile, JSON.stringify(this.blackList));
      this.setAlwaysOnTop();
      this.eventEmitter.emit('forceUpdateTrayMenu');
    }
  };

  removeFromBlacklist = () => {
    if (this.blackList.indexOf(this.activeProgram) !== -1) {
      this.blackList.splice(this.blackList.indexOf(this.activeProgram), 1);
      fs.writeFile(this.forbiddenProgramsFile, JSON.stringify(this.blackList));
      this.setAlwaysOnTop();
      this.eventEmitter.emit('forceUpdateTrayMenu');
    }
  };

  watch = async () => {
    const foregroundProgram = await activeWin();
    if (
      foregroundProgram &&
      !this.exludeForActivePrograms.includes(foregroundProgram.owner.name) &&
      this.activeProgram !== foregroundProgram.owner.name
    ) {
      this.activeProgram = foregroundProgram.owner.name;
      this.eventEmitter.emit('forceUpdateTrayMenu');
      this.setAlwaysOnTop();
    }
  };

  setAlwaysOnTop = (force) => {
    WindowHandler.getAllWindows().forEach((window) => {
      window.setAlwaysOnTop(force ?? this.blackList.indexOf(this.activeProgram) === -1, 'screen'); // apply this rule for all windows.
    });
  };

  isInBlacklist = (program) => this.blackList.indexOf(program) !== -1;

  addSpecificProgramToBlacklist = (app) => this.blackList.push(app);

  getActiveProgram = () => this.activeProgram;
}
