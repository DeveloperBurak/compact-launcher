import {app} from "electron";
import ActiveWindowTracker from "../system/ActiveWindowTracker";
import {openSettingsWindow} from "../system/WindowHandler";


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
      openSettingsWindow();
    }
  },
  {
    label: "Exit",
    click: () => {
      app.quit();
    },
  },
];
