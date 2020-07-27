import "./system-wide";
import "./stylesheets/main.css";
import "./stylesheets/sub-windows.css";
import { ipcRenderer } from "electron";
import env from "env";
import $ from "jquery";
import {
  systemLog,
  ipcSetAutoLaunch,
  ipcGetSetting,
  ipcGetSettingReady,
  ipcSetAlwaysOnTop
} from "./helpers/ipcActions";

const tab = require("bootstrap").Tab;
ipcRenderer.send(ipcGetSetting, null);
ipcRenderer.on(ipcGetSettingReady, (err, settings) => {
  for (let key in settings) {
    const value = settings[key];
    let htmlSelector = $("#" + key);
    htmlSelector.val(value);
    if (htmlSelector.attr("type") === "checkbox") {
      htmlSelector.attr("checked", value);
    }
  }
});

$(document).ready(() => {
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
  $("#autoLaunch").change(function () {
    ipcRenderer.send(ipcSetAutoLaunch, $(this).prop("checked"));
  });
  $("#alwaysOnTop").change(function () {
    ipcRenderer.send(ipcSetAlwaysOnTop, $(this).prop("checked"));
  });
});
