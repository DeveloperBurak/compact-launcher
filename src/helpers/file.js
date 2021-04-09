const fs = require('fs')
import { parse } from '@node-steam/vdf'
import { isWindows } from './os'

export const readVdf = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          reject(file + ' does not exist')
          return
        }
        reject(err)
      }
      let fileContent = data.toString('utf8')
      resolve(parse(fileContent))
    })
  })
}

export const fileExists = (file) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(file)) {
      resolve(true)
    } else {
      resolve(false)
    }
  })
}

export const removeFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err === null) {
        resolve(true)
      }
    })
  })
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
