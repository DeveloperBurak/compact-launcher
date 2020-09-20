import {
  ipcRenderer
} from "electron";
import * as ipc from "../helpers/ipcActions";

ipcRenderer.on(ipc.notificationReceived, (err, notification) => {
  const myNotification = new window.Notification(notification.title, notification);
  myNotification.onclick = () => {
    ipcRenderer.send(ipcOpenToolsWindow);
  }
});


/* ipcRenderer.on(ipcAlertFired, (err, notification) => {
  // TODO
  const myNotification = new window.Notification(notification.title, notification);
  myNotification.onclick = () => {
    ipcRenderer.send(ipcOpenToolsWindow);
  }
}); */
