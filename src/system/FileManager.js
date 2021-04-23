import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { StoreManagerObj } from '../background'
import file from '../configs/file'
import { devLog, errorLog } from '../helpers/console'
import { isProduction } from '../helpers/env'
import { isValidImageExt, isValidShortcutExt } from '../helpers/file'
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
      mkdirIfNotExists(folder).catch((error) => {
        if (isProduction()) {
          // TODO warn the user about error and exit the program
        } else {
          devLog(error)
        }
      })
    }
  }

  getPathOf = (key) => {
    return this.folder[key]
  }

  moveToOurDocument = (filePath) => {
    const fileName = path.basename(filePath)
    const ext = path.parse(filePath).ext // .html
    if (isValidImageExt(ext)) {
      fs.rename(filePath, path.join(this.folder.images, fileName), (err) => {
        if (err) {
          errorLog(err)
        } else {
          StoreManagerObj.deleteProgramListCache()
        }
      })
    } else if (isValidShortcutExt(ext)) {
      fs.rename(filePath, path.join(this.folder.shortcuts, fileName), (err) => {
        if (err) {
          errorLog(err)
        } else {
          StoreManagerObj.deleteProgramListCache()
        }
      })
    } else {
      // dont move the file if the file is not shortcut nor image
      errorLog('invalid extension')
    }
  }
}

export default new FileManager()
