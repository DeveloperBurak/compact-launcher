/* global window, document */

import * as ipc from '../strings/ipc';

window.api.receive(ipc.themeInfo, (err, colors) => {
  for (const el of document.getElementsByClassName('primary-color')) {
    el.style.color = colors.primary;
  }
  for (const el of document.getElementsByClassName('primary-bg')) {
    el.style.backgroundColor = colors.primary;
  }
  for (const el of document.getElementsByClassName('secondary-color')) {
    el.style.color = colors.secondary;
  }
  for (const el of document.getElementsByClassName('secondary-bg')) {
    el.style.backgroundColor = colors.secondary;
  }
  for (const el of document.getElementsByClassName('theme-text')) {
    el.style.color = colors.text;
  }
});

window.api.receive(ipc.notificationReceived, (err, notification) => {
  const myNotification = new window.Notification(notification.title, notification);
  myNotification.onclick = () => {
    window.api.send(ipc.openToolsWindow);
  };
});
