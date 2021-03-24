import FileManager from "./FileManager";
import {fileExists, removeFile} from "../helpers/file";

const fs = require('fs');
const path = require('path');

class Program {

  addNewImage(source, name) {
    const image = path.join(FileManager.get('images'), name + '.jpg');
    fileExists(image).then(async exists => {
      if (exists) {
        await removeFile(image);
      }
      fs.copyFile(source, image, (err) => {
        if (err) throw err;
        console.log('image copied');
      });
    });

  }
}

export default new Program;
