import {fileExists} from "../helpers/file";
import File from "./File";

const fs = require('fs');
const path = require('path');
const activeWin = require('active-win');

class ActiveWindowTracker {

  constructor() {
    this.forbiddenApps = [];
    this.activeProgram = null;
    this.forbiddenProgramsFile = path.join(File.get('userdata'), 'forbidden-programs.json');
    this.tracking = null;
    fileExists(this.forbiddenProgramsFile).then(result => {
      if (!result) {
        this.forbiddenApps = ["chrome.exe", "steam.exe"];
        fs.writeFileSync(this.forbiddenProgramsFile, JSON.stringify(this.forbiddenApps));
      } else {
        fs.readFile(this.forbiddenProgramsFile, (err, data) => {
          this.forbiddenApps = JSON.parse(data.toString('utf8'));
        });
      }
    });
  }

  start(callback, interval = 1000) {
    this.tracking = setInterval(() => {
      activeWin().then(response => {
        if (response != null) {
          if (this.forbiddenApps.indexOf(response.owner.name) >= 0) {
            callback(true);
          } else {
            callback(false);
          }
          if ((response.owner.name !== "Compact Launcher.exe" && response.owner.name !== 'electron.exe' && response.owner.name !== 'Compact Launcher') && this.activeProgram !== response.owner.name) {
            this.activeProgram = response.owner.name;
            console.log(this.activeProgram)
          }
        }

      })
    }, interval);
  }

  stop() {
    if (this.tracking != null) clearInterval(this.tracking);
  }

  addProgram() {
    fs.readFile(this.forbiddenProgramsFile, (err, data) => {
      this.forbiddenApps = JSON.parse(data.toString('utf8'));
      if (this.forbiddenApps.indexOf(this.activeProgram) === -1) {
        this.forbiddenApps.push(this.activeProgram);
        fs.writeFileSync(this.forbiddenProgramsFile, JSON.stringify(this.forbiddenApps));
      }
    });
  }

  removeProgram() {
    fs.readFile(this.forbiddenProgramsFile, (err, data) => {
      this.forbiddenApps = JSON.parse(data.toString('utf8'));
      if (this.forbiddenApps.indexOf(this.activeProgram) !== -1) {
        this.forbiddenApps.splice(this.forbiddenApps.indexOf(this.activeProgram), 1);
        fs.writeFileSync(this.forbiddenProgramsFile, JSON.stringify(this.forbiddenApps));
      }
    });
  }

  listForbiddenProgramsFromFile() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.forbiddenProgramsFile, (err, data) => {
        resolve(JSON.parse(data.toString('utf8')));
      });
    });

  }
}


export default new ActiveWindowTracker();
