import "./stylesheets/main.css";
import "./stylesheets/settings.css";
import {ipcRenderer} from "electron";
import env from "env";
import $ from "jquery";
import 'jquery-circle-progress';
import {ipcTimerRemainingTime, ipcTimerRequestTime, ipcTimerStarted, ipcTimerStopped} from "./helpers/ipcActions";

const tab = require('bootstrap').Tab;

let timerInterval = null;
const progressBar = $('#circle');
const progressTimerText = $('#timer-text');
const btnStartTimer = $('#start-timer');
const btnStopTimer = $('#stop-timer');
ipcRenderer.send(ipcTimerRequestTime);
ipcRenderer.on(ipcTimerRemainingTime, (err, time) => {
  if (time > 0) {
    startTimer(time);
  }
});
$(document).ready(() => {
  const mainTab = $('#toolTab');
  mainTab.tab();
  $('#toolTab>li>a').on('click', (e) => {
    mainTab.find('li>a').removeClass('active');
    const button = $(e.currentTarget);
    $(button).tab('show');
  })
  if (env.name !== 'development') {
    $('.development').hide();
  }
  btnStartTimer.on('click', () => {
    let time = parseInt($('#time').val());
    const timeLength = $('input[name=time-length]:checked').val();
    time = calculateTime(time, timeLength);
    ipcRenderer.send(ipcTimerStarted, time);
    startTimer(time);
  });
  btnStopTimer.on('click', () => {
    stopTimer();
  });
})

document.addEventListener('times-up', (data) => {
  btnStartTimer.show();
})

function onTimesUp() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function startTimer(timeLimit = 10, timeLength = "second", startNew = true) {
  if (typeof timeLimit === "number" && !isNaN(timeLimit)) {
    btnStartTimer.hide();
    btnStopTimer.show();
    progressBar.circleProgress({
      animationStartValue: 1,
      value: 1,
      size: 200,
      fill: {
        gradient: ["blue", "cyan"]
      },
      reverse: true,
      animation: {
        duration: 500
      }
    });
    let timePassed = 0;
    let timeLeft = timeLimit;
    timerInterval = setInterval(() => {
      timePassed = timePassed += 1;
      timeLeft = timeLimit - timePassed;
      progressBar.circleProgress({animationStartValue: (timeLeft + 1) / timeLimit, value: timeLeft / timeLimit});
      progressBar.circleProgress('redraw'); // use current configuration and redraw
      progressTimerText.html(formatTime(timeLeft));
      if (timeLeft === 0) {
        onTimesUp();
        // Create the event
        let event = new CustomEvent('times-up');
        // Dispatch/Trigger/Fire the event
        document.dispatchEvent(event);
        progressTimerText.html('Times Up');
      }
    }, 1000);
    return true;
  } else {
    return false;
  }
}

function stopTimer() {
  ipcRenderer.send(ipcTimerStopped);
  onTimesUp();
  btnStartTimer.show();
  btnStopTimer.hide();
  return true;
}

function formatTime(time) {
  let hours = Math.floor(time / (60 * 60));
  let minutes = Math.floor((time - (hours * 60 * 60)) / 60);
  let seconds = Math.floor(time % 60);
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${hours}:${minutes}:${seconds}`;
}

function calculateTime(time, timeLength) {
  switch (timeLength) {
    case "minute":
      time = time * 60;
      break;
    case "hour":
      time = time * 60 * 60;
      break;
  }
  return time;
}
