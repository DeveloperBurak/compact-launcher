import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import file from '../configs/file.json';
import { errorDevLog } from '../helpers/console';
import { isProduction } from '../helpers/env';
import { isValidImageExt, isValidShortcutExt } from '../helpers/file';
import { mkdirIfNotExists } from '../helpers/folder';

const root = path.join(app.getPath('documents'), file.root);
const appFolders = {
  root,
  shortcuts: path.join(root, file.shortcuts),
  images: path.join(root, file.images),
  userdata: path.join(root, file.userData),
};

export const createRequiredFolders = async () => {
  const folders = Object.values(appFolders);
  for await (const folder of folders) {
    try {
      await mkdirIfNotExists(folder);
    } catch (err) {
      if (isProduction()) {
        // TODO warn the user about error and exit the program
        return;
      }
      errorDevLog(err);
    }
  }
};

export const getPathOf = (key) => appFolders[key];

export const moveToOurDocument = async (filePath, storeManager) => {
  const fileName = path.basename(filePath);
  const { ext } = path.parse(filePath);
  if (isValidImageExt(ext)) {
    try {
      await fs.rename(filePath, path.join(appFolders.images, fileName));
    } catch (err) {
      return errorDevLog(err);
    }

    return storeManager.deleteProgramListCache();
  }

  if (isValidShortcutExt(ext)) {
    try {
      await fs.rename(filePath, path.join(appFolders.shortcuts, fileName));
    } catch (err) {
      return errorDevLog(err);
    }

    return storeManager.deleteProgramListCache();
  }

  return errorDevLog('invalid extension');
};

export const renameProgram = async ({ oldName, newName, oldPath }) => {
  const newPath = oldPath.replace(oldName, newName);
  try {
    await fs.rename(oldPath, newPath);
  } catch (err) {
    throw new Error('Failed during renaming');
  }
};
