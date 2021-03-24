import path from "path";
import file from "../configs/file";
import fs from "fs";
const { app } = require("electron");
import { mkdirIfNotExists } from "../helpers/folder";
import env from "env";
import { devLog } from "../helpers/console";
import StoreManager from "./StoreManager";
class FileManager {
  constructor() {
    this.folder = {};
    this.folder.root = path.join(app.getPath("documents"), file.root);
    this.folder.shortcuts = path.join(this.folder.root, file.shortcuts);
    this.folder.images = path.join(this.folder.root, file.images);
    this.folder.userdata = path.join(this.folder.root, file.userData);
  }

  createRequiredFolders() {
    const folders = Object.values(this.folder);
    for (let folder of folders) {
      mkdirIfNotExists(folder).then((result) => {
        if (!result) {
          console.log(folder);
        }
      });
    }
  }

  get(key) {
    return this.folder[key];
  }

  moveToShortcutsFolder(filePath) {
    const fileName = path.basename(filePath);
    try {
      fs.rename(filePath, path.join(this.folder.shortcuts, fileName), (err) => {
        if (err) {
          devLog(err);
        } else {
          StoreManager.deleteProgramListCache();
        }
      });
    } catch (e) {
      devLog(e);
      // TODO inform the user
    }
  }
}

export default new FileManager();
