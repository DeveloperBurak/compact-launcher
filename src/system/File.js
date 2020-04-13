import path from "path";
import file from "../configs/file";

const {app} = require('electron');
import {mkdirIfNotExists} from '../helpers/folder';

class File {
  constructor() {
    this.folder = {};
    this.folder.root = path.join(app.getPath('documents'), file.root);
    this.folder.shortcuts = path.join(this.folder.root, file.shortcuts);
    this.folder.images = path.join(this.folder.root, file.images);
    this.folder.userdata = path.join(this.folder.root, file.userData);
  }

  createRequiredFolders() {
    const folders = Object.values(this.folder);
    for (let folder of folders) {
      mkdirIfNotExists(folder).then(result => {
        if (!result) {
          console.log(folder);
        }
      });
    }
  }

  get(key) {
    return this.folder[key];
  }
}

export default new File();
