import "./system-wide";
import "../stylesheets/main.css";
import "../stylesheets/collapsed.css";
import {
  expandOnHover
} from './../helpers/settingKeys';

import {
  ipcRenderer
} from "electron";

import {
  getSetting,
  getSettingReady
} from "../helpers/ipcActions";

const expandButton = document.getElementById('expandButton');
ipcRenderer.send(getSetting, null);
ipcRenderer.on(getSettingReady, (err, settings) => {
  if (expandOnHover === true) {
    let openingTimeout = null;
    expandButton.addEventListener("mouseleave", e => {
      console.log(e);
      clearTimeout(openingTimeout);
      openingTimeout = null;
    });
    expandButton.addEventListener("mouseenter", e => {
      openingTimeout = setTimeout(() => {
        expand();
      }, 250)
    });
  } else if (settings[expandOnHover] === false) {
    expandButton.addEventListener("click", e => {
      expand();
    });
  }

});
ipcRenderer.on('items:ready', (err, items) => {
  ipcRenderer.send('window:expand', items);
});


function expand() {
  const icon = document.getElementById('rocket');
  icon.classList.add('launch');
  ipcRenderer.send("system:scan:programs");
}
