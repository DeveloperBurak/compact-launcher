import { Notification } from 'electron';
import { ICO_PATH } from '../helpers/constants';

export default class NotificationHandler {
  constructor({ windowHandler, eventEmitter }) {
    this.eventEmitter = eventEmitter;
    this.windowHandler = windowHandler;
    this.osTimerNotification = null;
  }

  init = () => {
    this.osTimerListener();
  };

  osTimerListener = () => {
    this.eventEmitter.on('osTimer-notify', (ntf) => {
      const notificationContent = ntf;
      notificationContent.icon = ICO_PATH;
      this.osTimerNotification = new Notification(notificationContent);
      this.osTimerNotification.on('click', () => this.windowHandler.openToolsWindow());
      this.osTimerNotification.show();
    });
  };
}
