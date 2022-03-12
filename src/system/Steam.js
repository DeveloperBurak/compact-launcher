import fs from 'fs/promises';
import Winreg from 'winreg';
import { errorDevLog } from '../helpers/console';
import { getRegistryItems } from '../helpers/winReg';
import { fileExists, readVdf, writeFile } from '../helpers/file';
import { isWindows } from '../helpers/os';
import { getPathOf } from './FileManager';

/**
 * supported os: windows
 */
export default class Steam {
  constructor({ storeManager }) {
    this.STEAM_REG_PATH = '\\Software\\Valve\\Steam';
    this.steamLoginUsersVdf = '/config/loginusers.vdf';
    this.storeName = 'user:steam';
    this.storeManager = storeManager;
    this.steamUserFile = `${getPathOf('userdata')}/steam.json`;
  }

  getInstalledPath = async () => {
    if (isWindows()) {
      const registryItems = await getRegistryItems({
        hive: Winreg.HKCU,
        key: this.STEAM_REG_PATH,
      });

      for (const item of registryItems) {
        if (item.name === 'SteamPath') {
          return item.value;
        }
      }
      return null;
    }
    // TODO linux and macos compability
    return null;
  };

  getUser = async () => {
    const user = this.storeManager.get(this.storeName);
    if (user === null) {
      if (fileExists(this.steamUserFile)) {
        try {
          const data = await fs.readFile(this.steamUserFile);
          return JSON.parse(data.toString('utf8'));
        } catch (e) {
          fs.unlink(this.steamUserFile);
          throw e;
        }
      } else {
        return null;
      }
    }
    return user;
  };

  setUser = async (answer) => {
    let userObject;
    if (answer) {
      const installedPath = await this.getInstalledPath();
      const steamVdf = await readVdf(`${installedPath}${this.steamLoginUsersVdf}`);
      const { users } = steamVdf;
      let selectedUser = null;

      for (const userId of Object.keys(users)) {
        if (selectedUser !== null) {
          break;
        }

        const user = users[userId];
        const keys = Object.keys(user);

        for (const key of keys) {
          if (key.toLowerCase() === 'mostrecent' && user[key] === 1) {
            selectedUser = user;
            selectedUser.id = userId;
            break;
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
        };
        this.storeManager.set(this.storeName, userObject);
      } else {
        throw new Error('User Not Found');
      }
    } else {
      userObject = {
        account: false,
      };
    }
    writeFile(this.steamUserFile, JSON.stringify(userObject));
  };

  disconnectUser = async () => {
    this.storeManager.delete(this.storeName);
    const exists = await fileExists(this.steamUserFile);
    if (exists) {
      try {
        fs.unlink(this.steamUserFile);
      } catch (err) {
        if (err != null) errorDevLog(err);
      }
    }
  };

  isUserExists = async () => {
    const userName = await this.getUser();
    return userName.account.persona !== null;
  };
}
