import { lockPC, shutdownPC, sleepPC } from "./System";

const EE = require("events");

// OS Action(like sleep, shutdown etc.) Timer
class OSTimer {
  constructor() {
    EE.call(this);
    this.remainingTime = 0;
    this.timerInterval = null;
    this.action = null; // the action when time is up
    this.nearTimeTreshold = 3; // (in minute)
  }

  /**
   *
   * @param {!number} time
   * @param {!string} action
   * @returns {void}
   */
  startTimer(time, action) {
    //
    if (time == null || action == null || typeof time !== "number") {
      return false;
    }
    let timeTresholdReached = false;
    this.remainingTime = time;
    this.action = action;
    if (time > 1) {
      if (this.timerInterval === null) {
        this.timerInterval = setInterval(async () => {
          this.remainingTime -= 1;
          if (!timeTresholdReached) {
            if (this.remainingTime / 60 === this.nearTimeTreshold) {
              timeTresholdReached = true;
              this.emit("time-near");
            }
          }
          if (this.remainingTime <= 0) {
            await this.runAction();
            this.clearTime();
          }
        }, 1000);
      }
    }
  }

  /**
   * @returns {object}
   */
  getNotification() {
    let notification;
    switch (this.action) {
      case "shutdown":
        notification = {
          title: "Remainder",
          body:
            "Pc is shutting down in " +
            Math.ceil(this.remainingTime / 60) +
            " minute",
        };
        break;
      case "sleep":
        notification = {
          title: "Remainder",
          body:
            "Pc will go to sleep in " +
            Math.ceil(this.remainingTime / 60) +
            " minute",
        };
        break;
      case "lock":
        notification = {
          title: "Remainder",
          body:
            "Pc will be locked in " +
            Math.ceil(this.remainingTime / 60) +
            " minute",
        };
        break;
    }
    return notification;
  }
  /**
   * @returns {void}
   */
  clearTime() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.remainingTime = 0;
    this.action = null;
  }

  /**
   * @returns {number}
   */
  getRemainingTime() {
    return this.remainingTime;
  }

  /**
   * @returns {void}
   */
  runAction() {
    // TODO add restart
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
