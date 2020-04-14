import File from "./File";
import {fileExists, readVdf} from '../helpers/file';
import Store from "electron-store";
const store = new Store();

const fs = require('fs');

class Steam {

  constructor() {
    this.steamUserFile = 'steam.json';
    this.STEAM_REG_PATH = '\\Software\\Valve\\Steam';
    this.steamLoginUsersVdf = '/config/loginusers.vdf';
  }

  async getInstalledPath() {
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
    let steamUserFile = File.get('userdata') + '/' + this.steamUserFile;
    return new Promise((resolve, reject) => {
      let user = store.get('user');
      if (user === null) {
        fileExists(steamUserFile).then(result => {
          if (result) {
            fs.readFile(steamUserFile, (err, data) => {
              if (err) {
                if (err.code === 'ENOENT') {
                  reject(file + ' does not exist');
                  return;
                }
                reject(err);
              }
              try{
                resolve(JSON.parse(data.toString('utf8')));
              }catch (e) {
                fs.unlink(steamUserFile,() =>{
                  console.log('deleted');
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
    let steamUserFile = File.get('userdata') + '/' + this.steamUserFile;
    fileExists(steamUserFile).then(result => {
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
                  if (property === 'mostrecent' && userInfo[property] === 1) {
                    selectedUser = userInfo;
                    selectedUser.id = user;
                  }
                }
              }
              userObject = {
                account: {
                  persona: selectedUser.PersonaName,
                  name: selectedUser.AccountName,
                  id: selectedUser.id,
                  steam: true
                }
              };
              store.set('user', userObject);
              resolve(userObject);
            });
          });
        } else {
          userObject = {
            account: false
          };
          resolve(userObject);
        }

      }).then(userObject => {
        console.log(userObject);
        if (typeof callback !== "undefined") {
          callback(userObject);
        }
        fs.writeFileSync(steamUserFile, JSON.stringify(userObject));
      });
    });
  }

  deleteUser(){

  }

  isUserExists() {
    this.getUser().then(userName => {
      return (userName.account.persona !== null);
    });
  }
}

export default new Steam();
