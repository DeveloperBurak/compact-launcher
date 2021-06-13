import fs from 'fs'
import fetch from 'node-fetch'

export const downloadFile = async (url, path) => {
  const res = await fetch(url)
  const fileStream = fs.createWriteStream(path)
  console.log('downloading...')
  return await new Promise((resolve, reject) => {
    console.log('downloading...2')

    res.body.pipe(fileStream)
    res.body.on('error', reject)
    fileStream.on('finish', resolve)
  })
}
