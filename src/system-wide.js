import {ipcRenderer} from "electron";
import {ipcNotificationReceived, openToolsWindow as ipcOpenToolsWindow} from "./helpers/ipcActions";

ipcRenderer.on(ipcNotificationReceived, (err, notification) => {
  const myNotification = new window.Notification(notification.title, notification);
  myNotification.onclick = () => {
    ipcRenderer.send(ipcOpenToolsWindow);
  }
});
