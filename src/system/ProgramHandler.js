import { exec } from 'child_process'
import fs from 'fs'
import { devLog } from '../helpers/console'

class ProgramHandler {
  constructor() {
    this.pidsFromApp = [] // pid that started through this app, currently we use it for setting always on top
    this.listeningInterval = null
  }
  async launch(file) {
    let command
    switch (process.platform) {
      case 'win32':
        command = 'start "" "' + file + '"' // "" is required, otherwise command execute as cd
        break
      case 'linux':
        // check the file has execute permission
        const canAccess = await fs.promises.access(file.replace(/(\s+)/g, '$1'), fs.constants.X_OK)
        if (!canAccess) {
          throw new Error('cannot execute')
        } else {
          const data = await fs.promises.readFile(file.replace(/(\s+)/g, '$1'))
          let execString = data.toString()
          execString = execString.search('/\bExec=(.*)+')
          command = 'gtk-launch ' + execString // TODO check that
        }
        break
      default:
        throw new Error('OS not supported')
    }
    if (command != null) {
      devLog(command)
      const executed = exec(command, (error) => {
        if (error != null) {
          devLog(error)
          return
        }
      })
      if (executed.pid !== 0) {
        this.pidsFromApp.push(executed.pid)
      }
      if (this.listeningInterval == null) this.startToListenExecutedProcesses()
    }
  }

  startToListenExecutedProcesses() {
    this.listeningInterval = setInterval(async () => {
      for (let pid of this.pidsFromApp) {
        console.log(this.pidIsRunning(pid))
        if (this.pidIsRunning(pid)) {
          return
        }
      }
      this.stopListenExecutedProcesses()
    }, this.pidsFromApp.length * 50) // let the 50ms for every proccess, this prevents the getting over cpu usage while number of executed commands increaces
  }

  stopListenExecutedProcesses() {
    devLog('closing interval')
    // if the method is not returned, this mean all proccesses closed
    if (this.listeningInterval != null) clearInterval(this.listeningInterval)
  }

  pidIsRunning = (pid) => {
    try {
      process.kill(pid, 0)
      return true
    } catch (e) {
      return false
    }
  }
}

export default ProgramHandler
