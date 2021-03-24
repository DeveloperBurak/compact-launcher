import {
  ipcRenderer
} from "electron";
import * as ipc from "../helpers/ipcActions";

ipcRenderer.on(ipc.notificationReceived, (err, notification) => {
  console.log();
  const myNotification = new window.Notification(notification.title, notification);
  myNotification.onclick = () => {
    ipcRenderer.send(ipcOpenToolsWindow);
  }
});