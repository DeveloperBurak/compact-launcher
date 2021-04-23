import fs from 'fs'
import Winreg from 'winreg'
import { StoreManagerObj } from '../background'
import { fileExists, readVdf } from '../helpers/file'
import { isWindows } from '../helpers/os'
import FileManager from './FileManager'

class Steam {
  constructor() {
    this.STEAM_REG_PATH = '\\Software\\Valve\\Steam'
    this.steamLoginUsersVdf = '/config/loginusers.vdf'
    this.storeName = 'user:steam'
    this.steamUserFile = FileManager.getPathOf('userdata') + '/steam.json'
  }

  async getInstalledPath() {
    if (isWindows()) {
      let regKey = new Winreg({
        hive: Winreg.HKCU,
        key: this.STEAM_REG_PATH,
      })
      return await new Promise((resolve, reject) => {
        regKey.values(async (err, items) => {
          if (err) {
            reject(err)
          } else {
            for (let i = 0; i < items.length; i++) {
              if (items[i].name === 'SteamPath') {
                resolve(items[i].value)
              }
            }
          }
        })
      })
    } else {
      return null // TODO linux and macos compability
    }
  }

  async getUser() {
    let user = StoreManagerObj.get(this.storeName)
    if (user === null) {
      if (fileExists(this.steamUserFile)) {
        try {
          const data = await fs.promises.readFile(this.steamUserFile)
          return JSON.parse(data.toString('utf8'))
        } catch (e) {
          fs.unlink(this.steamUserFile)
          throw e
        }
      } else {
        return null
      }
    } else {
      return user
    }
  }

  async setUser(answer) {
    let userObject
    if (answer) {
      const installedPath = await this.getInstalledPath()
      const steamVdf = await readVdf(installedPath + this.steamLoginUsersVdf)
      const users = steamVdf.users
      let selectedUser = null
      for (let user in users) {
        if (!users.hasOwnProperty(user)) continue
        let userInfo = users[user]
        for (let property in userInfo) {
          if (!userInfo.hasOwnProperty(property)) continue
          if (property.toLowerCase() === 'mostrecent' && userInfo[property] === 1) {
            selectedUser = userInfo
            selectedUser.id = user
          }
        }
      }
      if (selectedUser !== null) {
        userObject = {
          account: {
            persona: selectedUser.PersonaName,
            name: selectedUser.AccountName,
            id: selectedUser.id,
            steam: true,
          },
        }
        StoreManagerObj.set(this.storeName, userObject)
      } else {
        throw new Error('User Not Found')
      }
    } else {
      userObject = {
        account: false,
      }
    }
    fs.writeFileSync(this.steamUserFile, JSON.stringify(userObject))
  }

  disconnectUser() {
    StoreManagerObj.delete(this.storeName)
    fileExists(this.steamUserFile).then((exists) => {
      if (exists) {
        fs.unlink(this.steamUserFile, (err) => {
          if (err != null) console.log(err)
        })
      }
    })
  }

  isUserExists() {
    this.getUser().then((userName) => {
      return userName.account.persona !== null
    })
  }
}

export default new Steam()
