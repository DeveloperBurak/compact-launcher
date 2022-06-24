import { lockPC, shutdownPC, sleepPC } from './System';

// OS Action(like sleep, shutdown etc.) Timer
export default class Timer {
  constructor({ eventEmitter }) {
    this.remainingTime = 0;
    this.timerInterval = null;
    this.action = null; // the action when time is up
    this.nearTimeTreshold = 3; // (in minute)
    this.eventEmitter = eventEmitter;
  }

  /**
   *
   * @param {!number} time
   * @param {!string} action
   */
  startTimer = (time, action) => {
    if (time == null || action == null || typeof time !== 'number') {
      return;
    }
    let timeTresholdReached = false;
    this.remainingTime = time;
    this.action = action;
    this.eventEmitter.emit('osTimer-notify', this.getNotification());

    if (time > 1) {
      if (this.timerInterval === null) {
        this.timerInterval = setInterval(() => {
          this.remainingTime -= 1;
          if (!timeTresholdReached) {
            if (this.remainingTime / 60 === this.nearTimeTreshold) {
              timeTresholdReached = true;
              this.eventEmitter.emit('osTimer-notify', this.getNotification());
            }
          }
          if (this.remainingTime <= 0) {
            this.runAction();
            this.clearTime();
          }
        }, 1000);
      }
    }
  };

  getNotification() {
    let notification;
    switch (this.action) {
      case 'shutdown':
        notification = {
          title: 'Remainder',
          body: `Pc is shutting down in ${Math.ceil(this.remainingTime / 60)} minute`,
        };
        break;
      case 'sleep':
        notification = {
          title: 'Remainder',
          body: `Pc will go to sleep in ${Math.ceil(this.remainingTime / 60)} minute`,
        };
        break;
      case 'lock':
        notification = {
          title: 'Remainder',
          body: `Pc will be locked in ${Math.ceil(this.remainingTime / 60)} minute`,
        };
        break;
      default:
        break;
    }
    return notification;
  }

  clearTime() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.remainingTime = 0;
    this.action = null;
  }

  getRemainingTime = () => this.remainingTime;

  runAction() {
    // TODO add restart
    switch (this.action) {
      case 'shutdown':
        shutdownPC();
        break;
      case 'sleep':
        sleepPC();
        break;
      case 'lock':
        lockPC();
        break;
      default:
        break;
    }
  }
}
