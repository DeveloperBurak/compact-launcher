/* global $, window, document, ProgressBar, alert, CustomEvent */

import { inputNumber } from './components/number-input';
import { isDev } from '../helpers/env';
import * as ipc from '../strings/ipc';
import './app';

const progressTimerText = $('#timer-text');
const btnStartTimer = $('#start-timer');
const btnStopTimer = $('#stop-timer');
const containerTimeActions = $('#time-actions');
const btnAddTime = $('#add-time');
const btnReduceTime = $('#reduce-time');
const selectorAction = $('#action');
const btnDisableShutdown = $('#disable-shutdown');
const progressBar = new ProgressBar.Line('#line', {
  color: '#eeeeee',
  easing: 'easeOut',
  strokeWidth: 5,
});

let timerInterval = null;
let timeLeft = 0;

const stopTimer = (interrupted = true) => {
  clearInterval(timerInterval);
  timerInterval = null;
  if (interrupted) window.api.send(ipc.timerStopped);
  progressBar.set(0);
  progressBar.stop();
  progressTimerText.html(null);
  btnStopTimer.hide();
  selectorAction.removeAttr('disabled');
  if (interrupted) {
    btnStartTimer.show();
  } else if (selectorAction.val() === 'shutdown') {
    btnStartTimer.hide();
    selectorAction.hide();
    btnDisableShutdown.removeClass('d-none');
  }
  containerTimeActions.removeClass('d-flex');

  return true;
};

const formatTime = (time) => {
  // show the formatted time center of progress circle
  const hours = Math.floor(time / (60 * 60));
  const minutes = Math.floor((time - hours * 60 * 60) / 60);
  let seconds = Math.floor(time % 60);
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${hours}:${minutes}:${seconds}`;
};

const calculateTime = (time, timeLength) => {
  // calculate the time in second format from given radio input
  switch (timeLength) {
    case 'minute':
      // eslint-disable-next-line no-param-reassign
      time *= 60;
      break;
    case 'hour':
      // eslint-disable-next-line no-param-reassign
      time = time * 60 * 60;
      break;
    default:
      break;
  }
  return time;
};

const startTimer = (timeLimit = 10) => {
  if (typeof timeLimit === 'number' && !Number.isNaN(timeLimit)) {
    let timePassed = 0;
    timeLeft = timeLimit;
    progressBar.animate(1);
    timerInterval = setInterval(() => {
      timePassed += 1;
      timeLeft = timeLimit - timePassed;
      progressBar.set(timeLeft / timeLimit);
      progressTimerText.html(formatTime(timeLeft));

      if (timeLeft <= 0) {
        stopTimer(false);
        const event = new CustomEvent('times-up'); // Create the event
        document.dispatchEvent(event); // Dispatch/Trigger/Fire the event
        let additionalDesc = '';
        if (selectorAction.val() === 'shutdown') additionalDesc = ' <br>Pc is shutting down...';
        progressTimerText.html(`Times Up${additionalDesc}`);
      }
    }, 1000);
    containerTimeActions.addClass('d-flex');
    btnStartTimer.hide();
    btnStopTimer.show();
    selectorAction.attr('disabled', 'disabled');
    return true;
  }
  return false;
};

const changeTime = (action, element) => {
  let time = Number.parseInt(element.val(), 10);
  const timeLength = $('input[name=time-length]:checked').val();
  time = calculateTime(time, timeLength);

  if (action === 'add') {
    timeLeft = time + timeLeft + 1; // +1 for waiting time
  } else if (action === 'reduce') {
    timeLeft = timeLeft - time + 1; // +1 for waiting time
    if (timeLeft <= 0) timeLeft = 0;
  }

  const event = new CustomEvent('timeLeft-changed', {
    detail: {
      timeLeft,
    },
  });

  document.dispatchEvent(event);
  const data = {
    timeLeft,
    action: selectorAction.val(),
  };

  window.api.send(ipc.timerSetTime, data);
};

// TODO receive time invoke
window.api.send(ipc.timerRequestTime);
window.api.receive(ipc.timerRemainingTime, (_err, time) => {
  if (time > 0) {
    startTimer(time);
  }
});

$(() => {
  inputNumber($('.input-number'));
  const mainTab = $('#toolTab');
  mainTab.tab();
  $('#toolTab>li>a').on('click', (e) => {
    mainTab.find('li>a').removeClass('active');
    const button = $(e.currentTarget);
    $(button).tab('show');
  });
  if (isDev()) {
    $('.development').hide();
  }
  btnStartTimer.on('click', () => {
    const action = selectorAction.val();
    if (action === null || action === '') {
      // eslint-disable-next-line no-alert
      alert('Choose An Action');
    } else {
      let time = Number.parseInt($('#time').val(), 10);
      const timeLength = $('input[name=time-length]:checked').val();
      time = calculateTime(time, timeLength);
      const data = {
        time,
        action,
      };
      window.api.send(ipc.timerStarted, data);
      startTimer(time);
    }
  });

  btnStopTimer.on('click', () => stopTimer());
  btnAddTime.on('click', () => changeTime('add', $('#time')));
  btnReduceTime.on('click', () => changeTime('reduce', $('#time')));

  btnDisableShutdown.on('click', () => {
    window.api.send(ipc.disableShutdown);
    btnStartTimer.show();
    selectorAction.show();
    btnDisableShutdown.addClass('d-none');
    progressTimerText.text('');
  });
});

document.addEventListener('timeLeft-changed', (event) => {
  stopTimer();
  startTimer(event.detail.timeLeft);
});
