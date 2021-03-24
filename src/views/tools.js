import "./app";
import "../stylesheets/main.css";
import "../stylesheets/sub-windows.css";
import "../components/number-input.js";
import {
  ipcRenderer
} from "electron";
import env from "env";
import $ from "jquery";

import * as ipc from "../helpers/ipcActions";

const tab = require('bootstrap').Tab;
const ProgressBar = require("progressbar.js");
let timerInterval = null;
let progressBar = new ProgressBar.Line('#line', {
  color: '#eeeeee',
  easing: 'easeOut',
  strokeWidth: 5
});

// dom elements
const progressTimerText = $('#timer-text');
const btnStartTimer = $('#start-timer');
const btnStopTimer = $('#stop-timer');
const containerTimeActions = $('#time-actions');
const btnAddTime = $('#add-time');
const btnReduceTime = $('#reduce-time');
const selectorAction = $('#action');
const btnDisableShutdown = $('#disable-shutdown');
let timeLeft = 0;
ipcRenderer.send(ipc.timerRequestTime);
ipcRenderer.on(ipc.timerRemainingTime, (err, time) => {
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
    const action = selectorAction.val();
    if (action === null || action === '') {
      alert('Choose An Action')
    } else {
      let time = parseInt($('#time').val());
      const timeLength = $('input[name=time-length]:checked').val();
      time = calculateTime(time, timeLength);
      const data = {
        time: time,
        action: action
      }
      ipcRenderer.send(ipc.timerStarted, data);
      startTimer(time);
    }
  });
  btnStopTimer.on('click', () => {
    stopTimer();
  });
  btnAddTime.on('click', () => {
    changeTime('add', $('#time'))
  });
  btnReduceTime.on('click', () => {
    changeTime('reduce', $('#time'))
  });
  btnDisableShutdown.on('click', () => {
    ipcRenderer.send(ipc.disableShutdown);
    btnStartTimer.show();
    selectorAction.show();
    btnDisableShutdown.addClass('d-none');
    progressTimerText.text('');
  })
})

document.addEventListener('timeLeft-changed', (event) => {
  stopTimer();
  startTimer(event.detail.timeLeft);
})

function startTimer(timeLimit = 10, timeLength = "second", startNew = true) {
  if (typeof timeLimit === "number" && !isNaN(timeLimit)) {
    let timePassed = 0;
    timeLeft = timeLimit;
    progressBar.animate(1);
    timerInterval = setInterval(() => {
      timePassed = timePassed += 1;
      timeLeft = timeLimit - timePassed;
      progressBar.set(timeLeft / timeLimit);
      progressTimerText.html(formatTime(timeLeft));

      if (timeLeft <= 0) {
        stopTimer(false);
        let event = new CustomEvent('times-up'); // Create the event
        document.dispatchEvent(event); // Dispatch/Trigger/Fire the event
        let additionalDesc = '';
        if (selectorAction.val() === 'shutdown') additionalDesc = " <br>Pc is shutting down...";
        progressTimerText.html('Times Up' + additionalDesc);
      }
    }, 1000);
    containerTimeActions.addClass('d-flex');
    btnStartTimer.hide();
    btnStopTimer.show();
    selectorAction.attr("disabled", "disabled");
    return true;
  } else {
    return false;
  }
}

function stopTimer(interrupted = true) {
  clearInterval(timerInterval);
  timerInterval = null;
  if (interrupted) ipcRenderer.send(ipc.timerStopped);
  progressBar.set(0);
  progressBar.stop();
  progressTimerText.html(null);
  btnStopTimer.hide();
  selectorAction.removeAttr("disabled");
  if (interrupted) {
    btnStartTimer.show();
  } else {
    if (selectorAction.val() === 'shutdown') {
      btnStartTimer.hide();
      selectorAction.hide();
      btnDisableShutdown.removeClass('d-none');
    }
  }
  containerTimeActions.removeClass('d-flex');

  return true;
}

function formatTime(time) { // show the formatted time center of progress circle
  let hours = Math.floor(time / (60 * 60));
  let minutes = Math.floor((time - (hours * 60 * 60)) / 60);
  let seconds = Math.floor(time % 60);
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${hours}:${minutes}:${seconds}`;
}

function calculateTime(time, timeLength) { // calculate the time in second format from given radio input
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

function changeTime(action, element) {
  let time = parseInt(element.val());
  const timeLength = $('input[name=time-length]:checked').val();
  time = calculateTime(time, timeLength);
  if (action === 'add') {
    timeLeft = time + timeLeft + 1; // +1 for waiting time
  } else if (action === 'reduce') {
    timeLeft = timeLeft - time + 1; // +1 for waiting time
    if (timeLeft <= 0) timeLeft = 0;
  }
  let event = new CustomEvent('timeLeft-changed', {
    detail: {
      timeLeft: timeLeft
    }
  }); // create event
  document.dispatchEvent(event);
  const data = {
    timeLeft: timeLeft,
    action: selectorAction.val()
  }
  ipcRenderer.send(ipc.timerSetTime, data);
}
