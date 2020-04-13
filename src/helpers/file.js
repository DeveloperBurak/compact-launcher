const fs = require('fs');
import {parse} from "@node-steam/vdf";

export const readVdf = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          reject(file + ' does not exist');
          return;
        }
        reject(err);
      }
      let fileContent = data.toString('utf8');
      resolve(parse(fileContent));
    });
  })
};

export const fileExists = (file) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(file)) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
};
