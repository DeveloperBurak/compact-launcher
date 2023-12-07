import path from 'path';
import fs from 'fs/promises';
import { writeFile } from '../helpers/file';
import PREFERENCE_CONFIG from '../configs/preferences';
import { getPathOf } from './FileManager';

export default class PreferenceManager {
  constructor({ userManager }) {
    this.preferencePath = path.join(getPathOf('userdata'), 'preferences.json');
    this.userManager = userManager;
    this.preferences = {};
  }

  get = (name) => this.preferences[name];

  getAll = () => this.preferences;

  init = async () => {
    try {
      await fs.access(this.preferencePath);
    } catch (err) {
      writeFile(this.preferencePath, JSON.stringify(PREFERENCE_CONFIG.defaults), { flag: 'w' });
    }

    try {
      const file = await fs.readFile(this.preferencePath);
      this.preferences = JSON.parse(file.toString('utf8'));
    } catch (err) {
      this.preferences = PREFERENCE_CONFIG.defaults;
      this.userManager.setFirst(true);
    }
  };

  set = async (name, value) => {
    this.preferences[name] = value;
    writeFile(this.preferencePath, JSON.stringify(this.preferences));
  };
}
