import {app} from "electron";
import ActiveWindowTracker from "../system/ActiveWindowTracker";


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
    label: "Exit",
    click: () => {
      app.quit();
    },
  },
];
