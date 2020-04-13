import { contextBridge, ipcRenderer } from 'electron';
// eslint-disable-next-line import/no-unresolved
import env from 'env';
import { openDialog } from '../strings/ipc';

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => {
      if (args.length === 1) {
        return func(event, args[0]);
      }

      return func(event, ...args);
    });
  },
  invoke: async (channel, data) => ipcRenderer.invoke(channel, data),
});

contextBridge.exposeInMainWorld('remote', {
  openDialog: async (options) => ipcRenderer.invoke(openDialog, { options }),
});

contextBridge.exposeInMainWorld('env', env);
