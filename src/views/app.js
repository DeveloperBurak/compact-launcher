import { ipcRenderer } from 'electron'
import * as ipc from '../strings/ipc'

ipcRenderer.on(ipc.themeInfo, (err, colors) => {
  for (let el of document.getElementsByClassName('primary-color')) {
    el.style.color = colors.primary
  }
  for (let el of document.getElementsByClassName('primary-bg')) {
    el.style.backgroundColor = colors.primary
  }
  for (let el of document.getElementsByClassName('secondary-color')) {
    el.style.color = colors.secondary
  }
  for (let el of document.getElementsByClassName('secondary-bg')) {
    el.style.backgroundColor = colors.secondary
  }
  for (let el of document.getElementsByClassName('theme-text')) {
    el.style.color = colors.text
  }
})

ipcRenderer.on(ipc.notificationReceived, (err, notification) => {
  const myNotification = new window.Notification(notification.title, notification)
  myNotification.onclick = () => {
    ipcRenderer.send(ipcOpenToolsWindow)
  }
})
