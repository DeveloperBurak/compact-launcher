import "./system-wide";
import "./stylesheets/main.css";
import "./stylesheets/collapsed.css";
import {ipcRenderer} from "electron";
import {systemLog} from "./helpers/ipcActions";

const expandButton = document.getElementById('expandButton');
let openingTimeout = null;
expandButton.addEventListener("mouseenter", e => {
  openingTimeout = setTimeout(() => {
    const icon = document.getElementById('rocket');
    icon.classList.add('launch');
    ipcRenderer.send("system:scan:programs");
  },500)
});
expandButton.addEventListener("mouseleave", e => {
  clearTimeout(openingTimeout);
});
ipcRenderer.on('items:ready', (err, items) => {
  ipcRenderer.send('window:expand', items);
});

document.getElementById('test').addEventListener("click", e => {
  ipcRenderer.send(systemLog, 'clicked');
});
