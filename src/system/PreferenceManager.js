import FileManager from './FileManager'
import path from 'path'
import fs from 'fs'
import { fileExists } from '../helpers/file'

export class PreferenceManager {
  constructor() {
    this.preferencePath = path.join(FileManager.getPathOf('userdata'), 'preferences.json')
    fileExists(this.preferencePath).then((exists) => {
      if (!exists) {
        fs.writeFileSync(this.preferencePath, JSON.stringify({}))
      }
    })
  }
  getSetting = async (name) => {
    const file = await fs.promises.readFile(this.preferencePath)
    const preferences = await JSON.parse(file.toString('utf8'))
    return typeof preferences[name] === 'undefined' ? null : preferences[name]
  }
  setSetting = async (name, value) => {
    const file = await fs.promises.readFile(this.preferencePath)
    let preferences = await JSON.parse(file.toString('utf8'))
    preferences[name] = value
    fs.writeFileSync(this.preferencePath, JSON.stringify(preferences))
  }
  getAllSettings = async () => {
    const file = await fs.promises.readFile(this.preferencePath)
    return await JSON.parse(file.toString('utf8'))
  }
}
