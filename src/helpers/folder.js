/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

const readdirp = promisify(fs.readdir);
const statp = promisify(fs.stat);

export const scan = async (directoryName, results = []) => {
  const files = await readdirp(directoryName);
  let i = 0;
  for (const file of files) {
    const fullpath = path.join(directoryName, file);
    const stat = await statp(fullpath);
    if (stat.isDirectory()) {
      results[i] = {
        name: file,
        folder: true,
        items: await scan(fullpath, results[i]),
      };
      i += 1;
    } else {
      const { name } = path.parse(file);
      const { ext } = path.parse(file);
      results[i] = {
        name,
        fullpath,
        file: true,
        ext,
      };
      i += 1;
    }
  }
  return results;
};

export const mkdirIfNotExists = async (folder) => {
  try {
    return await fs.access(folder);
  } catch (err) {
    return fs.mkdir(folder, { recursive: true });
  }
};
