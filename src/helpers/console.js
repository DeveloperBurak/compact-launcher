/* eslint-disable no-console */
import { isDev } from './env';

export const devLog = (...logs) => {
  if (isDev()) {
    if (logs.length === 1) {
      console.log(logs[0]);
    } else {
      for (const log of logs) {
        console.log(log);
      }
    }
  }
};

export const errorDevLog = (...logs) => {
  if (isDev()) {
    if (logs.length === 1) {
      console.log(`\x1b[31m\x1b[40m${logs[0]}`);
    } else {
      for (const log of logs) {
        console.log(`\x1b[31m\x1b[40m${log}`);
      }
    }
  }
};

export const warningDevLog = (...logs) => {
  if (isDev()) {
    const yellow = '\x1b[33m';
    if (logs.length === 1) {
      console.log(`${yellow}${logs[0]}`);
    } else {
      for (const log of logs) {
        console.log(`${yellow}${log}`);
      }
    }
  }
};
