const fs = require('fs')
import { parse } from '@node-steam/vdf'
import { devLog } from './console'
import { isWindows } from './os'

export const readVdf = async (file) => {
  try {
    const fileContent = await fs.promises.readFile(file)
    return parse(fileContent.toString('utf8'))
  } catch (e) {
    throw e
  }
}

export const fileExists = async (file) => {
  return fs.existsSync(file)
}

export const removeFile = async (path) => {
  try {
    fs.promises.unlink(path)
    return true
  } catch (e) {
    devLog(e)
    return false
  }
}

export const isValidImageExt = (ext) => {
  return ext === '.jpg' || ext === '.png'
}

export const isValidShortcutExt = (ext) => {
  if (isWindows()) {
    return ext === '.lnk' || ext === '.url'
  }
  // TODO support linux
  return false
}
