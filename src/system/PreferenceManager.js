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
  get = async (name) => {
    const file = await fs.promises.readFile(this.preferencePath)
    const preferences = await JSON.parse(file.toString('utf8'))
    return typeof preferences[name] === 'undefined' ? null : preferences[name]
  }
  set = async (name, value) => {
    const file = await fs.promises.readFile(this.preferencePath)
    let preferences = await JSON.parse(file.toString('utf8'))
    preferences[name] = value
    fs.writeFileSync(this.preferencePath, JSON.stringify(preferences))
  }
  getAll = async () => {
    const file = await fs.promises.readFile(this.preferencePath)
    return await JSON.parse(file.toString('utf8'))
  }
}
