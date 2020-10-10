import "./system-wide";
import "../stylesheets/main.css";
import "../stylesheets/collapsed.css";
import { expandOnHover } from "./../helpers/settingKeys";

import { ipcRenderer } from "electron";

import { getSetting, getSettingReady, systemLog } from "../helpers/ipcActions";

const expandButton = document.getElementById("expandButton");
ipcRenderer.send(getSetting, expandOnHover);
ipcRenderer.on(getSettingReady, (err, expandOnHover) => {
  try {
    if (expandOnHover === true) {
      let openingTimeout = null;
      expandButton.addEventListener("mouseleave", () => {
        clearTimeout(openingTimeout); // if user gets there by accidently, don't expand the screen immediatly
        openingTimeout = null;
      });
      expandButton.addEventListener("mouseenter", () => {
        openingTimeout = setTimeout(() => {
          expand();
        }, 250);
      });
    } else {
      expandButton.addEventListener("click", () => {
        expand();
      });
    }
  } catch (e) {
    ipcRenderer.send(systemLog, "Hata: " + e.message);
  }
});
ipcRenderer.on("items:ready", (err, items) => {
  ipcRenderer.send("window:expand", items);
});

function expand() {
  const icon = document.getElementById("rocket");
  icon.classList.add("launch");
  ipcRenderer.send("system:scan:programs");
}
