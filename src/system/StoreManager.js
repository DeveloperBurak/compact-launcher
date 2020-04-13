import Store from 'electron-store';
import { version } from '../../package.json';
import { UI } from '../configs/app.json';
import { appVersion, cacheProgramHTML, primaryThemeColor, secondaryThemeColor, textColor } from '../strings/store';

export default class StoreManager extends Store {
  constructor() {
    super();
    this.init();
  }

  init = () => {
    if (this.get(appVersion) !== version) {
      this.deleteProgramListCache();
    }
    if (this.get(primaryThemeColor) == null) {
      this.set(primaryThemeColor, UI.THEME.PRIMARY);
    }
    if (this.get(secondaryThemeColor) == null) {
      this.set(secondaryThemeColor, UI.THEME.SECONDARY);
    }
    this.delete(textColor);
    if (this.get(textColor) == null) {
      this.set(textColor, UI.THEME.TEXT);
    }
  };

  deleteProgramListCache = () => this.delete(cacheProgramHTML);

  setProgramListCache = (html) => this.set(cacheProgramHTML, html);

  getProgramListCache = async () => this.get(cacheProgramHTML);
}
