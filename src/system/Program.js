import { fileExists, removeFile } from '../helpers/file';
import { getPathOf } from './FileManager';

const fs = require('fs/promises');
const path = require('path');

export const addNewImage = async ({ source, name }) => {
  const image = path.join(getPathOf('images'), `${name}.jpg`);
  const exists = await fileExists(image);
  if (exists) {
    await removeFile(image);
  }
  await fs.copyFile(source, image);
};
