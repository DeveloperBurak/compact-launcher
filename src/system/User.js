import Steam from './Steam'
import fs from 'fs'

export default class User {
  constructor() {
    this.isFirst = false
  }
  async read(file) {
    fs.readFile(file, { encoding: 'utf-8' }, function (err, data) {
      if (!err) {
        return data
      } else {
        console.log(err)
      }
    })
  }

  async setFirst(first = false) {
    if (first) {
      this.isFirst = first
    }
  }

  async getSteamUser() {
    return new Promise((resolve, reject) => {
      Steam.getInstalledPath().then((path) => {
        resolve(path)
      })
    })
  }
}
