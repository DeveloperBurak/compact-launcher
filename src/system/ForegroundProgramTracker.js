import activeWin from 'active-win'
import fs from 'fs'
import path from 'path'
import { WindowHandlerObj } from '../background'
import { fileExists } from '../helpers/file'
import FileManager from './FileManager'
class ForegroundProgramTracker {
  constructor() {
    this.blackList = [] // if the foreground program is in this list, change
    this.activeProgram = null
    this.forbiddenProgramsFile = path.join(FileManager.getPathOf('userdata'), 'forbidden-programs.json')
    this.trackingInterval = null
    fileExists(this.forbiddenProgramsFile).then((exists) => {
      if (!exists) {
        fs.writeFileSync(this.forbiddenProgramsFile, JSON.stringify(this.blackList))
      } else {
        fs.readFile(this.forbiddenProgramsFile, (err, data) => {
          this.blackList = JSON.parse(data.toString('utf8'))
        })
      }
    })
  }

  start(interval = 1000) {
    this.trackingInterval = setInterval(async () => {
      this.watching()
    }, interval)
  }

  stop() {
    // stop timer
    if (this.trackingInterval != null) clearInterval(this.trackingInterval)
  }

  addToBlacklist() {
    if (this.blackList.indexOf(this.activeProgram) === -1) {
      this.blackList.push(this.activeProgram)
      fs.writeFileSync(this.forbiddenProgramsFile, JSON.stringify(this.blackList))
    }
  }

  removeFromBlacklist() {
    if (this.blackList.indexOf(this.activeProgram) !== -1) {
      this.blackList.splice(this.blackList.indexOf(this.activeProgram), 1)
      fs.writeFileSync(this.forbiddenProgramsFile, JSON.stringify(this.blackList))
    }
  }
  async watching() {
    const foregroundProgram = await activeWin()
    if (
      foregroundProgram != null &&
      foregroundProgram.owner.name !== 'Compact Launcher.exe' &&
      foregroundProgram.owner.name !== 'electron.exe' &&
      foregroundProgram.owner.name !== 'Compact Launcher' &&
      this.activeProgram !== foregroundProgram.owner.name
    ) {
      this.activeProgram = foregroundProgram.owner.name
      this.setAlwaysOnTop()
    }
  }

  /**
   * @param force - force the behaviour for always on top property
   */
  setAlwaysOnTop(force) {
    WindowHandlerObj.getAllWindows().forEach((window) => {
      window.setAlwaysOnTop(force ?? this.blackList.indexOf(this.activeProgram) == -1, 'screen-saver') // apply this rule for all windows.
    })
  }

  addToBlacklist(app) {
    this.blackList.push(app)
  }
}

export default ForegroundProgramTracker
