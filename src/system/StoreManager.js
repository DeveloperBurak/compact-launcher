import Store from 'electron-store'
import { appVersion, cacheProgramHTML } from '../strings/store'
import { version } from '../../package.json'

class StoreManager extends Store {
  constructor() {
    super()
    if (this.get(appVersion) != version) {
      this.deleteProgramListCache()
    }
  }
  deleteProgramListCache() {
    this.delete(cacheProgramHTML)
  }
  setProgramListCache(html) {
    this.set(cacheProgramHTML, html)
  }
  async getProgramListCache() {
    return this.get(cacheProgramHTML)
  }
}

export default StoreManager
