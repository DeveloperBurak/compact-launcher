/* global $, window */

import * as ipc from '../strings/ipc';
import { isDev } from '../helpers/env';
import './app';

$(async () => {
  const settings = await window.api.invoke(ipc.getAllSettings);
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const key in settings) {
    const value = settings[key];
    const htmlSelector = $(`#${key}`);
    htmlSelector.val(value);
    if (htmlSelector.attr('type') === 'checkbox') {
      htmlSelector.attr('checked', value);
    }
  }
});

$(() => {
  $('#settingTab').tab();
  $('#settingTab>li>a').on('click', (e) => {
    $('#settingTab>li>a').removeClass('active');
    const button = $(e.currentTarget);
    $(button).tab('show');
  });
  if (isDev()) {
    $('.development').hide();
  }
  $('.input-setting').on('change', (e) => {
    window.api.send(ipc.setSetting, {
      key: $(e.currentTarget).attr('id'),
      value: $(e.currentTarget).prop('checked'),
    });
  });
  $('#autoLaunch').on('change', (e) => window.api.send(ipc.setAutoLaunch, $(e.currentTarget).prop('checked')));
  $('#alwaysOnTop').on('change', (e) => window.api.send(ipc.setAlwaysOnTop, $(e.currentTarget).prop('checked')));
});
