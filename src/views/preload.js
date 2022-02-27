import { contextBridge, ipcRenderer, remote } from 'electron';
// eslint-disable-next-line import/no-unresolved
import env from 'env';

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
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
});

contextBridge.exposeInMainWorld('remote', {
  openDialog: (options, func) => {
    remote.dialog.showOpenDialog(remote.getCurrentWindow(), options, func);
  },
});

contextBridge.exposeInMainWorld('env', env);
