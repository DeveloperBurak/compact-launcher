import {app} from "electron";
import ActiveWindowTracker from "../system/ActiveWindowTracker";
import {settingWindow} from "../background";


export const trayMenuTemplate = [
  {
    label: "Add Foreground Program",
    click: () => {
      ActiveWindowTracker.addProgram();
    }
  },
  {
    label: "Remove Foreground Program",
    click: () => {
      ActiveWindowTracker.removeProgram();
    }
  },
  {
    label: "Settings",
    click: () => {
      settingWindow();
    }
  },
  {
    label: "Exit",
    click: () => {
      app.quit();
    },
  },
];
