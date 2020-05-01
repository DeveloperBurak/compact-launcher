import {mkdirIfNotExists} from "./folder";
import File from '../system/File';
import {fileExists} from "./file";


const forbiddenProgramsFile = File.get('userdata') + '/' + 'forbidden-programs.json';
let monitor = require('active-window');

export const startActiveWindowTracker = (repeats = -1, interval = 10) => {
  fileExists(forbiddenProgramsFile).then(result => {
    if (!result) {

    }
  });
  monitor.getActiveWindow(function (window) {
    try {
      console.log(window.app);
    } catch (err) {
      console.log(err);
    }
  }, repeats, interval);
};

export const addProgram = (program) => {
  monitor.getActiveWindow(function (window) {
    try {
      console.log(window.app);
    } catch (err) {
      console.log(err);
    }
  });
};
