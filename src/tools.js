import "./stylesheets/main.css";
import "./stylesheets/settings.css";
import {ipcRenderer} from "electron";
import env from "env";
import $ from "jquery";

const tab = require('bootstrap').Tab;

$(document).ready(() => {
  const mainTab = $('#toolTab');
  mainTab.tab();

  $('#toolTab>li>a').on('click', (e) => {
    mainTab.find('li>a').removeClass('active');
    const button = $(e.currentTarget);
    // button.addClass('active');
    $(button).tab('show');
  })
  if (env.name !== 'development') {
    $('.development').hide();
  }
})
