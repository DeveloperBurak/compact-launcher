class OSTimer {

  constructor(time = 0) {
    this.remainingTime = 0;
    this.timerInterval = null;
    this.setRemainingTime(time);
  }

  setRemainingTime(remainingTime) {
    this.remainingTime = remainingTime;
    if (remainingTime > 1) {
      console.log(this.timerInterval);
      if (this.timerInterval === null) {
        this.timerInterval = setInterval(() => {
          this.remainingTime -= 1;
          console.log(this.remainingTime);
          if (this.remainingTime <= 0) {
            console.log('Times Up');
            this.clearTime();
          }
        }, 1000)
      }
    }
  }

  clearTime() {
    clearInterval(this.timerInterval);
    this.setRemainingTime(0);
    this.timerInterval = null;
  }

  getRemainingTime() {
    return this.remainingTime;
  }
}

export default new OSTimer();
