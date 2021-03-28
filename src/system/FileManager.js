import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { StoreManagerObj } from '../background'
import file from '../configs/file'
import { devLog } from '../helpers/console'
import { mkdirIfNotExists } from '../helpers/folder'
class FileManager {
  constructor() {
    this.folder = {}
    this.folder.root = path.join(app.getPath('documents'), file.root)
    this.folder.shortcuts = path.join(this.folder.root, file.shortcuts)
    this.folder.images = path.join(this.folder.root, file.images)
    this.folder.userdata = path.join(this.folder.root, file.userData)
  }

  createRequiredFolders = () => {
    const folders = Object.values(this.folder)
    for (let folder of folders) {
      mkdirIfNotExists(folder).then((result) => {
        if (!result) {
          console.log(folder)
        }
      })
    }
  }

  getPathOf = (key) => {
    return this.folder[key]
  }

  moveToShortcutsFolder = (filePath) => {
    const fileName = path.basename(filePath)
    fs.rename(filePath, path.join(this.folder.shortcuts, fileName), (err) => {
      if (err) {
        devLog(err)
      } else {
        StoreManagerObj.deleteProgramListCache()
      }
    })
  }
}

export default new FileManager()
