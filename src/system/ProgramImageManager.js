import fetch from 'node-fetch'
import { downloadFile } from '../helpers/external'
import FileManager from './FileManager'
import path from 'path'
class ProgramImageManager {
  constructor(serviceUrl) {
    this.externalService = serviceUrl
  }
  async fetchImage(slug) {
    const serverResponse = await fetch(this.externalService + '/' + slug)
    if (serverResponse.status === 200) {
      return await serverResponse.json()
    }
    return { statusCode: serverResponse.status }
  }

  async selectProgram(docId, programName) {
    const serverResponse = await fetch(this.externalService + '/select', {
      method: 'post',
      body: JSON.stringify({ imageID: docId }),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    })
    let response = { statusCode: serverResponse.status }
    if (serverResponse.status === 200) {
      const serverResponseJson = await serverResponse.json()
      await downloadFile(serverResponseJson.data.path, path.join(FileManager.getPathOf('images'), programName + '.jpg'))
      response.filePath = path.join(FileManager.getPathOf('images'), programName + '.jpg')
    }
    return response
  }
}

export default ProgramImageManager
