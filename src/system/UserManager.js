import fs from 'fs/promises';
import { errorDevLog } from '../helpers/console';

export default class UserManager {
  constructor({ steamDriver }) {
    this.steamDriver = steamDriver;
    this.isFirst = false;
  }

  static read = (file) => {
    try {
      return fs.readFile(file, { encoding: 'utf-8' });
    } catch (err) {
      errorDevLog(err);
      return null;
    }
  };

  setFirst = async (first = false) => {
    if (first) {
      this.isFirst = first;
    }
  };

  setSteamUser = (answer) => this.steamDriver.setUser(answer);

  disconnectSteamUser = () => this.steamDriver.disconnectUser();

  getSteamUser = () => this.steamDriver.getInstalledPath();
}
