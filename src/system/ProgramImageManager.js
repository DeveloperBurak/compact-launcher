import fetch from 'node-fetch';
import path from 'path';
import { downloadFile } from '../helpers/external';
import { getPathOf } from './FileManager';

export default class ProgramImageManager {
  constructor(serviceUrl) {
    this.externalService = serviceUrl;
  }

  fetchImage = async (slug) => {
    const serverResponse = await fetch(`${this.externalService}/${slug}`);
    if (serverResponse.status === 200) {
      return serverResponse.json();
    }
    return { statusCode: serverResponse.status };
  };

  selectProgram = async (docId, programName) => {
    const serverResponse = await fetch(`${this.externalService}/select`, {
      method: 'post',
      body: JSON.stringify({ imageID: docId }),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const response = { statusCode: serverResponse.status };
    if (serverResponse.status === 200) {
      const serverResponseJson = await serverResponse.json();
      await downloadFile(serverResponseJson.data.path, path.join(getPathOf('images'), `${programName}.jpg`));
      response.filePath = path.join(getPathOf('images'), `${programName}.jpg`);
    }
    return response;
  };
}
