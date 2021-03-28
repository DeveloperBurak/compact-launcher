import {
  ipcRenderer
} from "electron";
import * as ipc from "../strings/ipc";

ipcRenderer.on(ipc.notificationReceived, (err, notification) => {
  const myNotification = new window.Notification(notification.title, notification);
  myNotification.onclick = () => {
    ipcRenderer.send(ipcOpenToolsWindow);
  }
});