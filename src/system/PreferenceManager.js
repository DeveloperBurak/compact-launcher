import path from 'path';
import fs from 'fs/promises';
import { writeFile } from '../helpers/file';
import { defaults as defaultPreferences } from '../configs/preferences.json';
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
      writeFile(this.preferencePath, JSON.stringify(defaultPreferences), { flag: 'w' });
    }

    try {
      const file = await fs.readFile(this.preferencePath);
      this.preferences = JSON.parse(file.toString('utf8'));
    } catch (err) {
      this.preferences = defaultPreferences;
      this.userManager.setFirst(true);
    }
  };

  set = async (name, value) => {
    this.preferences[name] = value;
    writeFile(this.preferencePath, JSON.stringify(this.preferences));
  };
}
