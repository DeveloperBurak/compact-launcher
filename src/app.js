import "./stylesheets/main.css";
import "./stylesheets/collapsed.css";
import {ipcRenderer} from "electron";

const expandButton = document.getElementById('expandButton');
expandButton.addEventListener("mouseenter", e => {
  const icon = document.getElementById('rocket');
  icon.classList.add('launch');
  ipcRenderer.send("system:scan:programs");
}, {once: true});

ipcRenderer.on('items:ready', (err, items) => {
  ipcRenderer.send('window:expand', items);
});
