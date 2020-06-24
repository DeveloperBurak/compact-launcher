import "./stylesheets/main.css";
import "./stylesheets/collapsed.css";
import {ipcRenderer} from "electron";
import {systemLog} from "./helpers/ipcActions";

const expandButton = document.getElementById('expandButton');
expandButton.addEventListener("mouseenter", e => {
  const icon = document.getElementById('rocket');
  icon.classList.add('launch');
  ipcRenderer.send("system:scan:programs");
}, {once: true});

ipcRenderer.on('items:ready', (err, items) => {
  ipcRenderer.send('window:expand', items);
});

document.getElementById('test').addEventListener("click", e => {
  ipcRenderer.send(systemLog, 'clicked');
});
