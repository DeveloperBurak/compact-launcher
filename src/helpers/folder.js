import Steam from "../system/Steam";

const promisify = require('util').promisify;
const path = require('path');
const fs = require('fs');
const readdirp = promisify(fs.readdir);
const statp = promisify(fs.stat);
let mkdirp = require('mkdirp');

export async function scan(directoryName, results = {}) {
  let files = await readdirp(directoryName);
  let i = 0;
  for (let file of files) {
    let fullPath = path.join(directoryName, file);
    let stat = await statp(fullPath);
    if (stat.isDirectory()) {
      results[file] = await scan(fullPath, results[file]);
      results[file]['folder'] = true;
    } else {
      const programName = path.parse(file).name; // hello
      const ext = path.parse(file).ext;  // .html
      results[i] = {name: programName, fullpath: fullPath, file: true, ext: ext};
      i++;
    }
  }
  return results;
}


export async function mkdirIfNotExists(folder) {
  return new Promise((resolve, reject) => {
    fs.exists(folder, (exists) => {
      if (!exists) {
        mkdirp(folder, {recursive: true});
        resolve(true);
      }else{
        resolve(true);
      }
    });
  });

}

