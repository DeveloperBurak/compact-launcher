import { lockPC, shutdownPC, sleepPC } from "./System";

const EE = require("events");

class OSTimer {
  constructor(time = 0) {
    EE.call(this);
    this.remainingTime = 0;
    this.timerInterval = null;
    this.action = null;
    this.nearTimeTreshold = 3; // (in minute)
  }

  startTimer(time, action) {
    if (time == null || action == null) {
      return false;
    }
    this.remainingTime = time;
    this.action = action;
    if (time > 1) {
      if (this.timerInterval === null) {
        this.timerInterval = setInterval(async () => {
          this.remainingTime -= 1;
          if (this.remainingTime / 60 < this.nearTimeTreshold) {
            this.emit("time-near");
          }
          if (this.remainingTime <= 0) {
            await this.runAction();
            this.clearTime();
          }
        }, 1000);
      }
    }
  }

  getNotification() {
    let notification;
    switch (this.action) {
      case "shutdown":
        notification = {
          title: "Remainder",
          body: "Pc is shutting down in " + this.nearTimeTreshold + " minute",
        };
        break;
      case "sleep":
        notification = {
          title: "Remainder",
          body: "Pc will go to sleep in " + this.nearTimeTreshold + " minute",
        };
        break;
      case "lock":
        notification = {
          title: "Remainder",
          body: "Pc will be locked in " + this.nearTimeTreshold + " minute",
        };
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

  getRemainingTime() {
    return this.remainingTime;
  }

  runAction() {
    switch (this.action) {
      case "shutdown":
        shutdownPC();
        break;
      case "sleep":
        sleepPC();
        break;
      case "lock":
        lockPC();
        break;
    }
  }
}

OSTimer.prototype.__proto__ = EE.EventEmitter.prototype;
export default new OSTimer();
