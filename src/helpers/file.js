import { parse } from '@node-steam/vdf';
import fs from 'fs/promises';
import path from 'path';
import { devLog } from './console';
import { mkdirIfNotExists } from './folder';
import { isWindows } from './os';

export const readVdf = async (file) => {
  const fileContent = await fs.readFile(file);
  return parse(fileContent.toString('utf8'));
};

export const writeFile = async (filePath, content, options) => {
  const upperPath = path.dirname(filePath);
  await mkdirIfNotExists(upperPath);
  return fs.writeFile(filePath, content, options);
};

export const fileExists = async (file) => {
  try {
    await fs.access(file, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
};

export const removeFile = async (filePath) => {
  try {
    fs.unlink(filePath);
    return true;
  } catch (e) {
    devLog(e);
    return false;
  }
};

export const isValidImageExt = (ext) => ext === '.jpg' || ext === '.png';

export const isValidShortcutExt = (ext) => {
  if (isWindows()) {
    return ext === '.lnk' || ext === '.url';
  }
  // TODO support linux
  return false;
};
