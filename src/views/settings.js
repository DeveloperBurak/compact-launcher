import "./system-wide";
import "../stylesheets/main.css";
import "../stylesheets/sub-windows.css";
import {
  ipcRenderer
} from "electron";
import env from "env";
import $ from "jquery";
import * as ipc from "../helpers/ipcActions";

const tab = require("bootstrap").Tab;
ipcRenderer.send(ipc.getSetting, null);
ipcRenderer.on(ipc.getSettingReady, (err, settings) => {
  for (let key in settings) {
    const value = settings[key];
    let htmlSelector = $("#" + key);
    htmlSelector.val(value);
    if (htmlSelector.attr("type") === "checkbox") {
      htmlSelector.attr("checked", value);
    }
  }
});

$(() => {
  $("#settingTab").tab();
  $("#settingTab>li>a").on("click", (e) => {
    $("#settingTab>li>a").removeClass("active");
    const button = $(e.currentTarget);
    // button.addClass('active');
    $(button).tab("show");
  });
  if (env.name !== "development") {
    $(".development").hide();
  }
  $('.input-setting').change(function (e) {
    ipcRenderer.send(ipc.setSetting, {
      key: $(e.currentTarget).attr('id'),
      value: $(this).prop("checked")
    });
  })
  $("#autoLaunch").change(function () {
    ipcRenderer.send(ipc.setAutoLaunch, $(this).prop("checked"));
  });
  $("#alwaysOnTop").change(function () {
    ipcRenderer.send(ipc.setAlwaysOnTop, $(this).prop("checked"));
  });
});
