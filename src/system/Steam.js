import File from "./File";
import {
  fileExists,
  readVdf
} from '../helpers/file';
import Store from "electron-store";
import {
  systemPreferences
} from "electron";
const store = new Store();

const fs = require('fs');

class Steam {

  constructor() {
    this.STEAM_REG_PATH = '\\Software\\Valve\\Steam';
    this.steamLoginUsersVdf = '/config/loginusers.vdf';
    this.storeName = 'user:steam';
  }

  setSteamUserFilePath() { // we cant set in constructor
    this.steamUserFile = File.get('userdata') + '/steam.json';
  }

  async getInstalledPath() {
    this.setSteamUserFilePath();
    return new Promise((resolve, reject) => {
      if (process.platform === 'win32') {
        let Winreg = require('winreg');
        let regKey = new Winreg({
          hive: Winreg.HKCU,
          key: this.STEAM_REG_PATH
        });
        let path = null;
        regKey.values((err, items) => {
          if (err) {
            reject(err);
          } else {
            for (let i = 0; i < items.length; i++) {
              if (items[i].name === 'SteamPath') {
                path = items[i].value;
                resolve(path);
              }
            }
          }
        });
      }
    });
  }

  getUser() {
    this.setSteamUserFilePath();
    return new Promise((resolve, reject) => {
      let user = store.get(this.storeName);
      if (user === null) {
        fileExists(this.steamUserFile).then(result => {
          if (result) {
            fs.readFile(this.steamUserFile, (err, data) => {
              if (err) {
                if (err.code === 'ENOENT') {
                  reject(file + ' does not exist');
                  return;
                }
                reject(err);
              }
              try {
                resolve(JSON.parse(data.toString('utf8')));
              } catch (e) {
                fs.unlink(this.steamUserFile, () => {
                  this.getUser();
                });
                reject(e.getMessage);
              }
            });
          } else {
            reject('file not found');
          }
        });
      } else {
        resolve(user);
      }
    });
  }

  setUser(answer, callback) {
    this.setSteamUserFilePath();
    fileExists(this.steamUserFile).then(result => {
      new Promise((resolve, reject) => {
        let userObject;
        if (answer) {
          this.getInstalledPath().then(path => {
            readVdf(path + this.steamLoginUsersVdf).then(fileJSON => {
              const users = fileJSON.users;
              let selectedUser = null;
              for (let user in users) {
                if (!users.hasOwnProperty(user)) continue;
                let userInfo = users[user];
                for (let property in userInfo) {
                  if (!userInfo.hasOwnProperty(property)) continue;
                  if (property.toLowerCase() === 'mostrecent' && userInfo[property] === 1) {
                    selectedUser = userInfo;
                    selectedUser.id = user;
                  }
                }
              }
              if (selectedUser !== null) {
                userObject = {
                  account: {
                    persona: selectedUser.PersonaName,
                    name: selectedUser.AccountName,
                    id: selectedUser.id,
                    steam: true
                  }
                }
                store.set(this.storeName, userObject);
                resolve(userObject);
              } else {
                reject("User Not Found");
              }


            });
          });
        } else {
          userObject = {
            account: false
          };
          resolve(userObject);
        }
      }).then(userObject => {
        if (typeof callback !== "undefined") {
          callback(userObject);
        }
        fs.writeFileSync(this.steamUserFile, JSON.stringify(userObject));
      });
    });
  }

  disconnectUser() {
    this.setSteamUserFilePath();
    store.delete(this.storeName);
    fileExists(this.steamUserFile).then(exists => {
      if (exists) {
        fs.unlink(this.steamUserFile, (err) => {
          if(err != null) console.log(err);          
        });
      }
    })
  }

  isUserExists() {
    this.getUser().then(userName => {
      return (userName.account.persona !== null);
    });
  }
}

export default new Steam();
