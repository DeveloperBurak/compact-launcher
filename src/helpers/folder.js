const promisify = require('util').promisify
const path = require('path')
const fs = require('fs')
const readdirp = promisify(fs.readdir)
const statp = promisify(fs.stat)
let mkdirp = require('mkdirp')

export async function scan(directoryName, results = []) {
  let files = await readdirp(directoryName)
  let i = 0
  let j = 0
  for (let file of files) {
    let fullPath = path.join(directoryName, file)
    let stat = await statp(fullPath)
    if (stat.isDirectory()) {
      results[i] = {
        name: file,
        folder: true,
        items: await scan(fullPath, results[i]),
      }
      i++
    } else {
      const programName = path.parse(file).name // hello
      const ext = path.parse(file).ext // .html
      results[i] = {
        name: programName,
        fullpath: fullPath,
        file: true,
        ext: ext,
      }
      i++
    }
  }
  return results
}

export async function mkdirIfNotExists(folder) {
  if (!fs.existsSync(folder)) {
    try {
      mkdirp(folder, { recursive: true })
    } catch (e) {
      throw e
    }
  }
}
