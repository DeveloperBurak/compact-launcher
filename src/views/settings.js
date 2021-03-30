import { ipcRenderer } from 'electron'
import $ from 'jquery'
import { isDev } from '../helpers/env'
import * as ipc from '../strings/ipc'
import './app'
const tab = require('bootstrap').Tab

ipcRenderer.invoke(ipc.getAllSettings).then((settings) => {
  for (let key in settings) {
    const value = settings[key]
    let htmlSelector = $('#' + key)
    htmlSelector.val(value)
    if (htmlSelector.attr('type') === 'checkbox') {
      htmlSelector.attr('checked', value)
    }
  }
})

$(() => {
  $('#settingTab').tab()
  $('#settingTab>li>a').on('click', (e) => {
    $('#settingTab>li>a').removeClass('active')
    const button = $(e.currentTarget)
    $(button).tab('show')
  })
  if (isDev()) {
    $('.development').hide()
  }
  $('.input-setting').on('change', function (e) {
    ipcRenderer.send(ipc.setSetting, {
      key: $(e.currentTarget).attr('id'),
      value: $(this).prop('checked'),
    })
  })
  $('#autoLaunch').on('change', function () {
    ipcRenderer.send(ipc.setAutoLaunch, $(this).prop('checked'))
  })
  $('#alwaysOnTop').on('change', function () {
    ipcRenderer.send(ipc.setAlwaysOnTop, $(this).prop('checked'))
  })
})
