/* global $, window */

import { closeSettingWindow, openCollapsedWindow, openSettingWindow, openToolsWindow, closeToolsWindow } from '../strings/ipc';

const stepTextButton = (element, getBackup) => {
  // change the text of buttons, it will be dynamic when page change
  element.attr('backup-text', element.text()); // save the previous text, so we can use it again
  const nextButton = $(`.next-step[step="${Number.parseInt(element.attr('step'), 10) + 1}"`);
  if (nextButton.length !== 0) {
    if (getBackup) {
      element.text(nextButton.attr('backup-text'));
    } else {
      element.text(nextButton.text());
    }
  }
};

$(() => {
  $('.next-step').each((index, element) => {
    stepTextButton($(element));
  });
  $('.take-action').css('justify-content', 'flex-end'); // button styling
});

$('.next-step').on('click', (e) => {
  const button = $(e.currentTarget);
  let targetStep = Number.parseInt(button.attr('step'), 10);
  let canGoBack = false; //
  if (button.attr('go-back') === 'true') {
    button.attr('go-back', false);
  } else {
    canGoBack = true;
    targetStep += 1;
  }
  const elRefs = '#welcomeScene>div>div'; // page elements, if you want add new component, respect this structure
  const nextStepEls = $(`${elRefs}[step="${targetStep}"]`); // next step elements
  const nextStepButton = $(`.next-step[step="${targetStep}"]`);
  const previousStepButton = $(`.next-step[step="${targetStep - 1}"]`);
  // close the other windows when page change
  window.api.send(closeSettingWindow);
  window.api.send(closeToolsWindow);
  if (nextStepEls.length === 0) {
    window.api.send(openCollapsedWindow, true);
  } else {
    $(`${elRefs}[step!="${targetStep}"]`).hide();
    $('.next-step').hide();
    previousStepButton.text(previousStepButton.attr('backup-text'));
    if (canGoBack) {
      button.attr('go-back', true);
    } else {
      stepTextButton(button, true);
    }
    nextStepEls.show();
    nextStepButton.show();
    previousStepButton.show();
    if ($('.take-action').children('.next-step:visible').length === 1) {
      // button re-styling
      $('.take-action').css('justify-content', 'flex-end');
    } else {
      $('.take-action').css('justify-content', 'space-between');
    }
  }
});
$('#btn-options').on('click', () => {
  window.api.send(openSettingWindow);
});
$('#btn-tools').on('click', () => {
  window.api.send(openToolsWindow);
});
$('#btn-finish').on('click', () => {
  window.api.send(openCollapsedWindow, true);
});
