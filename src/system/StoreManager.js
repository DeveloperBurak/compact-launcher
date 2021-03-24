import Store from "electron-store";
import { cacheProgramHTML } from "../configs/global_variables";

class StoreManager extends Store {
  deleteProgramListCache() {
    this.delete(cacheProgramHTML);
  }
  setProgramListCache(html) {
    // this.set(cacheProgramHTML, html);
  }
  async getProgramListCache() {
    return this.get(cacheProgramHTML);
  }
}

export default new StoreManager();
